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
 * Magnifier: a circular lens that follows the pointer (or the keyboard) and
 * magnifies the *real* #page content under it - not a font-size trick, an
 * actual zoomed reflection of the live DOM, including images and tables.
 *
 * Architecture (same lifecycle/JSDoc shape as reading_guide.js /
 * reading_mask.js: module-level vars, start()/stop()/sync(), no framework),
 * plus the requestAnimationFrame self-scheduling loop face_navigation.js
 * uses for its own per-frame cursor tracking - see render() below.
 *
 * How the magnification itself works (no <canvas>, no external library):
 * #page is cloned once (cloneNode) into an inert, decorative copy sitting
 * inside a small `overflow:hidden` circular window (the lens). Every frame,
 * only two `transform` values are written (never top/left, never anything
 * that forces layout): one to move the lens window to the pointer, one to
 * translate+scale the clone so the point directly under the pointer stays
 * centred in the lens - see DECISIONS.md D42 for the full derivation and
 * for why this needed its own decision (id-stripping to avoid colliding
 * with sibling modules' `#page`-scoped queries, why iframe/video/audio are
 * replaced with same-size placeholders in the clone rather than shown or
 * dropped outright (D42, refined by D45), and how it stays in sync with
 * Inverter Cores/Mudar Cores/Saturação/Filtro de Luz Azul without ever
 * re-cloning).
 *
 * Zoom (2x/3x/4x) is a toggle-internal control, not a separate panel
 * stepper - see D42 for why. `+`/`-` cycle it; arrow keys move the lens;
 * Esc turns the option off (via a self-disable custom event, the same
 * pattern amd/src/face_navigation.js uses for its own "Stop" button).
 *
 * @module     local_a11y/magnifier
 * @description A circular lens that follows the pointer/keyboard and magnifies real #page content.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

const LENS_SIZE = 220;
const LENS_RADIUS = LENS_SIZE / 2;
const ZOOM_LEVELS = [2, 3, 4];
const ZOOM_DEFAULT = 2;
const MOVE_STEP = 30;

let active = false;
let lensEl = null;
let contentEl = null;
let zoom = ZOOM_DEFAULT;
let targetX = 0;
let targetY = 0;
let pageRect = null;
let lastFilter = '';
let rafId = null;
let refreshScheduled = false;
let observer = null;
let onMouseMove = null;
let onKeyDown = null;

/**
 * Whether the user is currently typing/selecting in a form control - arrow
 * keys and +/- must behave normally there (move the text cursor, type a
 * literal "+"/"-", etc.) instead of being hijacked to move the lens/zoom,
 * same courtesy voice_commands.js and virtual_keyboard.js extend to text
 * entry elsewhere in this plugin.
 *
 * @return {Boolean} True if the currently focused element accepts text input.
 */
const isTypingContext = () => {
    const el = document.activeElement;
    if (!el) {
        return false;
    }
    if (el.isContentEditable) {
        return true;
    }
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

/**
 * Clamp a target lens-centre coordinate so the lens circle never goes
 * partially off-screen (mouse can already never leave the viewport; this
 * matters for the arrow-key path, which otherwise has no such limit).
 *
 * @param {Number} x The unclamped horizontal target.
 * @param {Number} y The unclamped vertical target.
 * @return {{x: Number, y: Number}} The clamped target.
 */
const clampTarget = (x, y) => ({
    x: Math.max(LENS_RADIUS, Math.min(window.innerWidth - LENS_RADIUS, x)),
    y: Math.max(LENS_RADIUS, Math.min(window.innerHeight - LENS_RADIUS, y)),
});

/**
 * Move the zoom level by one step (+1 = zoom in, -1 = zoom out), clamped to
 * ZOOM_LEVELS - does not wrap.
 *
 * @param {Number} direction +1 to zoom in, -1 to zoom out.
 * @return {void}
 */
const zoomBy = (direction) => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    const nextIdx = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, idx + direction));
    zoom = ZOOM_LEVELS[nextIdx];
};

