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
 * The only file (besides classes/integration/vlibras.php on the PHP side)
 * that knows anything about the third-party local_vlibras plugin. Every
 * other JS module in this plugin (amd/src/main.js included) only ever calls
 * checkAvailability() and sync() below by name, and listens for the
 * 'local_a11y/vlibras-disable' event - none of them know what
 * `#vlibras-access-wrapper` or `#vlibras-app-root` are, and they don't need
 * to.
 *
 * D54/D56 revealed/hid VLibras' own idle button entirely through CSS and
 * deliberately did no DOM interaction. D57 added simulated clicks (open and
 * close) so the signLanguage toggle actually opens/closes the avatar, not
 * just the idle button. D58 fixes two problems D57's first version still
 * had, both only visible under realistic timing/usage, not in a slow,
 * deliberately-paced manual test:
 *
 * - attemptClose() looked for VLibras' own "Fechar" button exactly once,
 *   synchronously, with no retry - fine for attemptOpen()'s button (part of
 *   the widget's initial bootstrap, present within milliseconds), wrong for
 *   the close button, which lives inside the avatar's own much heavier UI
 *   and was measured live to take several seconds (up to ~8s) to finish
 *   rendering. Turning signLanguage off before that finishes used to fail
 *   silently - the avatar kept running (which looks, from the outside, like
 *   VLibras "started translating on its own" instead of closing) and
 *   nothing else ever retried. Fixed with a bounded poll instead of a
 *   single lookup.
 * - There was no way for VLibras being closed *through its own UI* (not
 *   through this plugin) to turn signLanguage back off - the panel's switch
 *   would stay on indefinitely after that. Fixed by wiring a listener onto
 *   the real close button, the first time it's found, that dispatches
 *   'local_a11y/vlibras-disable' - the same self-disable event pattern
 *   amd/src/magnifier.js and amd/src/face_navigation.js already use for
 *   their own "closed from inside the feature itself" case. Fires the same
 *   way whether the click came from a real user or from this module's own
 *   attemptClose() - harmless either way, since main.js only acts on it
 *   when signLanguage is still on.
 *
 * @module     local_a11y/vlibras_integration
 * @description Reveals/hides and opens/closes the local_vlibras widget to match signLanguage, plus a sanity check.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

/**
 * Mirrors classes/integration/vlibras.php::WIDGET_SELECTOR - the shadow-DOM
 * host element the real, visible VLibras button lives inside (see that
 * constant's own docblock for how D54's original guess, `[vw]`, turned out
 * to be a real but irrelevant element - not this one). Unlike `[vw]` (which
 * is local_vlibras's own static PHP output, present from the initial HTML
 * parse), this element is built by the *remote* vlibras-plugin.js script at
 * runtime - there genuinely can be a timing race between this check running
 * and that script finishing, which CHECK_RETRY_DELAY_MS below exists to
 * absorb before ever concluding the selector is actually wrong.
 *
 * @type {String}
 */
const WIDGET_SELECTOR = '#vlibras-access-wrapper';

/**
 * Mirrors classes/integration/vlibras.php::OPEN_BUTTON_ID - the id of the
 * clickable button inside WIDGET_SELECTOR's shadow root.
 *
 * @type {String}
 */
const OPEN_BUTTON_ID = 'vlibras-button';

/**
 * Mirrors classes/integration/vlibras.php::APP_ROOT_SELECTOR - the shadow-DOM
 * host VLibras itself creates the first time OPEN_BUTTON_ID is clicked.
 *
 * @type {String}
 */
const APP_ROOT_SELECTOR = '#vlibras-app-root';

/**
 * Mirrors classes/integration/vlibras.php::CLOSE_BUTTON_ARIA_LABEL.
 *
 * @type {String}
 */
const CLOSE_BUTTON_ARIA_LABEL = 'fechar';

/**
 * The admin-controlled body class classes/hook_callbacks.php adds when the
 * integration is on (see its own docblock for why it's added there instead
 * of through the usual per-user path).
 *
 * @type {String}
 */
const INTEGRATED_BODY_CLASS = 'a11y-vlibras-integrated';

/**
 * How long to wait, after finding nothing on the first pass, before
 * concluding WIDGET_SELECTOR or OPEN_BUTTON_ID is genuinely stale rather
 * than just not built yet - both live inside the widget's initial
 * bootstrap, which past measurement showed finishes within a second or two,
 * not the much longer load APP_ROOT_SELECTOR's own content needs (see
 * CLOSE_BUTTON_MAX_WAIT_MS below for that one). Not an exact measurement;
 * a generous, one-time margin.
 *
 * @type {Number}
 */
const CHECK_RETRY_DELAY_MS = 2000;

/**
 * How long to keep polling for VLibras' own "Fechar" button inside
 * APP_ROOT_SELECTOR before giving up - measured live (Puppeteer, headless
 * Chrome) to take as long as ~8s from the open click until the avatar's
 * full interface (including this button) finishes rendering, noticeably
 * longer than WIDGET_SELECTOR/OPEN_BUTTON_ID's own bootstrap. A generous
 * ceiling, not an exact measurement - real-world load time depends on the
 * remote script's own server and the viewer's connection, both outside this
 * plugin's control.
 *
 * @type {Number}
 */
