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
 * Reading mask: dims everything above/below a stripe that follows the mouse
 * vertically, ported from ReadingMask in _design-reference/a11y-panel.jsx.
 *
 * @module     local_a11y/reading_mask
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

const STRIPE_HEIGHT = 110;

let top = null;
let bottom = null;
let onMove = null;

/**
 * Start following the mouse. Idempotent.
 */
export const start = () => {
    if (top) {
        return;
    }
    top = document.createElement('div');
    top.className = 'local-a11y-root local-a11y-reading-mask-top';
    bottom = document.createElement('div');
    bottom.className = 'local-a11y-root local-a11y-reading-mask-bottom';
    document.body.appendChild(top);
    document.body.appendChild(bottom);

    onMove = (e) => {
        const h = window.innerHeight;
        const y = e.clientY;
        top.style.height = Math.max(0, y - (STRIPE_HEIGHT / 2)) + 'px';
        bottom.style.height = Math.max(0, h - y - (STRIPE_HEIGHT / 2)) + 'px';
    };
    window.addEventListener('mousemove', onMove);
};

/**
 * Stop and remove the overlays. Idempotent.
 */
export const stop = () => {
    if (!top) {
        return;
    }
    window.removeEventListener('mousemove', onMove);
    top.remove();
    bottom.remove();
    top = null;
    bottom = null;
    onMove = null;
};

/**
 * @param {Boolean} active
 */
export const sync = (active) => (active ? start() : stop());

export default {start, stop, sync};
