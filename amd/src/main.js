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
import ReadingGuide from 'local_a11y/reading_guide';
import ReadingMask from 'local_a11y/reading_mask';
import ScreenReader from 'local_a11y/screen_reader';
import VirtualKeyboard from 'local_a11y/virtual_keyboard';
import VoiceCommands from 'local_a11y/voice_commands';
import Tooltips from 'local_a11y/tooltips';

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
 * Voice command action -> settings mutation, passed to VoiceCommands.start().
 * Defined once init() has bound onToggle/onReset (see below).
 */
let voiceCallbacks = {};

/**
 * Start/stop the 6 "advanced" features (the booleans that drive a live JS
 * overlay/listener instead of a body CSS class, see classes/manager.php's
 * get_boolean_class_map() docblock) to match the current settings.
 */
const syncAdvancedFeatures = () => {
    ReadingGuide.sync(Boolean(settings.readingGuide));
    ReadingMask.sync(Boolean(settings.readingMask));
    ScreenReader.sync(Boolean(settings.screenReader));
    VirtualKeyboard.sync(Boolean(settings.virtualKeyboard));
    VoiceCommands.sync(Boolean(settings.voiceCommands), voiceCallbacks);
    Tooltips.sync(Boolean(settings.tooltips));
};

/**
 * Apply the in-memory `settings` object everywhere: page effects, DOM
 * (single option, or all of them), counts, and persist it.
 *
 * @param {String|null} onlyId Re-render just this option row, or null for all.
 */
const commit = async(onlyId = null) => {
    Effects.apply(settings);
    syncAdvancedFeatures();
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
 * Set a stepper option to a specific (clamped) value.
 *
 * @param {String} id
 * @param {Number} value
 */
const setStepperValue = (id, value) => {
    const meta = optionMeta[id];
    if (!meta) {
        return;
    }
    settings = {...settings, [id]: Math.max(0, Math.min(meta.max, value))};
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
    setStepperValue(id, (current + 1) % (meta.max + 1));
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

voiceCallbacks = {
    openPanel: () => Panel.open(),
    closePanel: () => Panel.close(),
    increaseTextSize: () => setStepperValue('textSize', (Number(settings.textSize) || 0) + 1),
    decreaseTextSize: () => setStepperValue('textSize', (Number(settings.textSize) || 0) - 1),
    highContrast: () => setStepperValue('contrast', 3),
    darkMode: () => setStepperValue('contrast', 1),
    reset: () => onReset(),
    toggleScreenReader: () => onToggle('screenReader', !settings.screenReader),
    toggleVirtualKeyboard: () => onToggle('virtualKeyboard', !settings.virtualKeyboard),
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

    // classes/output/renderer.php::render_footer_html() is injected by the
    // before_footer_html_generation hook deep inside #region-main (despite
    // the name), which sits inside #page - one of the elements the colour
    // filters (styles.css, D31) apply `filter` to directly. `filter` makes
    // its element the containing block for position:fixed descendants, so
    // if the FAB/panel stayed there, activating Inverter Cores/Mudar
    // Cores/Saturação would silently break their (and the reset button's,
    // etc.) fixed positioning - they'd scroll away with the page instead of
    // staying put, exactly like Moodle's own navbar/drawers did before D31.
    // Relocating them to be direct children of <body> - never inside
    // anything this plugin (or, so far, Moodle core) ever applies a filter
    // to - decouples them from that permanently, regardless of which page
    // regions future effects end up touching.
    document.body.appendChild(fab);
    if (overlay) {
        document.body.appendChild(overlay);
    }
    document.body.appendChild(panelEl);

    // Moodle's own "sticky footer" pattern (theme_boost/sticky-footer,
    // core/sticky-footer; used e.g. by the course content bulk-edit
    // toolbar) parks a position:fixed element just below the viewport via
    // a negative `bottom` offset until activated - the exact same "relies
    // on staying *viewport*-fixed while parked off-screen" pattern that
    // broke for Moodle's message-drawer before D31 stopped filtering
    // #page-wrapper as a whole. Unlike the navbar/drawers, though, a
    // .stickyfooter element renders *inside* #page's own content (course
    // format templates) - and, importantly, it's already sitting there in
    // the DOM (parked, correctly invisible) the moment the page loads in
    // editing mode, whether or not bulk-edit is ever actually turned on.
    // An earlier version of this fix only relocated it reactively, on the
    // 'core/stickyfooter_state_changed' event Moodle fires when bulk-edit
    // is toggled - but since the element is already inside #page well
    // before that event could ever fire, simply activating Inverter
    // Cores/Mudar Cores/Saturação (which puts `filter` on #page - still
    // needed there, for real page content) immediately recomputed its
    // "parked" bottom:-Npx against #page's own (much taller) box instead
    // of the viewport, dropping it at some arbitrary point down the page
    // instead of just off the bottom of the screen - visible the moment
    // that point scrolled into view, with no bulk-edit toggle involved at
    // all. Relocating it here proactively, the same way as the FAB/panel
    // above, fixes that; the event listener stays too, as a backstop for
    // the (so far unobserved, but possible) case of one being inserted
    // into the DOM later rather than already present at load.
    const relocateStickyFooters = () => {
        document.querySelectorAll('.stickyfooter').forEach((el) => {
            if (el.parentElement !== document.body) {
                document.body.appendChild(el);
            }
        });
    };
    relocateStickyFooters();
    document.addEventListener('core/stickyfooter_state_changed', relocateStickyFooters);

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
    syncAdvancedFeatures();
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