const CLOSE_BUTTON_MAX_WAIT_MS = 15000;

/**
 * How often to re-check for the close button while polling.
 *
 * @type {Number}
 */
const CLOSE_POLL_INTERVAL_MS = 300;

/**
 * Log the "selector not found" warning - developer-debug builds only
 * (matches PHP's own debugging() convention, which this is standing in
 * for on the client: there is no client-side debugging(), M.cfg.
 * developerdebug is what page_requirements_manager sets it from). Never
 * throws, never blocks anything else this plugin does - the CSS hiding
 * rule itself already degrades safely on its own (a selector matching
 * nothing is simply a no-op in CSS), this is purely about making the
 * mismatch visible to someone who can fix it.
 *
 * @param {String} detail What specifically was not found.
 * @return {void}
 */
const warnIntegrationIssue = (detail) => {
    if (window.M && M.cfg && M.cfg.developerdebug) {
        window.console.warn(
            'local_a11y: the VLibras integration is switched on (local_a11y/integratevlibras) but ' + detail
            + '. local_vlibras (or vlibras.gov.br itself) may have changed its own markup since '
            + 'classes/integration/vlibras.php was written. Both floating buttons may appear, or the avatar may '
            + 'not open/close from the panel until this is corrected - the intended worst case, not a broken page.'
        );
    }
};

/**
 * Find an element by id inside another element's *open* shadow root.
 *
 * @param {String} hostSelector CSS selector for the shadow host, in the light DOM.
 * @param {String} id The id to look up inside that host's shadow root.
 * @return {Element|null} The matching element, or null if the host, its shadow root, or the id was not found.
 */
const findInShadow = (hostSelector, id) => {
    const host = document.querySelector(hostSelector);
    if (!host || !host.shadowRoot) {
        return null;
    }
    return host.shadowRoot.getElementById(id);
};

/**
 * Find VLibras' own close button inside APP_ROOT_SELECTOR's shadow root, if
 * both exist right now (no waiting - see pollForCloseButton() for that).
 *
 * @return {Element|null}
 */
const findCloseButton = () => {
    const appRoot = document.querySelector(APP_ROOT_SELECTOR);
    if (!appRoot || !appRoot.shadowRoot) {
        return null;
    }
    return Array.from(appRoot.shadowRoot.querySelectorAll('button, [role="button"]'))
        .find((candidate) => (candidate.getAttribute('aria-label') || '').toLowerCase() === CLOSE_BUTTON_ARIA_LABEL)
        || null;
};

/**
 * Poll for VLibras' own close button to exist, up to `deadline`, calling
 * onFound(button) the moment it does, or onTimeout() (if given) once
 * `deadline` passes without finding it. See CLOSE_BUTTON_MAX_WAIT_MS's own
 * docblock for why this needs to be a bounded poll rather than a single
 * fixed-delay retry the way attemptOpen() below still gets away with.
 *
 * @param {Function} onFound Called once with the close button element.
 * @param {Function|null} onTimeout Called with no arguments if `deadline` passes first.
 * @param {Number} deadline A Date.now()-based timestamp to stop polling at.
 * @return {void}
 */
const pollForCloseButton = (onFound, onTimeout, deadline) => {
    const button = findCloseButton();
    if (button) {
        onFound(button);
        return;
    }
    if (Date.now() >= deadline) {
        if (onTimeout) {
            onTimeout();
        }
        return;
    }
    window.setTimeout(() => pollForCloseButton(onFound, onTimeout, deadline), CLOSE_POLL_INTERVAL_MS);
};

/**
 * Check whether WIDGET_SELECTOR actually exists, retrying once after
 * CHECK_RETRY_DELAY_MS before warning - the remote script that builds it
 * may simply not have finished yet on the first pass, which is not the
 * same thing as the selector being wrong.
 *
 * @return {void}
 */
export const checkAvailability = () => {
    if (!document.body.classList.contains(INTEGRATED_BODY_CLASS)) {
        return;
    }
    if (document.querySelector(WIDGET_SELECTOR)) {
        return;
    }
    window.setTimeout(() => {
        if (!document.querySelector(WIDGET_SELECTOR)) {
            warnIntegrationIssue('no element matching "' + WIDGET_SELECTOR + '" was found on this page');
        }
    }, CHECK_RETRY_DELAY_MS);
};

/**
 * What sync() last actually acted on (open vs. close), so repeated calls
 * with the same value (every commit() in amd/src/main.js runs sync() again,
 * regardless of which option actually changed) don't re-click VLibras' own
 * button over and over - only a real transition ever clicks anything. Reset
 * per page load, matching every other advanced-feature module's own
 * module-level `active` state (see e.g. amd/src/pause_media.js).
 *
 * @type {Boolean}
 */
let currentState = false;

/**
 * Bumped on every sync() call that actually acts (open or close), so a
 * still-pending retry/poll from an *earlier* call can tell it has been
 * superseded (the user flipped the toggle again before it landed) and skip
 * clicking anything - without this, a slow close-button poll from an
 * open-then-immediately-close-again sequence could click "close" *after*
 * the user had already asked to reopen it, undoing their most recent
 * action instead of honouring it.
 *
 * @type {Number}
 */
