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

  # D78, round 2: the remaining 9 options with no test yet are all
  # "JS-behavioural-only" - manager.php::get_boolean_class_map()'s own
  # docblock explicitly excludes all 9 (tooltips, silenceMedia,
  # bionicReading, readingGuide, readingMask, screenReader,
  # virtualKeyboard, voiceCommands, faceNavigation) because none of them
  # drive a body class at all - they gate always-mounted JS overlay
  # components instead. That's the reason D77 left them out (no cheap
  # "click and check body class" signal exists for any of them) and the
  # reason every scenario below asserts a DOM marker specific to each
  # option's own overlay instead of a body class. Two of the 9 (Voice
  # Commands, Face Navigation) also need a real device permission; the
  # other 7 don't and turn out to be straightforwardly testable once the
  # right marker for each is identified - Tooltips here first:
  # #local-a11y-fab has an aria-label (tooltips.js's own SELECTOR includes
  # "[aria-label]"), so hovering it is enough to trigger one, no fixture
  # content needed. Silence Media needs an actual <audio>/<video> to act
  # on, which no course homepage has by default - the custom
  # "I insert a test autoplaying video" step (tests/behat/
  # behat_local_a11y.php) exists for exactly this; shouldSilence()
  # (amd/src/silence_media.js) only checks the `autoplay` property, never
  # real playback, so no actual video file is needed either.
  Scenario: Tooltips shows a bubble on hover, Silence Media mutes an autoplaying video
    Given I click on "#local-a11y-fab" "css_element"
    And I click on "#local-a11y-panel [data-category-id='media'] [data-action='toggle-category']" "css_element"
    When I click on "#local-a11y-panel [data-option-id='tooltips']" "css_element"
    And I hover "#local-a11y-fab" "css_element"
    Then "#local-a11y-tooltip" "css_element" should exist
    Given I insert a test autoplaying video into the page
    When I click on "#local-a11y-panel [data-option-id='silenceMedia']" "css_element"
    Then the test video should be muted

  # D78, round 2: Reading Guide and Reading Mask both build their overlay
  # element(s) synchronously in start() (amd/src/reading_guide.js,
  # amd/src/reading_mask.js) - they don't wait for a first mousemove, so
  # "should exist" right after the toggle is enough, no need to simulate
  # mouse movement over the page.
  Scenario: Reading Guide and Reading Mask create their overlay elements
    Given I click on "#local-a11y-fab" "css_element"
    And I click on "#local-a11y-panel [data-category-id='navigation'] [data-action='toggle-category']" "css_element"
    When I click on "#local-a11y-panel [data-option-id='readingGuide']" "css_element"
    Then ".local-a11y-reading-guide" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='readingGuide']" "css_element"
    Then ".local-a11y-reading-guide" "css_element" should not exist
    When I click on "#local-a11y-panel [data-option-id='readingMask']" "css_element"
    Then ".local-a11y-reading-mask-top" "css_element" should exist
    And ".local-a11y-reading-mask-bottom" "css_element" should exist

  # D78, round 2: Screen Reader and Virtual Keyboard both build their
  # overlay (a status pill / an on-screen keyboard) synchronously in
  # start() too - same reasoning as the scenario above, no interaction
  # with the overlay's own content needed to prove it exists.
  Scenario: Screen Reader and Virtual Keyboard create their overlay elements
    Given I click on "#local-a11y-fab" "css_element"
    And I click on "#local-a11y-panel [data-category-id='advanced'] [data-action='toggle-category']" "css_element"
    When I click on "#local-a11y-panel [data-option-id='screenReader']" "css_element"
    Then ".local-a11y-sr-pill" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='screenReader']" "css_element"
    Then ".local-a11y-sr-pill" "css_element" should not exist
    When I click on "#local-a11y-panel [data-option-id='virtualKeyboard']" "css_element"
    Then ".local-a11y-vk" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='virtualKeyboard']" "css_element"
    Then ".local-a11y-vk" "css_element" should not exist

  # D78, round 2: Voice Commands is the one option of these 9 that, at
  # first glance, looks like it needs real microphone permission - it
  # doesn't. start() (amd/src/voice_commands.js) builds its status pill
  # synchronously, straight after the one-time privacy window.confirm()
  # is accepted, *before* recognition.start() is even called - so the
  # pill appearing never actually depends on the browser's SpeechRecognition
  # engine, a real microphone, or any permission grant succeeding. The one
  # real obstacle is the window.confirm() dialog itself, which generic
  # Behat steps cannot reliably answer inline - solved the same way
  # amd/src/face_navigation.js's own equivalent dialog would be: the custom
  # "I have acknowledged the accessibility privacy notices" step
  # pre-writes the same localStorage key rememberPrivacyAck() uses, so
  # hasAcknowledgedPrivacyNotice() is already true and start() never shows
  # the dialog at all on this run.
  Scenario: Voice Commands creates its status pill once its privacy notice is acknowledged
    Given I have acknowledged the accessibility privacy notices
    And I click on "#local-a11y-fab" "css_element"
    And I click on "#local-a11y-panel [data-category-id='advanced'] [data-action='toggle-category']" "css_element"
    When I click on "#local-a11y-panel [data-option-id='voiceCommands']" "css_element"
    Then ".local-a11y-sr-pill" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='voiceCommands']" "css_element"
    Then ".local-a11y-sr-pill" "css_element" should not exist

  # D78, round 2: Bionic Reading (typography, open by default) runs its
  # first pass synchronously in start() (amd/src/bionic_reading.js) before
  # any MutationObserver/idle-callback chunking kicks in for content added
  # later - the course homepage's own heading/text content already present
  # at toggle time is enough to produce at least one wrapped word.
  Scenario: Bionic Reading wraps existing page text in bold-start spans
    Given I click on "#local-a11y-fab" "css_element"
    When I click on "#local-a11y-panel [data-option-id='bionicReading']" "css_element"
    Then ".local-a11y-br" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='bionicReading']" "css_element"
    Then ".local-a11y-br" "css_element" should not exist

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

  # D85: Widen Content is a plain 3-level stepper like Contrast/Word
  # Spacing above (min-width override on .main-inner, see styles.css) -
  # no cross-option coupling to test, just the level cycling and wrap.
  Scenario: Widen Content cycles through its levels and wraps back to off
    Given I click on "#local-a11y-fab" "css_element"
    And I click on "#local-a11y-panel [data-category-id='navigation'] [data-action='toggle-category']" "css_element"
    When I click on "#local-a11y-panel [data-option-id='contentWidth']" "css_element"
    Then "body.a11y-content-width-1" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='contentWidth']" "css_element"
    Then "body.a11y-content-width-2" "css_element" should exist
    And "body.a11y-content-width-1" "css_element" should not exist
    When I click on "#local-a11y-panel [data-option-id='contentWidth']" "css_element"
    Then "body.a11y-content-width-3" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='contentWidth']" "css_element"
    Then "body.a11y-content-width-3" "css_element" should not exist
    And "body.a11y-content-width-1" "css_element" should not exist

  Scenario: Magnifier clone keeps #page's id, and the option can be turned off again
    Given I click on "#local-a11y-fab" "css_element"
    And I click on "#local-a11y-panel [data-category-id='navigation'] [data-action='toggle-category']" "css_element"
    And I click on "#local-a11y-panel [data-option-id='magnifier']" "css_element"
    Then ".local-a11y-magnifier" "css_element" should exist
    And ".local-a11y-magnifier__content #page" "css_element" should exist
    When I click on "#local-a11y-panel [data-option-id='magnifier']" "css_element"
    Then ".local-a11y-magnifier" "css_element" should not exist

  # D79, round 2: Face Navigation is the last of the 30 options with no
  # behavioural test, and stays that way here - not for lack of trying.
  # A scenario mirroring the one above (privacy-notice pre-ack, open the
  # panel, toggle the option, wait for the calibration HUD) was written
  # and tried after adding use-fake-device-for-media-stream/use-fake-ui-
  # for-media-stream to $CFG->behat_profiles' Chrome args (config.php,
  # outside this repo - a QA-environment-only change), which does make
  # getUserMedia() resolve with a synthetic camera instead of hanging on a
  # real permission prompt. It still fails, for an entirely different,
  # pre-existing reason unrelated to the camera: this Behat site serves
  # over plain HTTP (behat_wwwroot), not HTTPS, so `crypto.subtle` is
  # undefined here (a secure-context-only Web API) - and
  # fetchVerifiedBytes() (amd/src/face_navigation.js, added in D62's
  # TOCTOU fix, long before this round) depends on it to hash-verify
  # vision_bundle.mjs/the model before use. Confirmed via Behat's own
  # faildump, not assumed: the HUD shows "Failed to start" /
  # "Cannot read properties of undefined (reading 'digest')" every time,
  # on this Behat site specifically. This is the same HTTP-vs-HTTPS gap
  # already known from earlier in this project's history for this exact
  # module - not a new defect, and not something to work around by
  # weakening the integrity check just to make a test pass here. The
  # feature itself is already verified working end-to-end against the
  # real, HTTPS production site via WebDriver (HUD reaches "Calibrate"
  # with a live video preview in ~5s - see DECISIONS.md D79) - that live
  # verification, not a Behat scenario, is this option's regression
  # coverage until (if ever) this Behat site is also served over HTTPS.
