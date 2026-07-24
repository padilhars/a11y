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
 * Panel DOM ownership: open/close, category collapse, option row rendering
 * and click delegation. Holds no state of its own - local_a11y/main owns the
 * settings object and passes render updates in, and receives user
 * interactions back out via the `callbacks` passed to init().
 *
 * @module     local_a11y/panel
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getString} from 'core/str';

let fab = null;
let panel = null;
let overlay = null;
let lastFocused = null;
let cb = {};

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
 * Re-render a single option row (toggle switch or stepper) to match `value`.
 *
 * @param {String} id
 * @param {Boolean|Number} value
 * @param {Boolean|Number} defaultValue
 */
const renderOption = async(id, value, defaultValue) => {
    const row = panel.querySelector(`[data-region="option"][data-option-id="${id}"]`);
    if (!row) {
        return;
    }
    const isActive = value !== defaultValue;
    row.classList.toggle('local-a11y-option--active', isActive);

    if (row.dataset.kind === 'toggle') {
        const switchEl = row.querySelector('[data-region="switch"]');
        if (switchEl) {
            switchEl.setAttribute('aria-pressed', value ? 'true' : 'false');
        }
        return;
    }

    // Stepper.
    row.dataset.value = String(value);
    const labelEl = row.querySelector('[data-region="stepper-label"]');
    if (labelEl) {
        labelEl.textContent = await getString(`${row.dataset.levelprefix}${value}`, 'local_a11y');
    }
    row.querySelectorAll('[data-region="stepper-dots"] > span').forEach((dot, index) => {
        dot.classList.toggle('local-a11y-stepper__dot--active', index === Number(value) && index > 0);
    });
};

/**
 * Update the header status text, reset button and FAB badge to match the
 * current active-option count. The reset button is always present (never
 * hidden - see DECISIONS.md D23) - only its disabled state and colouring
 * change.
 *
 * @param {Number} count
 */
const renderHeader = async(count) => {
    const status = panel.querySelector('[data-region="status"]');
    const resetButton = panel.querySelector('[data-region="reset-button"]');
    const badge = fab.querySelector('[data-region="badge"]');

    if (status) {
        status.classList.toggle('local-a11y-panel__subtitle--active', count > 0);
        status.textContent = count > 0
            ? await getString(count === 1 ? 'activecountone' : 'activecount', 'local_a11y', count)
            : await getString('noneactive', 'local_a11y');
    }
    if (resetButton) {
        resetButton.disabled = count === 0;
        resetButton.classList.toggle('local-a11y-panel__reset-icon--active', count > 0);
    }
    if (badge) {
        badge.hidden = count === 0;
        badge.textContent = String(count);
    }
};

/**
 * Update a category's active-option badge.
 *
 * @param {String} categoryId
 * @param {Number} count
 */
const renderCategoryCount = (categoryId, count) => {
    const category = panel.querySelector(`[data-region="category"][data-category-id="${categoryId}"]`);
    if (!category) {
        return;
    }
    const countEl = category.querySelector('[data-region="category-count"]');
    if (countEl) {
        countEl.hidden = count === 0;
        countEl.textContent = String(count);
    }
};

/**
 * Mark the given profile card as active (or none, if id is null) and, when
 * one is, copy its tone CSS variables onto the header reset button (see
 * DECISIONS.md D23) so it reads in the active profile's own colour instead
 * of the plain accent - cleared when no profile is active, so the button's
 * CSS falls back to the accent again.
 *
 * @param {String|null} id
 */
const renderActiveProfile = (id) => {
    const toneprops = ['--local-a11y-tone-bg', '--local-a11y-tone-text', '--local-a11y-tone-icon', '--local-a11y-tone-border'];
    const resetButton = panel.querySelector('[data-region="reset-button"]');
    let activeCard = null;

    panel.querySelectorAll('[data-region="profile-card"]').forEach((card) => {
        const isActive = card.dataset.profileId === id;
        card.classList.toggle('local-a11y-profile-card--active', isActive);
        card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        const check = card.querySelector('[data-region="profile-check"]');
        if (check) {
            check.hidden = !isActive;
        }
        if (isActive) {
            activeCard = card;
        }
    });

    if (!resetButton) {
        return;
    }
    toneprops.forEach((prop) => {
        if (activeCard) {
            resetButton.style.setProperty(prop, activeCard.style.getPropertyValue(prop));
        } else {
            resetButton.style.removeProperty(prop);
        }
    });
};

