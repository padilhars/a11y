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
 * The 9 accessibility profiles - a verbatim port of the `apply` presets in
 * _design-reference/a11y-data.jsx PROFILES. Labels/icons/tone colours are
 * NOT duplicated here: they're already server-rendered into the profile
 * card DOM (classes/output/panel.php), and read from there by panel.js.
 *
 * @module     local_a11y/profiles
 * @description The 9 accessibility profiles (port of PROFILES apply presets).
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

// Module-private (dead-code audit: was exported/in the default export
// object, but never consumed as Profiles.PROFILES anywhere outside this
// file - only applyProfile() below, in the same module, ever reads it).
const PROFILES = {
    lowVision: {textSize: 3, contrast: 3, cursor: 1, highlightLinks: true, highlightButtons: true},
    colorBlind: {colorChange: 2, highlightLinks: true, saturation: 1},
    // fontVariant (D75, renamed from dyslexicFont - AUDIT-V2 LGPD-002): 1
    // (Lexend), not true - it became a 2-level stepper in D75; level 1
    // preserves this profile's original behaviour.
    dyslexia: {fontVariant: 1, textSpacing: 2, lineHeight: 2, readingGuide: true},
    // focusMode: 2 ("Leitura confortável"), not just on/off, since D52.
    adhd: {readingMask: true, focusMode: 2, pauseAnimations: true},
    senior: {readableFont: true, textSize: 2, highlightButtons: true, cursor: 1, lineHeight: 1},
    epilepsy: {pauseAnimations: true, saturation: 2, contrast: 1},
    motor: {cursor: 1, highlightButtons: true, tooltips: true, focusMode: 0},
    cognitive: {focusMode: 2, pauseAnimations: true, readableFont: true, lineHeight: 2, hideImages: false},
    night: {contrast: 1, saturation: 2},
};

/**
 * Apply a profile preset onto the defaults (a full reset before layering the
 * preset, matching applyProfile() in the prototype).
 *
 * @param {String} id The profile id (key into PROFILES), e.g. "lowVision".
 * @param {Object} defaults The full default settings object to layer the preset on top of.
 * @return {Object|null} The merged settings object, or null if `id` doesn't match a known profile.
 */
export const applyProfile = (id, defaults) => {
    const preset = PROFILES[id];
    if (!preset) {
        return null;
    }
    return {...defaults, ...preset};
};

/**
 * Find which profile (if any) the given settings exactly match, so the
 * right profile card can be shown as active right after a fresh page
 * load/reload - main.js's activeProfileId is deliberately ephemeral
 * per-tab (see its own comment), but the settings values a profile
 * produced DO persist (Storage.getSettings()); this reconstructs "which
 * profile card, if any, produced these settings" from the settings
 * themselves instead of needing a new persisted field of its own. Also
 * used after a profile is applied, so a settings object built by
 * applyProfile() always round-trips back to the same id.
 *
 * Exact match only, on every key of `defaults` - the same "any manual
 * tweak clears the active profile" rule already enforced in main.js's
 * onToggle()/setStepperValue() (which set activeProfileId back to null
 * the moment a single option is changed by hand) applies here too: a
 * settings object that only *mostly* matches a profile is correctly
 * treated as "no profile active", not the closest one.
 *
 * @param {Object} settings The current settings object to test.
 * @param {Object} defaults The full default settings object (Storage.DEFAULT_SETTINGS).
 * @return {String|null} The matching profile id, or null if settings don't exactly match any profile.
 */
export const matchProfile = (settings, defaults) => {
    const id = Object.keys(PROFILES).find((profileId) => {
        const applied = applyProfile(profileId, defaults);
        return Object.keys(defaults).every((key) => applied[key] === settings[key]);
    });
    return id || null;
};

export default {
    applyProfile,
    matchProfile,
};
