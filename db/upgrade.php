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
 * Upgrade steps for local_a11y.
 *
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */

/**
 * Applies incremental schema changes for local_a11y. install.xml only
 * takes effect on a brand-new install of the plugin - this site already
 * has local_a11y installed, so the D47 usage-stats table has to be
 * created here too, or upgrade.php would bump $plugin->version with
 * nothing actually creating the table.
 *
 * @param int $oldversion The version being upgraded from.
 * @return bool
 */
function xmldb_local_a11y_upgrade($oldversion) {
    global $DB;
    $dbman = $DB->get_manager();

    if ($oldversion < 2026082700) {
        $table = new xmldb_table('local_a11y_stats');
        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table->add_field('featureid', XMLDB_TYPE_CHAR, '100', null, XMLDB_NOTNULL, null, null);
        $table->add_field('counter', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $table->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $table->add_index('featureid', XMLDB_INDEX_UNIQUE, ['featureid']);

        if (!$dbman->table_exists($table)) {
            $dbman->create_table($table);
        }

        upgrade_plugin_savepoint(true, 2026082700, 'local', 'a11y');
    }

    if ($oldversion < 2026082800) {
        // D52: focusMode went from a toggle to a 3-level stepper. Every
        // stored user preference is a JSON blob, one row per user in
        // {user_preferences} (name = manager::PREFERENCE_NAME) - a legacy
        // 'focusMode' key there can be JSON true/false rather than an
        // integer. Reading is already safe either way (manager::
        // sanitize_settings() does (int) on it, and PHP casts true -> 1,
        // false -> 0 natively - see the comment on that cast) - this loop
        // normalises the value at rest instead, so the stored JSON matches
        // what every other stepper key has always looked like. A
        // recordset (not get_records) because this table can be large on
        // a real site; updating the row currently being iterated is safe
        // (Moodle upgrade scripts do this routinely), inserting new ones
        // while iterating would not be.
        $rs = $DB->get_recordset('user_preferences', ['name' => 'local_a11y_settings']);
        foreach ($rs as $pref) {
            $settings = json_decode($pref->value, true);
            if (!is_array($settings) || !array_key_exists('focusMode', $settings)) {
                continue;
            }
            if (!is_bool($settings['focusMode'])) {
                continue;
            }
            $settings['focusMode'] = $settings['focusMode'] ? 1 : 0;
            $pref->value = json_encode($settings);
            $DB->update_record('user_preferences', $pref);
        }
        $rs->close();

        upgrade_plugin_savepoint(true, 2026082800, 'local', 'a11y');
    }

    return true;
}
