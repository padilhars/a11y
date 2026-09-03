@local @local_a11y @javascript
Feature: Accessibility panel
  In order to use the site more comfortably
  As a user
  I need to open the accessibility panel, change an option or apply a
  profile, and have my choice remembered across pages

  Background:
    Given the following "courses" exist:
      | fullname | shortname | category |
      | A11y course | A11Y1 | 0 |
    And I log in as "admin"
    And I am on "A11y course" course homepage

  Scenario: Changing the text size persists after reloading the page
    Given I click on "#local-a11y-fab" "css_element"
    # Texto e Tipografia is open by default (classes/options.php::category_default_open())
    # - no toggle-category click needed/wanted here; clicking it would close an
    # already-open category and make the option row underneath un-interactable.
    And I click on "#local-a11y-panel [data-option-id='textSize']" "css_element"
    And I click on "#local-a11y-panel [data-option-id='textSize']" "css_element"
    Then I should see "Medium" in the "#local-a11y-panel [data-option-id='textSize']" "css_element"
    And "body.a11y-text-size-2" "css_element" should exist
    When I reload the page
    And I click on "#local-a11y-fab" "css_element"
    Then I should see "Medium" in the "#local-a11y-panel [data-option-id='textSize']" "css_element"
    And "body.a11y-text-size-2" "css_element" should exist

  Scenario: Applying the Dyslexia profile marks the card active, colours the reset button and sets body classes
    Given I click on "#local-a11y-fab" "css_element"
    When I click on "#local-a11y-panel [data-profile-id='dyslexia']" "css_element"
    Then "#local-a11y-panel [data-profile-id='dyslexia'].local-a11y-profile-card--active" "css_element" should exist
    And "#local-a11y-panel [data-region='reset-button'].local-a11y-panel__reset-icon--active" "css_element" should exist
    And "body.a11y-dyslexic-font-1" "css_element" should exist
    And "body.a11y-line-height-2" "css_element" should exist
    And "body.a11y-text-spacing-2" "css_element" should exist
    When I click on "#local-a11y-panel [data-profile-id='dyslexia']" "css_element"
    Then "#local-a11y-panel [data-profile-id='dyslexia'].local-a11y-profile-card--active" "css_element" should not exist
    And "#local-a11y-panel [data-region='reset-button'][disabled]" "css_element" should exist
    And "body.a11y-dyslexic-font-1" "css_element" should not exist

  # Regression test for DECISIONS.md D51: the Magnifier's internal clone of
  # #page used to lose its own `id="page"` (stripped by D42's original
  # cloning code), which silently broke the active theme's own
  # #page-scoped layout CSS *only* inside the clone - it rendered far wider
  # than the real page and drifted out of sync with it the further down the
  # page you looked. This scenario exists so that regression can never be
  # silently reintroduced again without a test failing. It does NOT cover
  # D49 (padding copy) or D50 (pointer clamping to #page's bounds) - those
  # are about exact pixel values, not DOM structure, and are not practical
  # to assert with Behat's generic steps (quality/performance audit,
  # audit/03-qualidade-desempenho.md section 4.4).
  #
  # Also exercises the lazy-loading of amd/src/magnifier.js itself
  # (quality/performance audit finding #1, fixed in amd/src/main.js): this
  # module is no longer a static dependency of local_a11y/main, so this
  # scenario is the one place in the suite that proves import() actually
  # fetches and runs it correctly on first activation, not just that the
  # option row exists.
  # D77: quality/performance audit finding (audit/03-qualidade-desempenho.md
  # section 4.2) - continuing to close the "83% of options untested" gap.
  # These 4 are simple boolean toggles in Typography (default-open category,
  # classes/manager.php::get_boolean_class_map()) with no cross-option
  # interaction to worry about, unlike Hide Images/Focus Mode above.
  Scenario: Typography toggles set their body classes independently
    Given I click on "#local-a11y-fab" "css_element"
    When I click on "#local-a11y-panel [data-option-id='readableFont']" "css_element"
    Then "body.a11y-readable-font" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='highlightTitles']" "css_element"
    Then "body.a11y-highlight-titles" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='highlightLinks']" "css_element"
    Then "body.a11y-highlight-links" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='highlightButtons']" "css_element"
    Then "body.a11y-highlight-buttons" "css_element" should exist
    # All 4 still on at once - confirms they don't clobber each other's class.
    And "body.a11y-readable-font.a11y-highlight-titles.a11y-highlight-links.a11y-highlight-buttons" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='readableFont']" "css_element"
    Then "body.a11y-readable-font" "css_element" should not exist
    And "body.a11y-highlight-titles" "css_element" should exist

  # D77: Word Spacing (max 3) and Text Alignment (max 4) - the two
  # Typography steppers with no coverage yet.
  Scenario: Word Spacing and Text Alignment cycle through their levels
    Given I click on "#local-a11y-fab" "css_element"
    When I click on "#local-a11y-panel [data-option-id='wordSpacing']" "css_element"
    Then "body.a11y-word-spacing-1" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='wordSpacing']" "css_element"
    And I click on "#local-a11y-panel [data-option-id='wordSpacing']" "css_element"
    And I click on "#local-a11y-panel [data-option-id='wordSpacing']" "css_element"
    Then "body.a11y-word-spacing-3" "css_element" should not exist
    And "body.a11y-word-spacing-1" "css_element" should not exist
    When I click on "#local-a11y-panel [data-option-id='textAlign']" "css_element"
    Then "body.a11y-text-align-1" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='textAlign']" "css_element"
    Then "body.a11y-text-align-2" "css_element" should exist
    And "body.a11y-text-align-1" "css_element" should not exist

  # D77: color category (closed by default) - Invert Colors (toggle) plus
  # the 3 remaining steppers there (Saturation, Blue Light Filter, Color
  # Change/daltonismo).
  Scenario: Color category options all set their expected body classes
    Given I click on "#local-a11y-fab" "css_element"
    And I click on "#local-a11y-panel [data-category-id='color'] [data-action='toggle-category']" "css_element"
    When I click on "#local-a11y-panel [data-option-id='invertColors']" "css_element"
    Then "body.a11y-invert" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='saturation']" "css_element"
    Then "body.a11y-saturation-1" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='blueLightFilter']" "css_element"
    Then "body.a11y-bluelight-1" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='colorChange']" "css_element"
    Then "body.a11y-color-1" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='colorChange']" "css_element"
    Then "body.a11y-color-2" "css_element" should exist
    And "body.a11y-color-1" "css_element" should not exist

  # D77: Pause Animations (media, boolean) and Cursor (navigation, stepper,
  # max 2) - the last 2 options with a direct body-class effect and no
  # coverage yet.
  Scenario: Pause Animations and Cursor set their body classes
    Given I click on "#local-a11y-fab" "css_element"
    And I click on "#local-a11y-panel [data-category-id='media'] [data-action='toggle-category']" "css_element"
    When I click on "#local-a11y-panel [data-option-id='pauseAnimations']" "css_element"
    Then "body.a11y-pause-animations" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='pauseAnimations']" "css_element"
    Then "body.a11y-pause-animations" "css_element" should not exist
    And I click on "#local-a11y-panel [data-category-id='navigation'] [data-action='toggle-category']" "css_element"
    When I click on "#local-a11y-panel [data-option-id='cursor']" "css_element"
    Then "body.a11y-cursor-1" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='cursor']" "css_element"
    Then "body.a11y-cursor-2" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='cursor']" "css_element"
    Then "body.a11y-cursor-1" "css_element" should not exist
    And "body.a11y-cursor-2" "css_element" should not exist

  # D76: quality/performance audit finding (audit/03-qualidade-desempenho.md
  # section 4.2) - 83% of options had no behavioural test at all. Hide
  # Images is a simple boolean toggle, but it is also the option a real bug
  # (D75 - embedded YouTube/Vimeo iframes were never actually hidden) was
  # just found and fixed in, so its basic on/off body-class wiring is worth
  # guarding permanently, even though the iframe-specific CSS selector
  # itself isn't practical to assert here (no YouTube/Vimeo embed exists on
  # a plain course homepage - that was verified live via WebDriver instead,
  # see DECISIONS.md D75).
  Scenario: Hide Images toggles its body class on and off
    Given I click on "#local-a11y-fab" "css_element"
    And I click on "#local-a11y-panel [data-category-id='media'] [data-action='toggle-category']" "css_element"
    When I click on "#local-a11y-panel [data-option-id='hideImages']" "css_element"
    Then "body.a11y-hide-images" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='hideImages']" "css_element"
    Then "body.a11y-hide-images" "css_element" should not exist

  # D76: Contrast is a 3-level stepper (classes/options.php), never covered
  # by any behavioural test before this - the existing stepper coverage
  # (textSize) is typography, a different category with different
  # expand/collapse state, so this also exercises the "color" category not
  # being open by default (classes/options.php::category_default_open()).
  Scenario: Contrast cycles through its levels and updates the body class
    Given I click on "#local-a11y-fab" "css_element"
    And I click on "#local-a11y-panel [data-category-id='color'] [data-action='toggle-category']" "css_element"
    When I click on "#local-a11y-panel [data-option-id='contrast']" "css_element"
    Then "body.a11y-contrast-1" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='contrast']" "css_element"
    Then "body.a11y-contrast-2" "css_element" should exist
    And "body.a11y-contrast-1" "css_element" should not exist
    When I click on "#local-a11y-panel [data-option-id='contrast']" "css_element"
    Then "body.a11y-contrast-3" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='contrast']" "css_element"
    Then "body.a11y-contrast-3" "css_element" should not exist

  # D76: regression test for the real behavioural coupling documented in
  # CHANGELOG.md/DECISIONS.md D52 - Focus Mode level 3 ("Text only") forces
  # Hide Images on (classes/output/panel.php:96,106 - $hideimagesforced),
  # rendering it active-but-disabled (templates/option_toggle.mustache's
  # "forced"/"disabled" flags) instead of silently leaving its switch
  # showing "off" while images are, in fact, still hidden by Focus Mode's
  # own CSS (styles.css - body.a11y-focus-mode-3 hides img/video/iframe
  # directly, independent of the a11y-hide-images class). Nothing in the
  # existing suite exercised this cross-option interaction before now.
  Scenario: Focus Mode level 3 forces Hide Images on, and releases it when turned back off
    Given I click on "#local-a11y-fab" "css_element"
    # Categories stay independently open once expanded (amd/src/panel.js::toggleCategory()
    # is not an accordion) - opening both up front means neither needs to be
    # re-toggled between the focusMode and hideImages assertions below.
    And I click on "#local-a11y-panel [data-category-id='navigation'] [data-action='toggle-category']" "css_element"
    And I click on "#local-a11y-panel [data-category-id='media'] [data-action='toggle-category']" "css_element"
    When I click on "#local-a11y-panel [data-option-id='focusMode']" "css_element"
    And I click on "#local-a11y-panel [data-option-id='focusMode']" "css_element"
    And I click on "#local-a11y-panel [data-option-id='focusMode']" "css_element"
    Then "body.a11y-focus-mode-3" "css_element" should exist
    And "#local-a11y-panel [data-option-id='hideImages'].local-a11y-option--forced" "css_element" should exist
    And "#local-a11y-panel [data-option-id='hideImages'] [data-region='switch'][disabled]" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='focusMode']" "css_element"
    Then "body.a11y-focus-mode-3" "css_element" should not exist
    And "#local-a11y-panel [data-option-id='hideImages'].local-a11y-option--forced" "css_element" should not exist

  Scenario: Magnifier clone keeps #page's id, and the option can be turned off again
    Given I click on "#local-a11y-fab" "css_element"
    And I click on "#local-a11y-panel [data-category-id='navigation'] [data-action='toggle-category']" "css_element"
    And I click on "#local-a11y-panel [data-option-id='magnifier']" "css_element"
    Then ".local-a11y-magnifier" "css_element" should exist
    And ".local-a11y-magnifier__content #page" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='magnifier']" "css_element"
    Then ".local-a11y-magnifier" "css_element" should not exist
