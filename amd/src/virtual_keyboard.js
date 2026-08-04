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
 * On-screen QWERTY keyboard (with pt-BR accents) that types into whichever
 * text field is focused, ported from VirtualKeyboard in
 * _design-reference/a11y-features.jsx. Built directly in JS rather than
 * from templates/virtual_keyboard.mustache - see DECISIONS.md - since it is
 * purely client-driven (never server-rendered for no-FOUC like the
 * FAB/panel) and rebuilding the shift-state rows is simpler as plain DOM.
 * Also lifts the FAB/panel out of the way while shown (liftBottom in the
 * prototype).
 *
 * @module     local_a11y/virtual_keyboard
 * @description On-screen QWERTY keyboard that types into the focused text field.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

import {getString} from 'core/str';
import FabLift from 'local_a11y/fab_lift';

const LETTER_ROWS = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];
const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ã', 'õ', 'ç', 'â', 'ê'];
const LIFT_PX = 248;

let container = null;
let target = null;
let shift = false;
let onFocusIn = null;
let onModalShown = null;

/**
 * @param {HTMLElement} el
 * @return {Boolean}
 */
const isEditable = (el) => {
    if (!el || (el.closest && el.closest('.local-a11y-root'))) {
        return false;
    }
    const tag = el.tagName;
    if (tag === 'TEXTAREA') {
        return true;
    }
    if (tag === 'INPUT') {
        const type = (el.type || 'text').toLowerCase();
        return ['text', 'search', 'email', 'url', 'tel', 'password', 'number'].includes(type);
    }
    return false;
};

/**
 * @param {HTMLElement} el
 * @param {String} text
 */
const insertText = (el, text) => {
    if (!el) {
        return;
    }
    const start = el.selectionStart !== null ? el.selectionStart : el.value.length;
    const end = el.selectionEnd !== null ? el.selectionEnd : el.value.length;
    const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    const newValue = el.value.slice(0, start) + text + el.value.slice(end);
    setter.call(el, newValue);
    el.selectionStart = start + text.length;
    el.selectionEnd = start + text.length;
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.focus();
};

/**
 * @param {HTMLElement} el
 */
const deleteBack = (el) => {
    if (!el) {
        return;
    }
    const start = el.selectionStart !== null ? el.selectionStart : el.value.length;
    const end = el.selectionEnd !== null ? el.selectionEnd : el.value.length;
    const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    let newValue;
    let pos;
    if (start === end && start > 0) {
        newValue = el.value.slice(0, start - 1) + el.value.slice(end);
        pos = start - 1;
    } else {
        newValue = el.value.slice(0, start) + el.value.slice(end);
        pos = start;
    }
    setter.call(el, newValue);
    el.selectionStart = pos;
    el.selectionEnd = pos;
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.focus();
};

/**
 * @param {String} label
 * @param {Object} opts {wide, small}
 * @return {HTMLButtonElement}
 */
const makeKey = (label, opts = {}) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'local-a11y-vk__key';
    if (opts.wide) {
        btn.classList.add('local-a11y-vk__key--wide');
    }
    if (opts.small) {
        btn.classList.add('local-a11y-vk__key--small');
    }
    btn.textContent = label;
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    return btn;
};

/**
 * Rebuild the whole key grid (needed when shift toggles, since letters change case).
 */
const renderKeys = async() => {
    const rows = container.querySelector('[data-region="rows"]');
    rows.innerHTML = '';

    LETTER_ROWS.forEach((row, ri) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'local-a11y-vk__row';

        if (ri === 2) {
            const shiftKey = makeKey('⇧', {wide: true});
            shiftKey.classList.toggle('local-a11y-vk__key--active', shift);
            shiftKey.addEventListener('click', () => {
                shift = !shift;
                renderKeys();
            });
            rowEl.appendChild(shiftKey);
        }

        row.forEach((ch) => {
            const display = (ri === 0 || !shift) ? ch : ch.toUpperCase();
            const key = makeKey(display);
            key.addEventListener('click', () => insertText(target, display));
            rowEl.appendChild(key);
        });

        if (ri === 2) {
            const backspace = makeKey('⌫', {wide: true});
            backspace.addEventListener('click', () => deleteBack(target));
            rowEl.appendChild(backspace);
        }

        rows.appendChild(rowEl);
    });

    const accentRow = document.createElement('div');
    accentRow.className = 'local-a11y-vk__row';
    ACCENTS.forEach((ch) => {
        const key = makeKey(ch, {small: true});
        key.addEventListener('click', () => insertText(target, ch));
        accentRow.appendChild(key);
    });
    rows.appendChild(accentRow);

    const bottomRow = document.createElement('div');
    bottomRow.className = 'local-a11y-vk__row';
    const dot = makeKey('.', {wide: true});
    dot.addEventListener('click', () => insertText(target, '.'));
    const comma = makeKey(',', {wide: true});
    comma.addEventListener('click', () => insertText(target, ','));
    const space = document.createElement('button');
    space.type = 'button';
    space.className = 'local-a11y-vk__space';
    space.textContent = await getString('vk_space', 'local_a11y');
    space.addEventListener('mousedown', (e) => e.preventDefault());
    space.addEventListener('click', () => insertText(target, ' '));
    const enter = makeKey('⏎', {wide: true});
    enter.addEventListener('click', () => insertText(target, '\n'));
    bottomRow.append(dot, comma, space, enter);
    rows.appendChild(bottomRow);
};

