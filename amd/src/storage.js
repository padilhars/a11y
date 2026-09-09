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
 * @description Persistence: Moodle user preference for logged-in users, localStorage otherwise.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

import {getUserPreference, setUserPreference} from 'core_user/repository';

// Module-private (dead-code audit: was exported/in the default export
// object, but never consumed as Storage.PREFERENCE_NAME anywhere outside
// this file).
const PREFERENCE_NAME = 'local_a11y_settings';

export const DEFAULT_SETTINGS = {
    readableFont: false,
    dyslexicFont: 0,
    highlightTitles: false,
    highlightLinks: false,
    highlightButtons: false,
    hideImages: false,
    tooltips: false,
    // signLanguage (D54): always present here, unconditionally, unlike
    // its entry in classes/manager.php::get_default_settings() (which IS
    // conditional on the local_vlibras integration being on) - this file
    // can't ask core_plugin_manager anything, it just needs a safe shape.
    // A stale true value here (e.g. guest localStorage from when the
    // integration used to be on) only ever adds the 'a11y-sign-language'
    // body class on its own, which matches no CSS rule by itself - see
    // classes/manager.php's own comment on get_boolean_class_map() for the
    // full reasoning.
    signLanguage: false,
    pauseAnimations: false,
    silenceMedia: false,
    textSize: 0,
    lineHeight: 0,
    textSpacing: 0,
    wordSpacing: 0,
    textAlign: 0,
    bionicReading: false,
    contrast: 0,
    invertColors: false,
    colorChange: 0,
    saturation: 0,
    blueLightFilter: 0,
    readingGuide: false,
    readingMask: false,
    magnifier: false,
    cursor: 0,
    focusMode: 0,
    contentWidth: 0,
    screenReader: false,
    virtualKeyboard: false,
    voiceCommands: false,
    faceNavigation: false,
};

const STEPPER_MAX = {
    dyslexicFont: 2,
    textSize: 4,
    lineHeight: 3,
    textSpacing: 3,
    wordSpacing: 3,
    textAlign: 4,
    contrast: 3,
    colorChange: 3,
    saturation: 3,
    blueLightFilter: 3,
    cursor: 2,
    focusMode: 3,
    contentWidth: 3,
};

/**
 * Merge a raw (possibly partial/untrusted) object onto the defaults,
 * clamping stepper values and coercing booleans - the client-side mirror of
 * classes/manager.php::sanitize_settings(). Unknown keys are dropped.
 *
 * Module-private (dead-code audit: was exported/in the default export
 * object, but never consumed as Storage.sanitize anywhere outside this
 * file - only getSettings() below, in the same module, ever calls it).
 *
 * @param {Object|null} raw The raw, possibly partial/untrusted settings object (or null).
 * @return {Object} A full settings object with every key from DEFAULT_SETTINGS present and sanitized.
 */
const sanitize = (raw) => {
    const result = {...DEFAULT_SETTINGS};
    if (!raw || typeof raw !== 'object') {
        return result;
    }
    Object.keys(DEFAULT_SETTINGS).forEach((key) => {
        if (!(key in raw)) {
            return;
        }
        if (key in STEPPER_MAX) {
            // A guest's localStorage (the only place this sanitize() ever
            // runs against untrusted data - see getSettings() below) can
            // hold a legacy boolean for a key that used to be a toggle and
            // became a stepper (focusMode, D52). parseInt(true, 10)
            // stringifies to "true" and returns NaN -> the `|| 0` fallback
            // below would silently turn a legacy "on" into level 0 (off)
            // instead of preserving it. Coerce true/false to 1/0 first, so
            // any future toggle-to-stepper migration gets this for free too.
            let rawValue = raw[key];
            if (typeof rawValue === 'boolean') {
                rawValue = rawValue ? 1 : 0;
            }
            const value = parseInt(rawValue, 10) || 0;
            result[key] = Math.max(0, Math.min(STEPPER_MAX[key], value));
        } else {
            result[key] = Boolean(raw[key]);
        }
    });
    return result;
};

/**
 * Read and JSON-parse the settings stored in localStorage, if any.
 *
 * @return {Object|null} The parsed object, or null if unset/unavailable/invalid JSON.
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
 * JSON-stringify and write a settings object to localStorage. Silently
 * ignores failures (storage full, private browsing, etc.) - best-effort
 * persistence, matching the prototype.
 *
 * @param {Object} settings The settings object to persist.
 * @return {void}
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
 * @return {Promise<Object>} Resolves to a full, sanitized settings object.
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

    // Security audit finding, fixed: local_a11y_settings is stored with no
    // format validation server-side (lib.php declares it PARAM_RAW -
    // sanitize_settings() only runs when READING it back, see
    // classes/manager.php), so a corrupted/non-JSON value is always
    // possible here (e.g. a direct core_user_set_user_preference call
    // bypassing this module entirely). JSON.parse() used to run outside any
    // try/catch, so a bad value threw an unhandled rejection out of this
    // whole async function and silently broke Panel/Effects initialisation
    // for that user on every page - never for anyone else's account, but a
    // real self-inflicted denial of this plugin's own accessibility
    // features. Treated the same as "no value yet" now - falls through to
    // the same guest-migration/defaults path below, which also has the
    // side effect of overwriting the corrupted value with a valid one the
    // next time settings are saved.
    let parsed = null;
    if (stored) {
        try {
            parsed = JSON.parse(stored);
        } catch (e) {
            parsed = null;
        }
    }

    if (parsed) {
        return sanitize(parsed);
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
 * @param {Object} settings The settings object to persist.
 * @param {Boolean} isLoggedIn True for a real (non-guest) logged-in user.
 * @return {Promise} Resolves once the preference/localStorage write completes.
 */
export const saveSettings = async(settings, isLoggedIn) => {
    if (!isLoggedIn) {
        writeLocalStorage(settings);
        return Promise.resolve();
    }
    return setUserPreference(PREFERENCE_NAME, JSON.stringify(settings));
};

export default {
    DEFAULT_SETTINGS,
    getSettings,
    saveSettings,
};
