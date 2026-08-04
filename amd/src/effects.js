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
 * Applies a settings object as `a11y-*` classes on <body>, matching
 * _design-reference/app.jsx's own effect exactly (same class names, same
 * excluded keys). Mirrors the boolean/stepper class maps embedded by
 * classes/output/renderer.php::render_nofouc_script() - keep both in sync,
 * see CLAUDE.md.
 *
 * @module     local_a11y/effects
 * @description Applies a settings object as a11y-* classes on <body>.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

// Verbatim port of classes/manager.php::get_boolean_class_map(). tooltips is
// handled by amd/src/tooltips.js instead (D29), not a body class.
const BOOL_CLASS_MAP = {
    readableFont: 'a11y-readable-font',
    dyslexicFont: 'a11y-dyslexic-font',
    highlightTitles: 'a11y-highlight-titles',
    highlightLinks: 'a11y-highlight-links',
    highlightButtons: 'a11y-highlight-buttons',
    hideImages: 'a11y-hide-images',
    pauseAnimations: 'a11y-pause-animations',
    invertColors: 'a11y-invert',
    focusMode: 'a11y-focus-mode',
};

// Verbatim port of classes/manager.php::get_stepper_class_prefix_map().
const STEPPER_CLASS_PREFIX_MAP = {
    textSize: 'a11y-text-size-',
    lineHeight: 'a11y-line-height-',
    textSpacing: 'a11y-text-spacing-',
    textAlign: 'a11y-text-align-',
    contrast: 'a11y-contrast-',
    saturation: 'a11y-saturation-',
    colorChange: 'a11y-color-',
    cursor: 'a11y-cursor-',
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
 * Apply a settings object to <body>: remove every class this plugin may
 * have previously added, then add back only the ones the current settings
 * call for. Idempotent - safe to call on every change.
 *
 * @param {Object} settings The current a11y settings object to apply to <body>.
 * @return {void}
 */
export const apply = (settings) => {
    const body = document.body;
    Array.from(body.classList).forEach((cls) => {
        if (cls.startsWith('a11y-')) {
            body.classList.remove(cls);
        }
    });
    computeClassList(settings).forEach((cls) => body.classList.add(cls));
};

export default {
    apply,
};
