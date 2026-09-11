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
 * Uninstall steps for local_a11y.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      1.0.0
 */

/**
 * Removes data that the core plugin-uninstall routine does not know about.
 *
 * The {local_a11y_stats} table declared in install.xml is dropped
 * automatically by the core uninstall process. The local_a11y_settings
 * user preference is not: it lives in the shared {user_preferences} table
 * (see local_a11y_user_preferences() in lib.php), and the core routine
 * only removes rows in tables the plugin itself owns. Left alone, every
 * user who ever opened the accessibility panel would keep an orphaned
 * personal-data row after the plugin is removed (AUDIT-V2 finding
 * CODE-002).
 *
 * @return bool
 */
function xmldb_local_a11y_uninstall() {
    global $DB;

    $DB->delete_records('user_preferences', ['name' => \local_a11y\manager::PREFERENCE_NAME]);

    return true;
}
