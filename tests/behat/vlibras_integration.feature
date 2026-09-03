@local @local_a11y @javascript
Feature: VLibras integration
  In order to reach VLibras (Libras/Brazilian Sign Language translation)
  through one consistent panel instead of a second floating button
  As a user
  I need the "Libras (VLibras)" option to appear only when the site
  actually has local_vlibras installed and this plugin is configured to
  integrate with it, and to be able to reveal/hide VLibras' own button
  from there without it ever breaking

  Background:
    Given the following "courses" exist:
      | fullname | shortname | category |
      | A11y course | A11Y1 | 0 |

  Scenario: Without local_vlibras installed, the panel never offers a Sign Language option
    Given I log in as "admin"
    And I am on "A11y course" course homepage
    When I click on "#local-a11y-fab" "css_element"
    Then "#local-a11y-panel [data-option-id='signLanguage']" "css_element" should not exist
    And "body.a11y-vlibras-integrated" "css_element" should not exist

  @vlibras
  Scenario: With local_vlibras installed and the integration switched on, the panel reveals its widget
    # local_vlibras itself is a separate plugin - this scenario only runs
    # meaningfully on a Behat site where it's actually installed (see
    # DECISIONS.md D54). On a site without it, "the following config
    # values are set as admin" for local_vlibras/enabled below has nothing
    # to configure and this scenario should be skipped, not treated as a
    # failure of local_a11y itself. Tagged @vlibras so CI (which never
    # installs the third-party local_vlibras plugin) can exclude it via
    # --tags="@local_a11y&&~@vlibras" instead of failing on it - see
    # DECISIONS.md D72.
    #
    # D78, root cause finally found and fixed: this scenario never actually
    # ran end-to-end before, on ANY Behat site with local_vlibras present -
    # not a cache problem (checked and ruled out: core_component's own
    # cache, the plugin's version row in config_plugins, is_installed(),
    # is_available() and integration_enabled() were all already correct and
    # fresh). The real cause: local_a11y/enabledfeatures - a persisted list
    # of enabled option ids - was saved at some point before local_vlibras
    # was ever available on this site, so it could never have included
    # "signLanguage" (a conditional 30th entry options::all() only adds
    # when vlibras::is_integrated() is true - see classes/options.php).
    # Resetting it to '' here makes config::enabled_features() fall back to
    # "every option in manager::get_default_settings() right now" (see
    # classes/config.php) - which, by the time this step runs, already
    # includes signLanguage, since the two config values above just turned
    # is_integrated() true. Confirmed via a temporary debug string injected
    # into panel.php's rendered output during this investigation (removed
    # again immediately after) that every other check here already
    # returned true - only this one stale list was ever wrong.
    Given the following config values are set as admin:
      | enabled | 1 | local_vlibras |
      | position | R | local_vlibras |
      | integratevlibras | 1 | local_a11y |
      | enabledfeatures |  | local_a11y |
    And I log in as "admin"
    And I am on "A11y course" course homepage
    Then "#vlibras-access-wrapper" "css_element" should exist
    And "body.a11y-vlibras-integrated" "css_element" should exist
    # VLibras' own button stays in the DOM (never removed - see
    # classes/integration/vlibras.php's own docblock on why) but hidden by
    # our CSS by default.
    And "#vlibras-access-wrapper" "css_element" should not be visible
    When I click on "#local-a11y-fab" "css_element"
    # signLanguage lives in the "media" category, closed by default
    # (classes/options.php::category_default_open()) - same reason every
    # other scenario touching a non-typography option expands its category
    # first (see the Magnifier/Hide Images/Contrast scenarios above).
    And I click on "#local-a11y-panel [data-category-id='media'] [data-action='toggle-category']" "css_element"
    Then "#local-a11y-panel [data-option-id='signLanguage']" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='signLanguage']" "css_element"
    Then "body.a11y-sign-language" "css_element" should exist
    # Still the exact same DOM node local_vlibras rendered - only display
    # changed, nothing about VLibras' own widget was touched or rebuilt.
    And "#vlibras-access-wrapper" "css_element" should exist
    # D78, second root cause found and fixed (the first was the
    # enabledfeatures value above): this scenario asserted the WRONG element
    # would stay visible here. attemptOpen() (amd/src/vlibras_integration.js)
    # does click VLibras' own idle button synchronously - confirmed live via
    # a temporary WebDriver probe during this investigation - but that click
    # is exactly what makes VLibras collapse its OWN idle bubble inside
    # #vlibras-access-wrapper's shadow root (by VLibras' own design: the
    # trigger disappears once the avatar opens, the same way a hamburger
    # icon commonly swaps for a close icon). #vlibras-access-wrapper's
    # computed `display` genuinely stays "block" (our CSS rule), but with no
    # visible shadow content left inside it, it collapses to zero width and
    # height - which Mink's/Selenium's isDisplayed() correctly reports as
    # not visible. That was never a timing issue (the probe found
    # #vlibras-app-root already present with 0ms delay - Behat's own
    # "should exist" steps already retry for several seconds on their own
    # besides), so no wait belongs here at all.
    #
    # The actually meaningful, working result of this click - and what D57
    # set out to verify - is #vlibras-app-root (VLibras' avatar interface)
    # appearing, asserted directly below instead. It only gets a "should
    # exist" check, not "should be visible": the same probe found
    # #vlibras-app-root ITSELF is, structurally, the exact same kind of
    # element as #vlibras-access-wrapper - a zero-size shadow-DOM host
    # (confirmed live: getBoundingClientRect() reports 0 height) whose real,
    # rendered UI lives deeper inside its shadow tree via fixed positioning,
    # escaping the host's own box entirely. That is a legitimate, common
    # pattern for this kind of overlay widget, not a bug - but it does mean
    # Mink's isDisplayed() (which requires the checked element itself to
    # have non-zero rendered dimensions) can never return true for either of
    # VLibras' host elements while they're genuinely open.
    And "#vlibras-app-root" "css_element" should exist
    # D78: the scenario deliberately stops here instead of also exercising
    # the close half of the cycle (turning signLanguage back off again by
    # re-clicking the panel toggle). Confirmed live, not assumed: once the
    # avatar is open, #vlibras-app-root's own invisible root div covers the
    # ENTIRE viewport at z-index 2147483647 (the maximum possible value) and
    # intercepts every click on the page - including on our own panel/FAB -
    # the same way in a real browser as in Behat (this is VLibras' own CSS,
    # not a headless-only artifact; clicking the overlay itself was also
    # tried and does nothing - there is no click-outside-to-close). This is
    # not a defect introduced by this plugin or this refactor: it is exactly
    # why amd/src/vlibras_integration.js's attemptClose() already closes the
    # avatar by calling .click() directly on a JS *reference* to VLibras' own
    # "Fechar" button inside #vlibras-app-root's shadow root (bypassing
    # normal point-based hit-testing entirely) rather than depending on our
    # panel toggle being reachable - and why watchForCloseButton() wires a
    # listener onto that same button so a real user closing the avatar
    # through VLibras' own UI turns signLanguage back off on our side too.
    # In other words: a real user cannot reopen this plugin's panel and
    # click signLanguage off again while VLibras' avatar is on screen either
    # - the supported close path is VLibras' own close button, which is by
    # design the only element left clickable above its own overlay.
    # Behat/Mink has no built-in step that can reach into an open shadow
    # root to click that button the way attemptClose() does, so verifying
    # the close half end-to-end would need new custom step infrastructure
    # (a behat_local_a11y.php context), not just a feature-file change -
    # out of scope for this pass. Tracked as a known, deliberate limitation
    # rather than left silently uncovered.
