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

namespace local_a11y;

/**
 * Aggregate, anonymous usage-stat storage (D47): one row per accessibility
 * option, a running total counter and a last-modified timestamp - nothing
 * that identifies a user, session, course or request. See DECISIONS.md D47
 * for why this shape was chosen over per-event telemetry.
 *
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
class stats {
    /** @var string The table this class reads/writes - see db/install.xml. */
    const TABLE = 'local_a11y_stats';

    /**
     * Record one activation of the given option, incrementing its
     * site-wide counter by 1 (creating the row on first activation). A
     * silent no-op - returns false, touches nothing - whenever collection
     * is off (config::collect_stats_enabled()); the caller (classes/
     * external/record_activation.php) never has to check this itself,
     * keeping the "off by default, server is the source of truth"
     * guarantee in exactly one place.
     *
     * The increment is atomic for the common case (row already exists);
     * the narrow race on a feature's very first-ever activation (two
     * concurrent requests both finding no row yet, both trying to insert)
     * is handled by falling back to the atomic increment if the insert
     * loses the race against the unique index on featureid - the count is
     * never lost, just occasionally resolved via the fallback path.
     *
     * @param string $featureid Option id, e.g. "readableFont" - not validated against
     *        classes/options.php here (the caller already does that; this class only
     *        owns the table, not the concept of "valid option id").
     * @return bool True if a row was written, false if collection is off.
     */
    public static function record_activation(string $featureid): bool {
        if (!config::collect_stats_enabled()) {
            return false;
        }
        global $DB;
        $now = time();

        if ($DB->record_exists(self::TABLE, ['featureid' => $featureid])) {
            self::increment($featureid, $now);
            return true;
        }

        try {
            $DB->insert_record(self::TABLE, (object) [
                'featureid' => $featureid,
                'counter' => 1,
                'timemodified' => $now,
            ]);
        } catch (\dml_exception $e) {
            // Another request inserted this featureid's first row between
            // our record_exists() check above and this insert (the unique
            // index on featureid rejected ours) - increment the row that
            // request just created instead of losing this activation.
            self::increment($featureid, $now);
        }
        return true;
    }

    /**
     * Atomically increment one featureid's counter by 1 in a single UPDATE
     * (avoids a separate read-modify-write race for the common "row
     * already exists" case).
     *
     * @param string $featureid Option id whose counter to increment.
     * @param int $now Unix timestamp to record as timemodified.
     * @return void
     */
    private static function increment(string $featureid, int $now): void {
        global $DB;
        $DB->execute(
            'UPDATE {' . self::TABLE . '} SET counter = counter + 1, timemodified = :now WHERE featureid = :featureid',
            ['now' => $now, 'featureid' => $featureid]
        );
    }

    /**
     * Every recorded row, most-activated option first - used by
     * admin/stats.php to render the report.
     *
     * @return array<int, \stdClass> Rows (id, featureid, counter, timemodified), by counter descending.
     */
    public static function get_all(): array {
        global $DB;
        return $DB->get_records(self::TABLE, null, 'counter DESC, featureid ASC');
    }
}