/**
 * (Re)build the magnified clone from the live #page: strips the id (so
 * this plugin's own `#page`-scoped queries elsewhere - silence_media.js's
 * MutationObserver target, pause_media.js/silence_media.js's `#page audio/
 * video` selectors - can never match anything inside this inert copy) and
 * replaces every <iframe>/<video>/<audio> with a same-size, empty <div>
 * (cloneNode does not carry over their live playback/embed state - a
 * cloned video shows a blank frame and a cloned iframe would independently
 * reload its src, wasting bandwidth for a magnified view that would look
 * wrong anyway; better to show nothing there than something misleading).
 * Sized, not just removed outright (D45 - an earlier version did that):
 * dropping the element collapses the layout space it occupied, shifting
 * everything below it in the clone relative to the real page and breaking
 * render()'s pointer-to-content coordinate mapping for any content below
 * one - a page with, say, an embedded video partway down would show
 * content ~however-tall-that-video-was off from where the pointer
 * actually is for everything past it. Everything else - text, images,
 * tables, SVGs, form control values - clones faithfully. Nested ids are
 * deliberately left untouched: Contraste's recolouring targets
 * `#region-main` and friends by id, and preserving those lets it "just
 * work" inside the magnified view for free (see D42).
 *
 * The clone is forced to #page's current on-screen width so it reflows
 * identically (same text wrapping, same table layout) - required for the
 * pointer-to-content coordinate mapping in render() to line up.
 *
 * @return {void}
 */
const buildClone = () => {
    const source = document.getElementById('page');
    if (!source || !contentEl) {
        return;
    }
    const clone = source.cloneNode(true);
    clone.removeAttribute('id');

    const liveEls = source.querySelectorAll('iframe, video, audio');
    clone.querySelectorAll('iframe, video, audio').forEach((el, i) => {
        const rect = liveEls[i].getBoundingClientRect();
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `display:inline-block;width:${rect.width}px;height:${rect.height}px`;
        el.replaceWith(placeholder);
    });

    // D49: #page's own padding/border - not just its width - has to be
    // copied onto the clone explicitly too. Boost applies #page's padding
    // via an id selector (varies per page/layout - seen "0 16px 0 48px" on
    // the dashboard), and the clone lost its id (buildClone() above,
    // D42/D45) so that rule never reaches it; the clone rendered with
    // zero padding while render()'s coordinate math still measured
    // distances from the real #page's padded (border-)box edge, throwing
    // every mapped point off by exactly the missing padding - horizontally
    // or vertically depending on which side a given page's padding falls
    // on. Copying the 4 box-model properties that can shift where content
    // starts inside the box (padding, border, box-sizing) fixes this for
    // any page's padding, not just the one this was caught on.
    const sourceStyle = getComputedStyle(source);
    clone.style.boxSizing = sourceStyle.boxSizing;
    clone.style.paddingTop = sourceStyle.paddingTop;
    clone.style.paddingRight = sourceStyle.paddingRight;
    clone.style.paddingBottom = sourceStyle.paddingBottom;
    clone.style.paddingLeft = sourceStyle.paddingLeft;
    clone.style.borderTopWidth = sourceStyle.borderTopWidth;
    clone.style.borderRightWidth = sourceStyle.borderRightWidth;
    clone.style.borderBottomWidth = sourceStyle.borderBottomWidth;
    clone.style.borderLeftWidth = sourceStyle.borderLeftWidth;
    clone.style.borderStyle = sourceStyle.borderStyle;

    pageRect = source.getBoundingClientRect();
    clone.style.width = pageRect.width + 'px';
    contentEl.replaceChildren(clone);
};

/**
 * Coalesce MutationObserver callbacks into at most one re-clone per
 * animation frame, however many mutations fired in between - re-cloning is
 * the one part of this module that does force a layout (appending a whole
 * #page copy), so it must never run on the render() hot path itself.
 *
 * @return {void}
 */
const scheduleRefresh = () => {
    if (refreshScheduled || !active) {
        return;
    }
    refreshScheduled = true;
    requestAnimationFrame(() => {
        refreshScheduled = false;
        if (active) {
            buildClone();
        }
    });
};

/**
 * Per-frame render loop (requestAnimationFrame while active). Reads
 * #page's current rect and computed `filter` (cheap reads; nothing this
 * module writes beforehand is layout-affecting, so neither read forces
 * extra synchronous layout beyond what the frame needed anyway), then
 * writes exactly two `transform` values and, only when it actually
 * changed, one `filter` value - never `top`/`left`, never anything else,
 * so there is no reflow caused by this loop itself:
 *
 * - lensEl gets translated so its centre sits on the (clamped) target.
 * - contentEl gets translated+scaled so the page point under the target
 *   stays centred in the lens: with the clone's own top-left as the
 *   transform-origin, a page point that is (lx, ly) away from #page's
 *   current top-left must land on the lens's local centre (R, R) after
 *   scaling by `zoom` - solving `zoom * (lx, ly) + (ox, oy) = (R, R)` for
 *   the translate gives `(ox, oy) = (R - zoom*lx, R - zoom*ly)`.
 * - contentEl's `filter` is kept identical to #page's own computed filter,
 *   so Inverter Cores/Mudar Cores/Saturação/Filtro de Luz Azul (all
 *   `filter`-based - see D31/D37/D40) stay visually in sync inside the
 *   magnified view even though the clone lost #page's id (see buildClone
 *   docblock) and so can no longer be reached by the `#page`-selector
 *   rules that apply those filters directly.
 *
 * @return {void}
 */
