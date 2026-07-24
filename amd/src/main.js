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
 * from classes/hook_callbacks.php.
 *
 * @module     local_a11y/main
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Panel from 'local_a11y/panel';

/**
 * Entry point.
 */
export const init = () => {
    const fab = document.getElementById('local-a11y-fab');
    const panel = document.getElementById('local-a11y-panel');
    if (!fab || !panel) {
        return;
    }
    const overlay = document.querySelector('.local-a11y-panel-overlay');

    Panel.init(fab, panel, overlay);

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
