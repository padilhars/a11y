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
 * Persistence: Moodle user preference for logged-in (non-guest) users,
 * localStorage for everyone else, with one-time migration of a guest's
 * localStorage settings into their user preference on first login.
 *
 * `user_preference_allow_ajax_update()` / `lib/ajax/setuserpref.php` were
 * removed in this Moodle version (see MDL-79124) in favour of the
 * `core_user/repository` route-based module used here - see DECISIONS.md.
 *
 * @module     local_a11y/storage
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getUserPreference, setUserPreference} from 'core_user/repository';

export const PREFERENCE_NAME = 'local_a11y_settings';

export const DEFAULT_SETTINGS = {
    readableFont: false,
    dyslexicFont: false,
    highlightTitles: false,
    highlightLinks: false,
    highlightButtons: false,
    hideImages: false,
    tooltips: false,
    pauseAnimations: false,
    textSize: 0,
    lineHeight: 0,
    textSpacing: 0,
    textAlign: 0,
    contrast: 0,
    invertColors: false,
    colorChange: 0,
    saturation: 0,
    readingGuide: false,
    readingMask: false,
    cursor: 0,
    focusMode: false,
    screenReader: false,
    virtualKeyboard: false,
    voiceCommands: false,
};

const STEPPER_MAX = {
    textSize: 4,
    lineHeight: 3,
    textSpacing: 3,
    textAlign: 4,
    contrast: 3,
    colorChange: 3,
    saturation: 3,
    cursor: 2,
};

/**
 * Merge a raw (possibly partial/untrusted) object onto the defaults,
 * clamping stepper values and coercing booleans - the client-side mirror of
 * classes/manager.php::sanitize_settings(). Unknown keys are dropped.
 *
 * @param {Object|null} raw
 * @return {Object}
 */
export const sanitize = (raw) => {
    const result = {...DEFAULT_SETTINGS};
    if (!raw || typeof raw !== 'object') {
        return result;
    }
    Object.keys(DEFAULT_SETTINGS).forEach((key) => {
        if (!(key in raw)) {
            return;
        }
        if (key in STEPPER_MAX) {
            const value = parseInt(raw[key], 10) || 0;
            result[key] = Math.max(0, Math.min(STEPPER_MAX[key], value));
        } else {
            result[key] = Boolean(raw[key]);
        }
    });
    return result;
};

/**
 * @return {Object|null}
 */
const readLocalStorage = () => {
    try {
        const raw = window.localStorage.getItem(PREFERENCE_NAME);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
};

/**
 * @param {Object} settings
 */
const writeLocalStorage = (settings) => {
    try {
        window.localStorage.setItem(PREFERENCE_NAME, JSON.stringify(settings));
    } catch (e) {
        // Storage full/unavailable (private browsing) - silently ignore, matching
        // the prototype's "best effort" persistence.
    }
};

/**
 * Load the current settings.
 *
 * @param {Boolean} isLoggedIn True for a real (non-guest) logged-in user.
 * @return {Promise<Object>}
 */
export const getSettings = async(isLoggedIn) => {
    if (!isLoggedIn) {
        return sanitize(readLocalStorage());
    }

    let stored = null;
    try {
        stored = await getUserPreference(PREFERENCE_NAME);
    } catch (e) {
        stored = null;
    }

    if (stored) {
        return sanitize(JSON.parse(stored));
    }

    // No server-side preference yet: migrate any locally-stored guest
    // settings once, then clear localStorage so it doesn't shadow future
    // server values on a shared machine.
    const local = readLocalStorage();
    if (local) {
        const migrated = sanitize(local);
        await saveSettings(migrated, true);
        try {
            window.localStorage.removeItem(PREFERENCE_NAME);
        } catch (e) {
            // Ignore.
        }
        return migrated;
    }

    return sanitize(null);
};

/**
 * Persist the current settings.
 *
 * @param {Object} settings
 * @param {Boolean} isLoggedIn
 * @return {Promise}
 */
export const saveSettings = async(settings, isLoggedIn) => {
    if (!isLoggedIn) {
        writeLocalStorage(settings);
        return Promise.resolve();
    }
    return setUserPreference(PREFERENCE_NAME, JSON.stringify(settings));
};

export default {
    PREFERENCE_NAME,
    DEFAULT_SETTINGS,
    sanitize,
    getSettings,
    saveSettings,
};
