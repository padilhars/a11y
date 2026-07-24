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
    And I click on "#local-a11y-panel [data-category-id='typography'] [data-action='toggle-category']" "css_element"
    And I click on "#local-a11y-panel [data-option-id='textSize']" "css_element"
    And I click on "#local-a11y-panel [data-option-id='textSize']" "css_element"
    Then I should see "Médio" in the "#local-a11y-panel [data-option-id='textSize']" "css_element"
    And "body.a11y-text-size-2" "css_element" should exist
    When I reload the page
    And I click on "#local-a11y-fab" "css_element"
    Then I should see "Médio" in the "#local-a11y-panel [data-option-id='textSize']" "css_element"
    And "body.a11y-text-size-2" "css_element" should exist

  Scenario: Applying the Dyslexia profile shows the active profile banner and body classes
    Given I click on "#local-a11y-fab" "css_element"
    When I click on "#local-a11y-panel [data-profile-id='dyslexia']" "css_element"
    Then I should see "Dislexia" in the "[data-region='active-profile']" "css_element"
    And "body.a11y-dyslexic-font" "css_element" should exist
    And "body.a11y-line-height-2" "css_element" should exist
    And "body.a11y-text-spacing-2" "css_element" should exist
    When I click on "#local-a11y-panel [data-profile-id='dyslexia']" "css_element"
    Then "[data-region='active-profile']" "css_element" should not be visible
    And "body.a11y-dyslexic-font" "css_element" should not exist