let syncToken = 0;

/**
 * Whether a 'click' listener has already been attached to VLibras' own
 * close button - see watchForCloseButton()'s own docblock for why this only
 * ever needs to happen once per page load.
 *
 * @type {Boolean}
 */
let closeListenerAttached = false;

/**
 * Wire a one-time listener onto VLibras' own close button so that a real
 * user closing the avatar through VLibras' own UI (not through this
 * plugin) turns the signLanguage option back off too. Dispatches a custom
 * event rather than reaching into settings/onToggle directly - this module
 * isn't supposed to know anything about how options are stored, matching
 * the same self-disable pattern amd/src/magnifier.js and
 * amd/src/face_navigation.js already use. Fires the exact same way if the
 * click actually came from this module's own attemptClose() instead of a
 * real user - harmless, since main.js only ever acts on the event when
 * signLanguage is still genuinely on.
 *
 * APP_ROOT_SELECTOR is never recreated once VLibras builds it (confirmed
 * live: closing and reopening reuses the same element/shadow root for the
 * rest of the page's lifetime), so one listener, attached once, covers
 * every subsequent open/close for the rest of this page load - no need to
 * detect or reattach across cycles.
 *
 * @return {void}
 */
const watchForCloseButton = () => {
    if (closeListenerAttached) {
        return;
    }
    pollForCloseButton(
        (button) => {
            closeListenerAttached = true;
            button.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('local_a11y/vlibras-disable'));
            });
        },
        null,
        Date.now() + CLOSE_BUTTON_MAX_WAIT_MS
    );
};

/**
 * Click VLibras' own open button, retrying once (see CHECK_RETRY_DELAY_MS)
 * if its shadow root is not built yet. Starts watching for the close
 * button (see watchForCloseButton()) as soon as an open click actually
 * lands, on either path.
 *
 * @param {Number} token This call's syncToken, to detect being superseded before the retry fires.
 * @return {void}
 */
const attemptOpen = (token) => {
    const button = findInShadow(WIDGET_SELECTOR, OPEN_BUTTON_ID);
    if (button) {
        button.click();
        watchForCloseButton();
        return;
    }
    window.setTimeout(() => {
        if (token !== syncToken) {
            // Superseded by a later sync() call - the user has since asked
            // for something else, don't open it now.
            return;
        }
        const retryButton = findInShadow(WIDGET_SELECTOR, OPEN_BUTTON_ID);
        if (retryButton) {
            retryButton.click();
            watchForCloseButton();
        } else {
            warnIntegrationIssue(
                'no button with id "' + OPEN_BUTTON_ID + '" was found inside "' + WIDGET_SELECTOR + '"\'s shadow root'
            );
        }
    }, CHECK_RETRY_DELAY_MS);
};

/**
 * Click VLibras' own close button inside APP_ROOT_SELECTOR's shadow root,
 * if the avatar was ever opened on this page load at all - polling for it
 * (see CLOSE_BUTTON_MAX_WAIT_MS) since it can still be mid-render at the
 * exact moment the user turns the option back off. Not finding
 * APP_ROOT_SELECTOR at all is the common, expected case (never opened on
 * this page load) - not worth polling for or warning about.
 *
 * @param {Number} token This call's syncToken, to detect being superseded before the poll lands.
 * @return {void}
 */
const attemptClose = (token) => {
    if (!document.querySelector(APP_ROOT_SELECTOR)) {
        return;
    }
    pollForCloseButton(
        (button) => {
            if (token === syncToken) {
                button.click();
            }
        },
        () => {
            if (token === syncToken) {
                warnIntegrationIssue(
                    'no button with aria-label "' + CLOSE_BUTTON_ARIA_LABEL + '" was found inside "'
                    + APP_ROOT_SELECTOR + '"\'s shadow root within ' + CLOSE_BUTTON_MAX_WAIT_MS + 'ms'
                );
            }
        },
        Date.now() + CLOSE_BUTTON_MAX_WAIT_MS
    );
    // Belt-and-braces: if watchForCloseButton() never got a chance to run
    // (e.g. this is the very first sync() call this page load, straight to
    // "off"), make sure a future open still gets watched for its own close.
    watchForCloseButton();
};

/**
 * Keep VLibras' own widget open/closed in sync with the signLanguage
 * option - called on every commit() in amd/src/main.js, same pattern as
 * every other advanced-feature module's own sync(), but a no-op unless the
 * integration is actually on (mirrors checkAvailability()'s own guard) or
 * the requested state actually changed since the last call.
 *
 * @param {Boolean} isActive The current value of the signLanguage option.
 * @return {void}
 */
export const sync = (isActive) => {
    if (!document.body.classList.contains(INTEGRATED_BODY_CLASS)) {
        return;
    }
    if (isActive === currentState) {
        return;
    }
    currentState = isActive;
    const token = ++syncToken;
    if (isActive) {
        attemptOpen(token);
    } else {
        attemptClose(token);
    }
};

export default {checkAvailability, sync};