const render = () => {
    if (!active) {
        rafId = null;
        return;
    }
    const source = document.getElementById('page');
    if (source) {
        pageRect = source.getBoundingClientRect();
        const currentFilter = getComputedStyle(source).filter;
        if (currentFilter !== lastFilter) {
            contentEl.style.filter = currentFilter;
            lastFilter = currentFilter;
        }
    }

    const {x: cx, y: cy} = clampTarget(targetX, targetY);
    lensEl.style.transform = `translate(${cx - LENS_RADIUS}px, ${cy - LENS_RADIUS}px)`;

    if (pageRect) {
        const lx = cx - pageRect.left;
        const ly = cy - pageRect.top;
        const ox = LENS_RADIUS - (zoom * lx);
        const oy = LENS_RADIUS - (zoom * ly);
        contentEl.style.transform = `translate(${ox}px, ${oy}px) scale(${zoom})`;
    }

    rafId = requestAnimationFrame(render);
};

/**
 * Start the magnifier: build the lens/clone, wire pointer + keyboard
 * input, watch #page for content changes, and kick off render(). Idempotent.
 *
 * @return {void}
 */
export const start = () => {
    if (active) {
        return;
    }
    active = true;
    zoom = ZOOM_DEFAULT;
    lastFilter = '';
    targetX = window.innerWidth / 2;
    targetY = window.innerHeight / 2;

    // Deliberately NOT `.local-a11y-root` (unlike every other overlay in
    // this plugin): that class's blanket `filter: none !important` reset
    // on its own descendants would block the very filter this module
    // copies onto contentEl in render() above, and its "PANEL OPT-OUT"
    // purpose (protect the FAB/panel's own readable text/controls from
    // page-wide typography/cursor effects) doesn't apply here - the lens
    // has no text and no interactive controls of its own. aria-hidden and
    // `inert` below cover the "decorative, invisible to a11y tree"
    // requirement directly, without going through that shared class.
    lensEl = document.createElement('div');
    lensEl.className = 'local-a11y-magnifier';
    lensEl.setAttribute('aria-hidden', 'true');
    lensEl.inert = true;

    contentEl = document.createElement('div');
    contentEl.className = 'local-a11y-magnifier__content';
    lensEl.appendChild(contentEl);
    document.body.appendChild(lensEl);

    buildClone();

    const source = document.getElementById('page');
    if (source) {
        observer = new MutationObserver(scheduleRefresh);
        observer.observe(source, {childList: true, subtree: true, attributes: true, characterData: true});
    }

    onMouseMove = (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    onKeyDown = (e) => {
        if (e.key === 'Escape') {
            // Ask main.js to flip the panel switch off too (settings/
            // storage/UI all stay in sync) - same self-disable pattern
            // amd/src/face_navigation.js uses for its own "Stop" button.
            document.dispatchEvent(new CustomEvent('local_a11y/magnifier-disable'));
            return;
        }
        if (isTypingContext()) {
            return;
        }
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                targetY -= MOVE_STEP;
                break;
            case 'ArrowDown':
                e.preventDefault();
                targetY += MOVE_STEP;
                break;
            case 'ArrowLeft':
                e.preventDefault();
                targetX -= MOVE_STEP;
                break;
            case 'ArrowRight':
                e.preventDefault();
                targetX += MOVE_STEP;
                break;
            case '+':
            case '=':
                e.preventDefault();
                zoomBy(1);
                break;
            case '-':
            case '_':
                e.preventDefault();
                zoomBy(-1);
                break;
            default:
                break;
        }
    };
    document.addEventListener('keydown', onKeyDown);

    rafId = requestAnimationFrame(render);
};

/**
 * Stop the magnifier: cancel the render loop, disconnect the observer,
 * remove every listener this module added, and remove the lens. No
 * listener/observer/rAF is left behind. Idempotent.
 *
 * @return {void}
 */
export const stop = () => {
    if (!active) {
        return;
    }
    active = false;
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    window.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('keydown', onKeyDown);
    onMouseMove = null;
    onKeyDown = null;
    if (lensEl) {
        lensEl.remove();
    }
    lensEl = null;
    contentEl = null;
    pageRect = null;
};

/**
 * Toggle the magnifier on/off.
 *
 * @param {Boolean} isActive Whether the magnifier should be shown.
 * @return {void}
 */
export const sync = (isActive) => (isActive ? start() : stop());

export default {start, stop, sync};
