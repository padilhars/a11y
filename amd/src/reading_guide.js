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
 * Reading guide: a thin horizontal line that follows the mouse vertically,
 * ported from ReadingGuide in _design-reference/a11y-panel.jsx.
 *
 * @module     local_a11y/reading_guide
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

let el = null;
let onMove = null;

/**
 * Start following the mouse. Idempotent.
 */
export const start = () => {
    if (el) {
        return;
    }
    el = document.createElement('div');
    el.className = 'local-a11y-root local-a11y-reading-guide';
    document.body.appendChild(el);

    onMove = (e) => {
        el.style.transform = `translateY(${e.clientY - 1.5}px)`;
    };
    window.addEventListener('mousemove', onMove);
};

/**
 * Stop and remove the overlay. Idempotent.
 */
export const stop = () => {
    if (!el) {
        return;
    }
    window.removeEventListener('mousemove', onMove);
    el.remove();
    el = null;
    onMove = null;
};

/**
 * @param {Boolean} active
 */
export const sync = (active) => (active ? start() : stop());

export default {start, stop, sync};
