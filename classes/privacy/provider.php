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
 * The plugin stores exactly one piece of PERSONAL data: the
 * `local_a11y_settings` user preference (a JSON blob of the user's chosen
 * accessibility options). Not-logged-in/guest users' settings live in the
 * browser's localStorage only, which Moodle's privacy subsystem has no
 * visibility into (and nothing to export/delete server-side for).
 *
 * Since D47 the plugin also has a database table, `local_a11y_stats`
 * (optional, off by default - see `local_a11y/collectstats`) - it is
 * DELIBERATELY NOT declared anywhere below via `add_database_table()`
 * (the method for describing tables that *do* hold personal data),
 * because it holds none: one row per accessibility option (a global
 * counter and a last-modified timestamp), no userid/courseid/sessionid/
 * IP/per-event timestamp column at all, so there is nothing in it to
 * export or delete for any individual user, and no code path in this
 * plugin ever queries it by user. See DECISIONS.md D47 for the full
 * schema rationale and classes/stats.php for the only code that writes
 * to it.
 *
 * `local_a11y_stats_daily` (added for the usage-trend chart on
 * admin/stats.php) is the same story with the same conclusion: one row
 * per (featureid, day) pair, a global counter, no user-identifying column
 * of any kind - bucketed by day instead of a single running total, but
 * that's still an aggregate over every user site-wide, not a per-user
 * record. Not declared for the same reason as local_a11y_stats above.
 *
 * `local_a11y_stats_bytype` (added for the "activations by user type"
 * chart) is the same story again: one row per (featureid, guest) pair, a
 * global counter, and a `guest` column that is a 0/1 role flag decided
 * once per request (isguestuser()) - not a user id, not a session id,
 * and not derived from anything specific to one individual. It answers
 * "how many activations came from the Guest account vs. real accounts,
 * in total", never "which guest" or "which account". Not declared for
 * the same reason as the two tables above.
 *
 * Since D62 (security audit finding) the metadata also declares an
 * `add_external_location_link()`: the "Voice Commands" option uses the
 * browser's native Web Speech API, which - in Chrome/Chromium - sends the
 * captured microphone audio to Google's own remote speech-recognition
 * service to transcribe it (confirmed against MDN's own documentation of
 * SpeechRecognition). This plugin never sends, receives or stores that
 * audio or its transcription itself - the browser does this on its own,
 * outside any code in this plugin - but the Privacy API has no other way
 * to represent "a feature you can turn on causes the browser itself to
 * talk to a third party", so this is the closest accurate declaration
 * available. See amd/src/voice_commands.js for the runtime consent notice
 * shown before this ever happens.
 *
 * AUDIT-V2 finding LGPD-001: "Face Navigation" has the same class of gap,
 * not previously declared here. Its MediaPipe component (JS bundle +
 * model file) is fetched live from jsDelivr and Google's own CDN when the
 * option is first activated (see amd/src/face_navigation.js's MP_CDN/
 * MP_MODEL) - hash-verified for integrity, but the fetch itself still
 * reveals the user's IP address/User-Agent to those two third parties,
 * the same way any third-party network request would. No video/image
 * data is ever sent anywhere (face landmark detection runs 100% locally
 * in the browser, see the same file) - only this one-time asset download
 * touches a third party.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
class provider implements
    \core_privacy\local\metadata\provider,
    \core_privacy\local\request\user_preference_provider {
    /**
     * Declares the one piece of personal data this plugin stores. Does
     * NOT declare `local_a11y_stats` (D47): that table is fully aggregate
     * (one counter per accessibility option, site-wide) and contains no
     * column that identifies a user, session, course or individual
     * request - there is nothing personal in it to declare. See the class
     * docblock above for the full reasoning.
     *
     * @param collection $items The metadata collection to add to.
     * @return collection The updated metadata collection.
     */
    public static function get_metadata(collection $items): collection {
        $items->add_user_preference(
            \local_a11y\manager::PREFERENCE_NAME,
            'privacy:metadata:preference:local_a11y_settings'
        );
        $items->add_external_location_link('speechrecognitionservice', [
            'audio' => 'privacy:metadata:speechrecognitionservice:audio',
        ], 'privacy:metadata:speechrecognitionservice');
        $items->add_external_location_link('facenavigationcdn', [
            'ipaddress' => 'privacy:metadata:facenavigationcdn:ipaddress',
        ], 'privacy:metadata:facenavigationcdn');
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
