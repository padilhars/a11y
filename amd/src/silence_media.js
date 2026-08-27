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
 * "Silenciar Mídia" silences audio/video that plays without the user
 * explicitly starting it. A sibling of amd/src/pause_media.js rather than
 * an extension of it (see DECISIONS.md D40): the two options are
 * independently toggleable, target overlapping element types but have
 * incompatible stop() semantics (pause_media.js resumes what it paused;
 * this module deliberately never re-enables sound - see stop() below), and
 * this module additionally has to reach into cross-origin <iframe> embeds,
 * which pause_media.js has no reason to touch.
 *
 * <video> is only ever muted here, never paused (D46 - it used to pause
 * too, which duplicated exactly what "Pausar Animações" already does to
 * <video>, with no benefit: a muted video makes no sound whether it's
 * playing or not). <audio> has no visual/motion dimension for
 * pause_media.js to ever cover, so it keeps the original mute+pause
 * treatment - nothing else in this plugin stops it otherwise. A user who
 * wants autoplaying video both silent *and* stopped turns both options on;
 * they already coexist fine (idempotent, independent state).
 *
 * Coverage, three complementary mechanisms:
 * - Native <audio>/<video> already in the page when the option is turned
 *   on: one sweep at start(), silencing anything with `autoplay` or
 *   already playing.
 * - Native <audio>/<video> that starts playing *later* while the option is
 *   still on - whether it has `autoplay` or is started by a script/user
 *   action - is caught by a document-level 'play' listener in the capture
 *   phase (same technique as pause_media.js's own playHandler; 'play' does
 *   not bubble, so capture is required).
 * - <iframe> embeds (YouTube/Vimeo) and any <audio>/<video>/<iframe>
 *   inserted into the DOM after start() - e.g. lazy-loaded course content -
 *   are caught by a MutationObserver. This is the one case the 'play'
 *   listener above cannot cover: 'play' never fires on an <iframe>, so
 *   there is no event to listen for - watching the DOM for new embeds is
 *   the only way to reach them.
 *
 * Embeds are controlled via each platform's own public postMessage
 * protocol (YouTube IFrame Player API, Vimeo Player.js) - no external SDK
 * script is ever loaded, keeping this plugin's zero-runtime-dependencies
 * principle intact. postMessage works cross-origin by design (that is its
 * purpose), but YouTube only *honours* these commands when the embed URL
 * was built with `enablejsapi=1`; this module cannot rewrite an existing
 * iframe's `src` to add that (would force a reload, losing playback state -
 * worse than doing nothing) so a command silently no-ops on an embed that
 * does not support it, matching the "degrade em silêncio" requirement
 * without any special-case code.
 *
 * @module     local_a11y/silence_media
 * @description Mutes autoplaying audio/video (pausing audio only) and YouTube/Vimeo embeds.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

const YOUTUBE_RE = /^https?:\/\/(www\.)?(youtube(-nocookie)?\.com)\//i;
const VIMEO_RE = /^https?:\/\/(player\.)?vimeo\.com\//i;

let active = false;
let playHandler = null;
let observer = null;

/**
 * Whether a native <audio>/<video> element should be silenced: it either
 * declares `autoplay`, or is already playing (covers autoplay implemented
 * via a script calling .play() instead of the HTML attribute, which is
 * common in custom course-content video players).
 *
 * @param {HTMLMediaElement} el The <audio> or <video> element to check.
 * @return {Boolean} True if the element should be silenced.
 */
const shouldSilence = (el) => el.autoplay || !el.paused;

/**
 * Silence a single <audio>/<video> element, if it meets shouldSilence().
 * <video> is muted only, left playing - see the module docblock (D46) for
 * why pausing it too would just duplicate Pausar Animações. <audio> is
 * muted and paused: nothing else in this plugin ever stops it. Idempotent.
 *
 * @param {HTMLMediaElement} el The <audio> or <video> element to silence.
 * @return {void}
 */
const silenceNative = (el) => {
    if (!shouldSilence(el)) {
        return;
    }
    el.muted = true;
    if (el.tagName === 'AUDIO') {
        el.pause();
    }
};

/**
 * Silence every <audio>/<video> currently inside #page.
 *
 * @return {void}
 */
const silenceAllNative = () => document.querySelectorAll('#page audio, #page video').forEach(silenceNative);

/**
 * Resolve an <iframe>'s src to an absolute URL, or null if it has none/is
 * unparseable (e.g. about:blank while still loading).
 *
 * @param {HTMLIFrameElement} frame The iframe element.
 * @return {URL|null} The parsed absolute URL, or null.
 */
const frameUrl = (frame) => {
    if (!frame.src) {
        return null;
    }
    try {
        return new URL(frame.src, window.location.href);
    } catch (e) {
        return null;
    }
};

