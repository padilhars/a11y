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
    And "body.a11y-dyslexic-font" "css_element" should exist
    And "body.a11y-line-height-2" "css_element" should exist
    And "body.a11y-text-spacing-2" "css_element" should exist
    When I click on "#local-a11y-panel [data-profile-id='dyslexia']" "css_element"
    Then "#local-a11y-panel [data-profile-id='dyslexia'].local-a11y-profile-card--active" "css_element" should not exist
    And "#local-a11y-panel [data-region='reset-button'][disabled]" "css_element" should exist
    And "body.a11y-dyslexic-font" "css_element" should not exist