/**
 * Show/hide option rows and categories to match a search query, forcing all
 * matching categories open (and hiding the profiles section) while
 * searching - matching the prototype's search behaviour exactly. Restores
 * each category's prior expand state once the query is cleared.
 *
 * @param {String} query
 */
const filterOptions = (query) => {
    const q = query.trim().toLowerCase();
    const isSearching = q.length > 0;

    const profilesSection = panel.querySelector('[data-region="profiles-section"]');
    if (profilesSection) {
        profilesSection.hidden = isSearching;
    }

    panel.querySelectorAll('[data-region="category"]').forEach((category) => {
        const header = category.querySelector('[data-action="toggle-category"]');
        const body = category.querySelector('[data-region="category-body"]');
        let anyVisible = false;

        category.querySelectorAll('[data-region="option"]').forEach((row) => {
            const label = row.querySelector('.local-a11y-option__label');
            const text = label ? label.textContent.toLowerCase() : '';
            const match = !isSearching || text.includes(q);
            row.hidden = !match;
            if (match) {
                anyVisible = true;
            }
        });

        category.hidden = isSearching && !anyVisible;

        if (isSearching) {
            if (header.dataset.wasExpanded === undefined) {
                header.dataset.wasExpanded = header.getAttribute('aria-expanded');
            }
            header.setAttribute('aria-expanded', 'true');
            header.disabled = true;
            body.hidden = false;
        } else if (header.dataset.wasExpanded !== undefined) {
            header.setAttribute('aria-expanded', header.dataset.wasExpanded);
            body.hidden = header.dataset.wasExpanded !== 'true';
            header.disabled = false;
            delete header.dataset.wasExpanded;
        }
    });
};

/**
 * All currently visible, non-disabled focusable elements inside the panel,
 * in DOM order - used by the Tab-key focus trap.
 *
 * @return {HTMLElement[]}
 */
const getFocusable = () => Array.from(panel.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
)).filter((el) => el.offsetParent !== null);

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
        const resetTrigger = e.target.closest('[data-action="reset"]');
        if (resetTrigger) {
            if (cb.onReset) {
                cb.onReset();
            }
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
            return;
        }
        const profileCard = e.target.closest('[data-region="profile-card"]');
        if (profileCard) {
            if (cb.onProfileSelect) {
                cb.onProfileSelect(profileCard.dataset.profileId);
            }
            return;
        }
        const option = e.target.closest('[data-region="option"]');
        if (option) {
            const id = option.dataset.optionId;
            if (option.dataset.kind === 'toggle') {
                const switchEl = option.querySelector('[data-region="switch"]');
                const pressed = switchEl && switchEl.getAttribute('aria-pressed') === 'true';
                if (cb.onToggle) {
                    cb.onToggle(id, !pressed);
                }
            } else if (cb.onStepperCycle) {
                cb.onStepperCycle(id);
            }
        }
    });

    panel.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') {
            return;
        }
        const option = e.target.closest('[data-region="option"]');
        if (option) {
            e.preventDefault();
            option.click();
        }
    });

    const searchInput = panel.querySelector('[data-region="search-input"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterOptions(e.target.value);
            if (cb.onSearch) {
                cb.onSearch(e.target.value);
            }
            const clearBtn = panel.querySelector('[data-action="clear-search"]');
            if (clearBtn) {
                clearBtn.hidden = e.target.value === '';
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', close);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) {
            close();
        }
    });

    // WCAG 2.2 focus trap: Tab/Shift+Tab cycle within the panel while open.
    panel.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab' || !isOpen()) {
            return;
        }
        const focusable = getFocusable();
        if (focusable.length === 0) {
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });
};

/**
 * @param {HTMLElement} fabEl
 * @param {HTMLElement} panelEl
 * @param {HTMLElement|null} overlayEl
 * @param {Object} callbacks {onToggle, onStepperCycle, onReset, onProfileSelect, onSearch}
 */
export const init = (fabEl, panelEl, overlayEl, callbacks = {}) => {
    fab = fabEl;
    panel = panelEl;
    overlay = overlayEl;
    cb = callbacks;
    registerEventListeners();
};

export default {
    init,
    open,
    close,
    toggle,
    renderOption,
    renderHeader,
    renderCategoryCount,
    renderActiveProfile,
};
