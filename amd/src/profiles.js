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
    dyslexia: {dyslexicFont: true, textSpacing: 2, lineHeight: 2, readingGuide: true},
    adhd: {readingMask: true, focusMode: true, pauseAnimations: true},
    senior: {readableFont: true, textSize: 2, highlightButtons: true, cursor: 1, lineHeight: 1},
    epilepsy: {pauseAnimations: true, saturation: 2, contrast: 1},
    motor: {cursor: 1, highlightButtons: true, tooltips: true, focusMode: false},
    cognitive: {focusMode: true, pauseAnimations: true, readableFont: true, lineHeight: 2, hideImages: false},
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

export default {
    applyProfile,
};
