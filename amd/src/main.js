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
 * local_a11y bootstrap. Called once per page via $PAGE->requires->js_call_amd()
 * from classes/hook_callbacks.php. Owns the settings state object; Panel
 * owns the DOM and reports user interaction back via callbacks; Effects
 * translates settings into body classes; Storage persists them.
 *
 * @module     local_a11y/main
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Panel from 'local_a11y/panel';
import Effects from 'local_a11y/effects';
import Storage from 'local_a11y/storage';
import Profiles from 'local_a11y/profiles';

let settings = {...Storage.DEFAULT_SETTINGS};
let isLoggedIn = false;
// Which profile preset (if any) is currently applied. Ephemeral (not
// persisted) - matches the prototype's own local component state, which
// also resets on reload; only the resulting `settings` values persist.
let activeProfileId = null;
// Built from the server-rendered DOM itself (data-kind/data-max/category),
// so option metadata never has to be duplicated a third time in JS.
let optionMeta = {};

/**
 * @param {String} id
 * @return {Boolean|Number}
 */
const defaultOf = (id) => Storage.DEFAULT_SETTINGS[id];

/**
 * Recompute and render every category's active-option badge.
 */
const renderCategoryCounts = () => {
    const byCategory = {};
    Object.keys(optionMeta).forEach((id) => {
        const cat = optionMeta[id].categoryId;
        const isActive = settings[id] !== defaultOf(id);
        byCategory[cat] = (byCategory[cat] || 0) + (isActive ? 1 : 0);
    });
    Object.keys(byCategory).forEach((cat) => Panel.renderCategoryCount(cat, byCategory[cat]));
};

/**
 * Recompute the total active-option count and render the header/badge.
 */
const renderHeaderCount = () => {
    const count = Object.keys(Storage.DEFAULT_SETTINGS)
        .filter((id) => settings[id] !== Storage.DEFAULT_SETTINGS[id]).length;
    Panel.renderHeader(count);
};

/**
 * Apply the in-memory `settings` object everywhere: page effects, DOM
 * (single option, or all of them), counts, and persist it.
 *
 * @param {String|null} onlyId Re-render just this option row, or null for all.
 */
const commit = async(onlyId = null) => {
    Effects.apply(settings);
    if (onlyId) {
        await Panel.renderOption(onlyId, settings[onlyId], defaultOf(onlyId));
    } else {
        await Promise.all(Object.keys(optionMeta).map(
            (id) => Panel.renderOption(id, settings[id], defaultOf(id))
        ));
    }
    renderCategoryCounts();
    await renderHeaderCount();
    await Storage.saveSettings(settings, isLoggedIn);
};

/**
 * @param {String} id
 * @param {Boolean} value
 */
const onToggle = (id, value) => {
    if (!(id in optionMeta)) {
        return;
    }
    settings = {...settings, [id]: value};
    activeProfileId = null;
    Panel.renderActiveProfile(null);
    commit(id);
};

/**
 * @param {String} id
 */
const onStepperCycle = (id) => {
    const meta = optionMeta[id];
    if (!meta) {
        return;
    }
    const current = Number(settings[id]) || 0;
    const next = (current + 1) % (meta.max + 1);
    settings = {...settings, [id]: next};
    activeProfileId = null;
    Panel.renderActiveProfile(null);
    commit(id);
};

/**
 * Restore every option to its default value.
 */
const onReset = () => {
    settings = {...Storage.DEFAULT_SETTINGS};
    activeProfileId = null;
    Panel.renderActiveProfile(null);
    commit();
};

/**
 * Apply a profile preset (or clear it, if the same profile is clicked
 * again - matching the prototype's toggle-off behaviour).
 *
 * @param {String} id
 */
const onProfileSelect = (id) => {
    if (activeProfileId === id) {
        onReset();
        return;
    }
    const applied = Profiles.applyProfile(id, Storage.DEFAULT_SETTINGS);
    if (!applied) {
        return;
    }
    settings = applied;
    activeProfileId = id;
    Panel.renderActiveProfile(id);
    commit();
};

/**
 * Scan the server-rendered option rows to build the id -> {kind, max,
 * categoryId} metadata map, without duplicating that data a third time.
 *
 * @param {HTMLElement} panelEl
 * @return {Object}
 */
const buildOptionMeta = (panelEl) => {
    const meta = {};
    panelEl.querySelectorAll('[data-region="option"]').forEach((row) => {
        const category = row.closest('[data-region="category"]');
        meta[row.dataset.optionId] = {
            kind: row.dataset.kind,
            max: row.dataset.max ? parseInt(row.dataset.max, 10) : 0,
            categoryId: category ? category.dataset.categoryId : null,
        };
    });
    return meta;
};

/**
 * Entry point.
 *
 * @param {Boolean} loggedIn True for a real (non-guest) logged-in user.
 */
export const init = async(loggedIn) => {
    const fab = document.getElementById('local-a11y-fab');
    const panelEl = document.getElementById('local-a11y-panel');
    if (!fab || !panelEl) {
        return;
    }
    const overlay = document.querySelector('.local-a11y-panel-overlay');

    isLoggedIn = Boolean(loggedIn);
    optionMeta = buildOptionMeta(panelEl);
    settings = await Storage.getSettings(isLoggedIn);

    Panel.init(fab, panelEl, overlay, {
        onToggle,
        onStepperCycle,
        onReset,
        onProfileSelect,
    });

    // Re-apply/re-render once the real settings are loaded: the inline
    // no-FOUC script (classes/output/renderer.php::render_nofouc_script())
    // already applied its best guess synchronously to avoid a flash, but
    // this is the authoritative value (e.g. after a guest->login migration)
    // and keeps the option rows' own state in sync with it.
    Effects.apply(settings);
    await Promise.all(Object.keys(optionMeta).map(
        (id) => Panel.renderOption(id, settings[id], defaultOf(id))
    ));
    renderCategoryCounts();
    await renderHeaderCount();

    // Alt+A global shortcut (documented in the panel footer).
    document.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'a' || e.key === 'A')) {
            e.preventDefault();
            Panel.toggle();
        }
    });
};

export default {
    init,
};
