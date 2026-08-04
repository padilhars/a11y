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
 * Custom tooltips: replaces the browser's native title tooltip with a
 * styled dark bubble (with arrow) on hover *and* keyboard focus, sourced
 * from - in priority order - data-tooltip, title, aria-label, or (for
 * <img>) alt. While a matched element's tooltip is showing, its `title`
 * attribute (if any) is removed so the native browser tooltip never
 * appears alongside ours, and restored the moment it closes.
 *
 * Previously a pure-CSS `content: attr(title)` effect (styles.css), which
 * could never suppress the native tooltip (CSS has no such power) and only
 * covered `a`/`button` elements with a `title` - see DECISIONS.md D29.
 *
 * @module     local_a11y/tooltips
 * @description Custom tooltips replacing the browser's native title tooltip.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

const SELECTOR = '[title], [aria-label], [data-tooltip], img[alt]';
const TITLE_BACKUP_ATTR = 'data-a11y-tooltip-title';
const GAP = 8;

let bubble = null;
let currentTarget = null;
let listenersBound = false;

/**
 * @param {HTMLElement} el
 * @return {String|null}
 */
const labelFor = (el) => {
    const value = el.getAttribute('data-tooltip')
        || el.getAttribute('title')
        || el.getAttribute('aria-label')
        || (el.tagName === 'IMG' ? el.getAttribute('alt') : null);
    return value && value.trim() !== '' ? value.trim() : null;
};

/**
 * Position the (already-visible, so measurable) bubble against `target`,
 * flipping below it when there isn't enough room above, and clamping
 * horizontally so it never runs off either edge of the viewport.
 *
 * @param {HTMLElement} target
 */
const position = (target) => {
    const rect = target.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const below = rect.top - bubbleRect.height - GAP < 0;

    let top = below ? rect.bottom + GAP : rect.top - bubbleRect.height - GAP;
    let left = rect.left + (rect.width / 2) - (bubbleRect.width / 2);
    left = Math.max(GAP, Math.min(left, window.innerWidth - bubbleRect.width - GAP));

    bubble.style.top = `${Math.round(top)}px`;
    bubble.style.left = `${Math.round(left)}px`;
    bubble.classList.toggle('local-a11y-tooltip--below', below);

    // Point the arrow at the horizontal centre of the target, even when the
    // bubble itself had to shift sideways to stay on-screen.
    const arrowLeft = Math.max(10, Math.min(rect.left + rect.width / 2 - left, bubbleRect.width - 10));
    bubble.style.setProperty('--local-a11y-tooltip-arrow-left', `${Math.round(arrowLeft)}px`);
};

/**
 * @param {HTMLElement} target
 * @param {String} text
 */
const show = (target, text) => {
    if (currentTarget === target) {
        return;
    }
    hide();
    currentTarget = target;

    if (target.hasAttribute('title')) {
        target.setAttribute(TITLE_BACKUP_ATTR, target.getAttribute('title'));
        target.removeAttribute('title');
    }

    bubble = document.createElement('div');
    bubble.className = 'local-a11y-root local-a11y-tooltip';
    bubble.id = 'local-a11y-tooltip';
    bubble.setAttribute('role', 'tooltip');
    bubble.textContent = text;
    document.body.appendChild(bubble);
    target.setAttribute('aria-describedby', bubble.id);
    position(target);
};

/**
 * Hide the current tooltip (if any) and restore whatever `title` was
 * stashed on its target. Idempotent.
 */
const hide = () => {
    if (currentTarget) {
        if (currentTarget.hasAttribute(TITLE_BACKUP_ATTR)) {
            currentTarget.setAttribute('title', currentTarget.getAttribute(TITLE_BACKUP_ATTR));
            currentTarget.removeAttribute(TITLE_BACKUP_ATTR);
        }
        currentTarget.removeAttribute('aria-describedby');
        currentTarget = null;
    }
    if (bubble) {
        bubble.remove();
        bubble = null;
    }
};

/**
 * @param {Event} e
 */
const handleEnter = (e) => {
    const target = e.target.closest(SELECTOR);
    const text = target ? labelFor(target) : null;
    if (target && text) {
        show(target, text);
    }
};

/**
 * @param {Event} e
 */
const handleLeave = (e) => {
    if (!currentTarget) {
        return;
    }
    const related = e.relatedTarget;
    if (related && currentTarget.contains(related)) {
        return;
    }
    hide();
};

const handleScroll = () => {
    if (currentTarget && bubble) {
        position(currentTarget);
    }
};

const handleKeydown = (e) => {
    if (e.key === 'Escape') {
        hide();
    }
};

/**
 * Start listening for hover/focus on tooltip-bearing elements. Idempotent.
 */
export const start = () => {
    if (listenersBound) {
        return;
    }
    listenersBound = true;
    document.addEventListener('mouseover', handleEnter);
    document.addEventListener('mouseout', handleLeave);
    document.addEventListener('focusin', handleEnter);
    document.addEventListener('focusout', handleLeave);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKeydown);
};

/**
 * Stop listening and clean up any tooltip currently showing. Idempotent.
 */
export const stop = () => {
    if (!listenersBound) {
        return;
    }
    listenersBound = false;
    document.removeEventListener('mouseover', handleEnter);
    document.removeEventListener('mouseout', handleLeave);
    document.removeEventListener('focusin', handleEnter);
    document.removeEventListener('focusout', handleLeave);
    window.removeEventListener('scroll', handleScroll, true);
    document.removeEventListener('keydown', handleKeydown);
    hide();
};

/**
 * @param {Boolean} active
 */
export const sync = (active) => (active ? start() : stop());

export default {start, stop, sync};
