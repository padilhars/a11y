<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Custom Behat step definitions for local_a11y (D78, round 2).
 *
 * Both steps here exist because the generic Moodle Behat vocabulary
 * genuinely cannot express them:
 *
 * - closing VLibras' avatar means clicking a button inside an *open shadow
 *   root* (`local_vlibras`'s own `#vlibras-app-root`) - CSS selectors used
 *   by "I click on ... css_element" cannot pierce a shadow boundary, only
 *   plain JS can (`element.shadowRoot.querySelector(...)`).
 * - pre-acknowledging the one-time privacy notices (Face Navigation,
 *   Voice Commands) means writing to `localStorage` before the option is
 *   ever toggled on - there is no generic "set local storage" step, and
 *   without this, Behat would have to answer a real `window.confirm()`
 *   (Voice Commands) or a custom on-page dialog (Face Navigation) inline,
 *   which is exactly the kind of interaction generic click/see steps
 *   cannot reliably drive.
 *
 * @package    local_a11y
 * @category   test
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(__DIR__ . '/../../../../lib/behat/behat_base.php');

use Behat\Mink\Exception\ExpectationException;

/**
 * Step definitions specific to local_a11y.
 *
 * @package    local_a11y
 * @category   test
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class behat_local_a11y extends behat_base {

    /**
     * Mirrors classes/integration/vlibras.php::APP_ROOT_SELECTOR - VLibras'
     * own avatar/interpreter UI host, built the first time its idle button
     * is clicked (see amd/src/vlibras_integration.js::attemptOpen()).
     *
     * @var string
     */
    const APP_ROOT_SELECTOR = '#vlibras-app-root';

    /**
     * Mirrors classes/integration/vlibras.php::CLOSE_BUTTON_ARIA_LABEL.
     *
     * @var string
     */
    const CLOSE_BUTTON_ARIA_LABEL = 'fechar';

    /**
     * How long to poll for VLibras' own close button before giving up -
     * matches CLOSE_BUTTON_MAX_WAIT_MS in amd/src/vlibras_integration.js
     * (measured live there: the avatar's full interface, including this
     * button, can take up to ~8s to finish rendering the first time).
     *
     * @var int
     */
    const CLOSE_BUTTON_MAX_WAIT_SECONDS = 15;

    /**
     * Click VLibras' own "Fechar" (close) button inside #vlibras-app-root's
     * open shadow root - the same element and lookup
     * amd/src/vlibras_integration.js::findCloseButton() uses at runtime,
     * reimplemented here in raw JS via Behat's own executeScript() because
     * Mink's CSS selector engine cannot reach into a shadow root. Polls
     * (rather than looking up once) for the same reason
     * pollForCloseButton() does: the avatar's own interface can still be
     * mid-render the moment this step runs.
     *
     * @Given /^I close the VLibras avatar through its own interface$/
     * @throws ExpectationException if the close button never appears within CLOSE_BUTTON_MAX_WAIT_SECONDS.
     */
    public function i_close_the_vlibras_avatar_through_its_own_interface(): void {
        $session = $this->getSession();
        $deadline = microtime(true) + self::CLOSE_BUTTON_MAX_WAIT_SECONDS;
        $script = <<<JS
            (function() {
                var app = document.querySelector('{$this->escape_js_selector(self::APP_ROOT_SELECTOR)}');
                if (!app || !app.shadowRoot) {
                    return false;
                }
                var label = '{$this->escape_js_string(self::CLOSE_BUTTON_ARIA_LABEL)}';
                var candidates = app.shadowRoot.querySelectorAll('button, [role="button"]');
                for (var i = 0; i < candidates.length; i++) {
                    var attr = (candidates[i].getAttribute('aria-label') || '').toLowerCase();
                    if (attr === label) {
                        candidates[i].click();
                        return true;
                    }
                }
                return false;
            })();
JS;
        while (microtime(true) < $deadline) {
            if ($session->evaluateScript($script)) {
                return;
            }
            usleep(300000);
        }
        throw new ExpectationException(
            'No button with aria-label "' . self::CLOSE_BUTTON_ARIA_LABEL . '" was found inside "'
            . self::APP_ROOT_SELECTOR . '"\'s shadow root within ' . self::CLOSE_BUTTON_MAX_WAIT_SECONDS . 's.',
            $session
        );
    }

    /**
     * Pre-acknowledge the one-time privacy notices Face Navigation and
     * Voice Commands each show via a blocking dialog before their first
     * activation on a given browser (see PRIVACY_ACK_KEY in
     * amd/src/face_navigation.js and amd/src/voice_commands.js) - writing
     * the same localStorage key their own rememberPrivacyAck()/
     * hasAcknowledgedPrivacyNotice() functions use, so scenarios that
     * enable these options can assert their real activation behaviour
     * without also having to drive a native window.confirm() or an
     * on-page dialog through Behat.
     *
     * @Given /^I have acknowledged the accessibility privacy notices$/
     */
    public function i_have_acknowledged_the_accessibility_privacy_notices(): void {
        $this->getSession()->executeScript(
            "window.localStorage.setItem('local_a11y_fn_privacy_ack', '1');"
            . "window.localStorage.setItem('local_a11y_vc_privacy_ack', '1');"
        );
    }

    /**
     * Insert a real, autoplaying `<video>` element into #page, for
     * amd/src/silence_media.js's own scenario to have something to act on.
     * `autoplay` is set as a plain HTML attribute so `el.autoplay` reads
     * true regardless of whether the browser actually honours autoplay -
     * shouldSilence() (silence_media.js) only checks that property, never
     * whether playback genuinely started, so no real video file or actual
     * playback is needed for this to be a faithful test. `id="local-a11y-
     * behat-test-video"` is this test fixture's own id, not part of the
     * plugin - used only by "the test video should( not)? be muted" below.
     *
     * @Given /^I insert a test autoplaying video into the page$/
     */
    public function i_insert_a_test_autoplaying_video_into_the_page(): void {
        $this->getSession()->executeScript(
            "var v = document.createElement('video');"
            . "v.id = 'local-a11y-behat-test-video';"
            . "v.setAttribute('autoplay', '');" // shouldSilence() only checks this attribute/property, never real playback.
            . "document.getElementById('page').appendChild(v);"
        );
    }

    /**
     * Assert amd/src/silence_media.js actually muted (or left alone) the
     * video inserted by the step above - checking the live `muted` IDL
     * property, which no generic Behat step can read (only DOM attributes/
     * text, not JS property state).
     *
     * @Then /^the test video should( not)? be muted$/
     * @param string $not
     * @throws ExpectationException if the video's muted state does not match.
     */
    public function the_test_video_should_be_muted(string $not = ''): void {
        // Wrapped in an IIFE: the underlying WebDriver's evaluateScript()
        // prepends "return " to any script not already starting with it,
        // which would otherwise turn a leading "var v = ...;" statement
        // into the syntax error "return var v = ...;". An IIFE call is
        // itself a valid expression, so "return (function(){...})();" is
        // fine either way.
        $muted = $this->getSession()->evaluateScript(
            "(function() {"
            . "var v = document.getElementById('local-a11y-behat-test-video');"
            . "return v ? v.muted : null;"
            . "})();"
        );
        $expected = ($not === '');
        if ($muted === null) {
            throw new ExpectationException('No element with id "local-a11y-behat-test-video" was found.', $this->getSession());
        }
        if ($muted !== $expected) {
            throw new ExpectationException(
                'Expected the test video\'s muted property to be ' . ($expected ? 'true' : 'false')
                . ' but it was ' . ($muted ? 'true' : 'false') . '.',
                $this->getSession()
            );
        }
    }

    /**
     * Escapes a CSS selector for safe interpolation into a single-quoted
     * JS string literal inside executeScript() above.
     *
     * @param string $selector
     * @return string
     */
    protected function escape_js_selector(string $selector): string {
        return addslashes($selector);
    }

    /**
     * Escapes a plain string for safe interpolation into a single-quoted
     * JS string literal inside executeScript() above.
     *
     * @param string $text
     * @return string
     */
    protected function escape_js_string(string $text): string {
        return addslashes($text);
    }
}