/**
 * Update the "Typing into: ..." status line.
 */
const renderStatus = async() => {
    const label = container.querySelector('[data-region="target-label"]');
    if (!label) {
        return;
    }
    if (target) {
        label.textContent = target.getAttribute('aria-label') || target.placeholder || target.name
            || (await getString('vk_textfield', 'local_a11y'));
    } else {
        label.textContent = await getString('vk_none', 'local_a11y');
    }
};

/**
 * core/modal.js::calculateZIndex() (Moodle core) sets every new modal's
 * z-index to (highest currently-visible [role=dialog]/[role=menubar]/
 * .moodle-has-zindex element's z-index) + 2 - a deliberate "always on top"
 * escalation. templates/panel.mustache gives the a11y panel role="dialog"
 * (rightly - it needs that for accessibility) at z-index 99989, so any
 * Moodle modal opened while the panel happens to be open/visible (e.g.
 * "Add an activity or resource") escalates itself to ~99991: past the
 * panel *and* the FAB (99990), and - the actual bug report - past the
 * keyboard (99982, never itself part of that scan, so it can never win
 * the arms race on its own). That's a real problem for the keyboard
 * specifically: its whole purpose is typing into fields, including ones
 * inside that very modal - it needs to end up on top of whatever just
 * opened, not just have a big fixed number. core/modal:shown (dispatched
 * on the modal's own root element, bubbles) fires after Moodle finishes
 * that escalation, so re-reading the modal's resolved z-index then and
 * jumping one above it (inline style beats the CSS z-index:99982 rule)
 * keeps the keyboard on top of *any* Moodle modal shown while it's
 * active, however high core/modal.js decided to go.
 *
 * @param {CustomEvent} e core/modal:shown - e.target is the modal's root element.
 */
const raiseAboveModal = (e) => {
    if (!container || !e.target) {
        return;
    }
    const modalZ = parseInt(getComputedStyle(e.target).zIndex, 10) || 0;
    const currentZ = parseInt(getComputedStyle(container).zIndex, 10) || 0;
    if (modalZ >= currentZ) {
        container.style.zIndex = modalZ + 1;
    }
};

/**
 * Show the keyboard and start tracking focus. Idempotent.
 */
export const start = async() => {
    if (container) {
        return;
    }
    container = document.createElement('div');
    container.className = 'local-a11y-root local-a11y-vk';
    container.innerHTML = '<div class="local-a11y-vk__status">'
        + '<span class="local-a11y-vk__status-icon">'
        + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" '
        + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/>'
        + '<path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/>'
        + '<path d="M16 12h.01"/><path d="M7 16h10"/></svg></span>'
        + '<span data-region="target-label" class="local-a11y-vk__status-target"></span>'
        + '</div><div data-region="rows" class="local-a11y-vk__rows"></div>';
    document.body.appendChild(container);

    onFocusIn = (e) => {
        if (isEditable(e.target)) {
            target = e.target;
            renderStatus();
        }
    };
    document.addEventListener('focusin', onFocusIn, true);

    onModalShown = raiseAboveModal;
    document.addEventListener('core/modal:shown', onModalShown);

    if (!target) {
        target = document.querySelector('#page input[type="text"], #page input:not([type])');
    }

    FabLift.setLift('vk', LIFT_PX);
    await renderStatus();
    await renderKeys();
};

/**
 * Hide the keyboard and stop tracking focus. Idempotent.
 */
export const stop = () => {
    if (!container) {
        return;
    }
    document.removeEventListener('focusin', onFocusIn, true);
    document.removeEventListener('core/modal:shown', onModalShown);
    onModalShown = null;
    FabLift.setLift('vk', 0);
    container.remove();
    container = null;
    target = null;
    shift = false;
};

/**
 * @param {Boolean} active
 */
export const sync = (active) => (active ? start() : stop());

export default {start, stop, sync};
