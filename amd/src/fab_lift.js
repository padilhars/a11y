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
 * Coordinates how far the FAB/panel get lifted off their default bottom
 * position. More than one feature can need this at once - Virtual Keyboard
 * (amd/src/virtual_keyboard.js) and Moodle's own sticky footer
 * (theme_boost/sticky-footer, class .stickyfooter, always spans left:0;
 * right:0 at the bottom of the viewport with its own action buttons
 * right-aligned - the exact spot the FAB sits by default) both claim the
 * bottom of the screen. Each caller registers its own required lift under a
 * stable key via setLift(); the FAB is lifted by the largest value
 * currently registered, so one feature going away (e.g. the keyboard
 * closing) never clobbers another still-active one's lift back to 0 - which
 * is what let the FAB sit on top of, and swallow clicks meant for, the
 * sticky footer's own buttons.
 *
 * @module     local_a11y/fab_lift
 * @description Coordinates how far the FAB/panel get lifted off their default bottom position.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

const lifts = {};

/**
 * Register (or clear) how many px a given feature needs the FAB lifted by.
 *
 * @param {String} key Stable identifier for the calling feature.
 * @param {Number} px 0 (or less) clears this feature's contribution.
 */
export const setLift = (key, px) => {
    if (px > 0) {
        lifts[key] = px;
    } else {
        delete lifts[key];
    }
    const amount = Math.max(0, ...Object.values(lifts));
    const fab = document.getElementById('local-a11y-fab');
    const panel = document.getElementById('local-a11y-panel');
    [fab, panel].forEach((el) => {
        if (!el) {
            return;
        }
        el.style.setProperty('--local-a11y-lift', `${amount}px`);
        el.classList.toggle('local-a11y-fab--lifted', amount > 0 && el === fab);
    });
};

export default {
    setLift,
};
