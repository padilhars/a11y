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

namespace local_a11y\privacy;

use core_privacy\local\metadata\collection;
use core_privacy\local\request\writer;

/**
 * Privacy provider for local_a11y.
 *
 * The plugin stores exactly one piece of personal data: the
 * `local_a11y_settings` user preference (a JSON blob of the user's chosen
 * accessibility options). No database tables, no data shared with other
 * users or systems. Not-logged-in/guest users' settings live in the
 * browser's localStorage only, which Moodle's privacy subsystem has no
 * visibility into (and nothing to export/delete server-side for).
 *
 * @description Privacy provider for local_a11y.
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */
class provider implements
    \core_privacy\local\metadata\provider,
    \core_privacy\local\request\user_preference_provider {

    /**
     * Declares the one piece of personal data this plugin stores.
     *
     * @param collection $items The metadata collection to add to.
     * @return collection The updated metadata collection.
     */
    public static function get_metadata(collection $items): collection {
        $items->add_user_preference(
            \local_a11y\manager::PREFERENCE_NAME,
            'privacy:metadata:preference:local_a11y_settings'
        );
        return $items;
    }

    /**
     * Exports this user's local_a11y_settings preference, if set.
     *
     * @param int $userid The user whose preference should be exported.
     * @return void
     */
    public static function export_user_preferences(int $userid) {
        $preference = get_user_preferences(\local_a11y\manager::PREFERENCE_NAME, null, $userid);
        if ($preference === null) {
            return;
        }
        $decoded = \local_a11y\manager::sanitize_settings(json_decode($preference, true));
        writer::export_user_preference(
            'local_a11y',
            \local_a11y\manager::PREFERENCE_NAME,
            json_encode($decoded, JSON_PRETTY_PRINT),
            get_string('privacy:metadata:preference:local_a11y_settings', 'local_a11y')
        );
    }
}