/**
 * Send YouTube IFrame Player API mute+pause commands to an embed, via its
 * own public postMessage protocol (no external SDK loaded). No-ops
 * silently if the embed was not built with `enablejsapi=1` - YouTube
 * simply ignores commands from embeds that did not opt into the API.
 *
 * @param {HTMLIFrameElement} frame The YouTube embed iframe.
 * @param {String} origin The iframe's own origin (youtube.com or youtube-nocookie.com).
 * @return {void}
 */
const silenceYouTubeFrame = (frame, origin) => {
    ['mute', 'pauseVideo'].forEach((func) => {
        try {
            frame.contentWindow.postMessage(JSON.stringify({event: 'command', func, args: []}), origin);
        } catch (e) {
            // Nothing to recover from - the embed just stays as it was.
        }
    });
};

/**
 * Send Vimeo Player.js mute+pause commands to an embed, via its own public
 * postMessage protocol (no external SDK loaded; Vimeo's player listens for
 * these out of the box on any player.vimeo.com embed).
 *
 * @param {HTMLIFrameElement} frame The Vimeo embed iframe.
 * @param {String} origin The iframe's own origin (player.vimeo.com).
 * @return {void}
 */
const silenceVimeoFrame = (frame, origin) => {
    [{method: 'setVolume', value: 0}, {method: 'pause'}].forEach((message) => {
        try {
            frame.contentWindow.postMessage(JSON.stringify(message), origin);
        } catch (e) {
            // Nothing to recover from - the embed just stays as it was.
        }
    });
};

/**
 * Silence a single <iframe> if it's a recognised YouTube/Vimeo embed;
 * unsupported/unrecognised iframes are left untouched (silent degrade, per
 * spec - this plugin has no generic way to control an arbitrary embed
 * without loading its SDK, which would violate the zero-dependencies
 * principle). Commands are sent immediately and retried once on 'load', to
 * cover an embed that was still initialising its player when first seen
 * (e.g. one just inserted by the MutationObserver below).
 *
 * @param {HTMLIFrameElement} frame The iframe element to (maybe) silence.
 * @return {void}
 */
const silenceFrame = (frame) => {
    const url = frameUrl(frame);
    if (!url) {
        return;
    }
    let silence = null;
    if (YOUTUBE_RE.test(url.href)) {
        silence = () => silenceYouTubeFrame(frame, url.origin);
    } else if (VIMEO_RE.test(url.href)) {
        silence = () => silenceVimeoFrame(frame, url.origin);
    } else {
        return;
    }
    silence();
    frame.addEventListener('load', silence, {once: true});
};

/**
 * Silence every <iframe> currently inside #page.
 *
 * @return {void}
 */
const silenceAllFrames = () => document.querySelectorAll('#page iframe').forEach(silenceFrame);

/**
 * MutationObserver callback: for every node added anywhere in #page, check
 * it (and its descendants) for <audio>/<video>/<iframe> that need silencing -
 * covers lazy-loaded/dynamically-inserted media the initial sweep couldn't
 * have seen.
 *
 * @param {HTMLElement} node The added DOM node (may or may not be an element).
 * @return {void}
 */
const handleAddedNode = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
    }
    if (node.matches('audio, video')) {
        silenceNative(node);
    }
    node.querySelectorAll('audio, video').forEach(silenceNative);
    if (node.matches('iframe')) {
        silenceFrame(node);
    }
    node.querySelectorAll('iframe').forEach(silenceFrame);
};

/**
 * Start silencing: initial sweep of #page, then keep watching for new
 * plays (native) and new media (observer) while active.
 *
 * @return {void}
 */
export const start = () => {
    if (active) {
        return;
    }
    active = true;
    silenceAllNative();
    silenceAllFrames();

    playHandler = (e) => {
        const el = e.target;
        if (el.tagName === 'VIDEO' && el.closest('#page')) {
            el.muted = true;
        } else if (el.tagName === 'AUDIO' && el.closest('#page')) {
            el.muted = true;
            el.pause();
        }
    };
    document.addEventListener('play', playHandler, true);

    const page = document.getElementById('page');
    if (page) {
        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => mutation.addedNodes.forEach(handleAddedNode));
        });
        observer.observe(page, {childList: true, subtree: true});
    }
};

/**
 * Stop silencing *new* media. Deliberately does NOT unmute or resume
 * anything already silenced - see DECISIONS.md D40: reactivating audio
 * without a fresh user gesture is disruptive/hostile, unlike resuming a
 * paused animation (pause_media.js's stop() does resume, by contrast -
 * a purely visual effect carries none of that risk).
 *
 * @return {void}
 */
export const stop = () => {
    if (!active) {
        return;
    }
    active = false;
    document.removeEventListener('play', playHandler, true);
    playHandler = null;
    if (observer) {
        observer.disconnect();
        observer = null;
    }
};

/**
 * Toggle Silenciar Mídia on/off.
 *
 * @param {Boolean} isActive Whether media should be silenced.
 * @return {void}
 */
export const sync = (isActive) => (isActive ? start() : stop());

export default {start, stop, sync};
