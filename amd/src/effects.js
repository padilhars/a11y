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
 * Applies a settings object as `a11y-*` classes on <body>. Mirrors the
 * boolean/stepper class maps embedded by
 * classes/output/renderer.php::render_nofouc_script() - keep both in sync
 * when either one changes.
 *
 * @module     local_a11y/effects
 * @description Applies a settings object as a11y-* classes on <body>.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

// Verbatim port of classes/manager.php::get_boolean_class_map(). tooltips is
// handled by amd/src/tooltips.js instead (D29), not a body class. silenceMedia
// (D40) and magnifier (D42) join this exclusion too - purely behavioural,
// no CSS effect (magnifier's lens is entirely amd/src/magnifier.js).
// focusMode left this map for STEPPER_CLASS_PREFIX_MAP below (D52 - toggle
// to 3-level stepper), and dyslexicFont did the same (D75 - 2-level
// stepper, one font per level).
const BOOL_CLASS_MAP = {
    readableFont: 'a11y-readable-font',
    highlightTitles: 'a11y-highlight-titles',
    highlightLinks: 'a11y-highlight-links',
    highlightButtons: 'a11y-highlight-buttons',
    hideImages: 'a11y-hide-images',
    // signLanguage (D54) - see classes/manager.php::get_boolean_class_map()
    // for why this is safe to list unconditionally (the reveal CSS rule
    // needs a second, admin-controlled body class too - see styles.css).
    signLanguage: 'a11y-sign-language',
    pauseAnimations: 'a11y-pause-animations',
    invertColors: 'a11y-invert',
};

// Verbatim port of classes/manager.php::get_stepper_class_prefix_map().
const STEPPER_CLASS_PREFIX_MAP = {
    dyslexicFont: 'a11y-dyslexic-font-',
    textSize: 'a11y-text-size-',
    lineHeight: 'a11y-line-height-',
    textSpacing: 'a11y-text-spacing-',
    wordSpacing: 'a11y-word-spacing-',
    textAlign: 'a11y-text-align-',
    contrast: 'a11y-contrast-',
    saturation: 'a11y-saturation-',
    blueLightFilter: 'a11y-bluelight-',
    colorChange: 'a11y-color-',
    cursor: 'a11y-cursor-',
    focusMode: 'a11y-focus-mode-',
};

/**
 * Compute the full list of `a11y-*` classes for a given settings object.
 *
 * Module-private (dead-code audit: was exported/in the default export
 * object, but never consumed as Effects.computeClassList anywhere outside
 * this file - only apply() below, in the same module, ever calls it).
 *
 * @param {Object} settings The current a11y settings object (boolean/stepper values keyed by option id).
 * @return {String[]} The list of `a11y-*` body classes matching the given settings.
 */
const computeClassList = (settings) => {
    const classes = [];
    Object.keys(BOOL_CLASS_MAP).forEach((key) => {
        if (settings[key]) {
            classes.push(BOOL_CLASS_MAP[key]);
        }
    });
    Object.keys(STEPPER_CLASS_PREFIX_MAP).forEach((key) => {
        const value = parseInt(settings[key], 10) || 0;
        if (value > 0) {
            classes.push(STEPPER_CLASS_PREFIX_MAP[key] + value);
        }
    });
    return classes;
};

/**
 * Classes this module must never touch, in either direction - added
 * server-side from admin config, not derived from any user setting, so
 * they don't belong to computeClassList()'s output and must survive the
 * wipe below untouched. Currently just the one: a real bug, not
 * hypothetical - 'a11y-vlibras-integrated' (classes/hook_callbacks.php,
 * D54) was getting silently stripped within moments of every page load,
 * the instant main.js's first commit() ran, because it starts with
 * 'a11y-' like every class this module *does* own, and this function used
 * to remove every 'a11y-' class indiscriminately before re-adding only
 * what settings called for. Confirmed live: curl (no JS) showed the class
 * in the raw HTML; the same page through a real browser did not, seconds
 * later.
 *
 * @type {String[]}
 */
const EXTERNALLY_MANAGED_CLASSES = ['a11y-vlibras-integrated'];

/**
 * Apply a settings object to <body>: remove every class this plugin may
 * have previously added, then add back only the ones the current settings
 * call for. Idempotent - safe to call on every change. Never touches
 * EXTERNALLY_MANAGED_CLASSES above, in either direction.
 *
 * @param {Object} settings The current a11y settings object to apply to <body>.
 * @return {void}
 */
export const apply = (settings) => {
    const body = document.body;
    Array.from(body.classList).forEach((cls) => {
        if (cls.startsWith('a11y-') && !EXTERNALLY_MANAGED_CLASSES.includes(cls)) {
            body.classList.remove(cls);
        }
    });
    computeClassList(settings).forEach((cls) => body.classList.add(cls));
};

export default {
    apply,
};
