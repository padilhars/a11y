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

  Scenario: With local_vlibras installed and the integration switched on, the panel reveals its widget
    # local_vlibras itself is a separate plugin - this scenario only runs
    # meaningfully on a Behat site where it's actually installed (see
    # DECISIONS.md D54). On a site without it, "the following config
    # values are set as admin" for local_vlibras/enabled below has nothing
    # to configure and this scenario should be skipped, not treated as a
    # failure of local_a11y itself.
    Given the following config values are set as admin:
      | enabled | 1 | local_vlibras |
      | position | R | local_vlibras |
      | integratevlibras | 1 | local_a11y |
    And I log in as "admin"
    And I am on "A11y course" course homepage
    Then "#vlibras-access-wrapper" "css_element" should exist
    And "body.a11y-vlibras-integrated" "css_element" should exist
    # VLibras' own button stays in the DOM (never removed - see
    # classes/integration/vlibras.php's own docblock on why) but hidden by
    # our CSS by default.
    And "#vlibras-access-wrapper" "css_element" should not be visible
    When I click on "#local-a11y-fab" "css_element"
    Then "#local-a11y-panel [data-option-id='signLanguage']" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='signLanguage']" "css_element"
    Then "body.a11y-sign-language" "css_element" should exist
    # Still the exact same DOM node local_vlibras rendered - only display
    # changed, nothing about VLibras' own widget was touched or rebuilt.
    And "#vlibras-access-wrapper" "css_element" should exist
    And "#vlibras-access-wrapper" "css_element" should be visible
    # D57: the toggle also simulates a click on VLibras' own button (see
    # amd/src/vlibras_integration.js), opening its avatar interface -
    # #vlibras-app-root - not just revealing the idle button above. Not
    # asserted here: Behat has no built-in step to reach into an element's
    # shadow root, and the element only appears once VLibras' remote script
    # finishes an asynchronous, multi-second load (verified live via
    # Puppeteer instead - see DECISIONS.md D57 - not by this scenario).
    When I click on "#local-a11y-panel [data-option-id='signLanguage']" "css_element"
    Then "body.a11y-sign-language" "css_element" should not exist
    And "#vlibras-access-wrapper" "css_element" should not be visible
