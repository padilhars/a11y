<?php
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
 * Library callbacks for local_a11y.
 *
 * @package    local_a11y
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Registers the local_a11y_settings user preference so it can be read/written
 * through the core_user preferences REST route (core_user/repository AMD
 * module). This is the replacement for the removed
 * user_preference_allow_ajax_update() whitelist - see DECISIONS.md.
 *
 * @return array
 */
function local_a11y_user_preferences() {
    return [
        \local_a11y\manager::PREFERENCE_NAME => [
            'null' => NULL_ALLOWED,
            'default' => null,
            'type' => PARAM_RAW,
        ],
    ];
}
