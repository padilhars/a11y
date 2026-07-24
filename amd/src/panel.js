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
 * Panel open/close, category collapse. State application (M3), search /
 * profile selection / focus trap (M4) are layered on top in later modules.
 *
 * @module     local_a11y/panel
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

let fab = null;
let panel = null;
let overlay = null;
let lastFocused = null;

/**
 * @return {boolean}
 */
const isOpen = () => panel && !panel.hidden;

/**
 * Open the panel: unhide it, flip ARIA state, move focus in.
 */
const open = () => {
    if (!panel || isOpen()) {
        return;
    }
    lastFocused = document.activeElement;
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    fab.setAttribute('aria-expanded', 'true');
    if (overlay && (panel.classList.contains('local-a11y-panel--modal')
            || panel.classList.contains('local-a11y-panel--drawer'))) {
        overlay.hidden = false;
    }
    const closeBtn = panel.querySelector('[data-action="close"]');
    if (closeBtn) {
        closeBtn.focus();
    }
};

/**
 * Close the panel: hide it, flip ARIA state, return focus to the FAB.
 */
const close = () => {
    if (!panel || !isOpen()) {
        return;
    }
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    fab.setAttribute('aria-expanded', 'false');
    if (overlay) {
        overlay.hidden = true;
    }
    (lastFocused || fab).focus();
};

/**
 * Toggle open/closed.
 */
const toggle = () => {
    if (isOpen()) {
        close();
    } else {
        open();
    }
};

/**
 * Expand/collapse an option category.
 *
 * @param {HTMLElement} header
 */
const toggleCategory = (header) => {
    const expanded = header.getAttribute('aria-expanded') === 'true';
    const category = header.closest('[data-region="category"]');
    const body = category ? category.querySelector('[data-region="category-body"]') : null;
    if (!body) {
        return;
    }
    header.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    body.hidden = expanded;
};

/**
 * Wire up all panel-level DOM event listeners.
 */
const registerEventListeners = () => {
    fab.addEventListener('click', toggle);

    panel.addEventListener('click', (e) => {
        const closeTrigger = e.target.closest('[data-action="close"]');
        if (closeTrigger) {
            close();
            return;
        }
        const categoryHeader = e.target.closest('[data-action="toggle-category"]');
        if (categoryHeader) {
            toggleCategory(categoryHeader);
            return;
        }
        const clearSearch = e.target.closest('[data-action="clear-search"]');
        if (clearSearch) {
            const input = panel.querySelector('[data-region="search-input"]');
            if (input) {
                input.value = '';
                input.dispatchEvent(new Event('input'));
                input.focus();
            }
        }
    });

    if (overlay) {
        overlay.addEventListener('click', close);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) {
            close();
        }
    });
};

/**
 * @param {HTMLElement} fabEl
 * @param {HTMLElement} panelEl
 * @param {HTMLElement|null} overlayEl
 */
export const init = (fabEl, panelEl, overlayEl) => {
    fab = fabEl;
    panel = panelEl;
    overlay = overlayEl;
    registerEventListeners();
};

export default {
    init,
    open,
    close,
    toggle,
};
