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
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
class stats {
    /** @var string The running-total table this class reads/writes - see db/install.xml. */
    const TABLE = 'local_a11y_stats';

    /**
     * Trend table (added for the daily/weekly usage charts on
     * admin/stats.php): one row per (featureid, day) pair, each with its
     * own counter - same aggregate/anonymous shape as TABLE above, just
     * with a day bucket instead of a single running total, so a trend over
     * time can be shown without adding anything that could identify a user,
     * session or individual request. See day_bucket() for how "day" is
     * computed, and get_daily_since() for reading this table back.
     *
     * @var string
     */
    const TABLE_DAILY = 'local_a11y_stats_daily';

    /**
     * User-type breakdown table: one row per (featureid, guest) pair - so
     * exactly 2 rows per option at most (one for real accounts, one for
     * Moodle's built-in Guest account), each with its own counter. Same
     * aggregate/anonymous shape as the other two tables: `guest` is a
     * 0/1 role flag decided once per request by the caller (classes/
     * external/record_activation.php, via isguestuser()), never a
     * specific user id - it cannot be used to single out which guest
     * session or which authenticated account triggered any activation,
     * only how many came from each of the two groups in total.
     *
     * Note this is *not* the same thing as "logged in vs never logged
     * in": a genuinely anonymous visitor (never logged in at all, not
     * even as Guest) never reaches this class in the first place - see
     * record_activation()'s own docblock and D79 in DECISIONS.md. "guest"
     * here means specifically Moodle's Guest account.
     *
     * @var string
     */
    const TABLE_BYTYPE = 'local_a11y_stats_bytype';

    /**
     * Record one activation of the given option, incrementing its
     * site-wide counter by 1 (creating the row on first activation), its
     * per-day counter in TABLE_DAILY, and its per-user-type counter in
     * TABLE_BYTYPE, all the same way. A silent no-op - returns false,
     * touches nothing - whenever collection is off
     * (config::collect_stats_enabled()); the caller (classes/
     * external/record_activation.php) never has to check this itself,
     * keeping the "off by default, server is the source of truth"
     * guarantee in exactly one place.
     *
     * The increment is atomic for the common case (row already exists);
     * the narrow race on a feature's very first-ever activation (two
     * concurrent requests both finding no row yet, both trying to insert)
     * is handled by falling back to the atomic increment if the insert
     * loses the race against the unique index on featureid - the count is
     * never lost, just occasionally resolved via the fallback path. The
     * same pattern is used for the daily row (unique on featureid+day)
     * and the by-type row (unique on featureid+guest).
     *
     * @param string $featureid Option id, e.g. "readableFont" - not validated against
     *        classes/options.php here (the caller already does that; this class only
     *        owns the table, not the concept of "valid option id").
     * @param bool $isguest Whether this activation came from Moodle's Guest account
     *        (isguestuser()) rather than a real authenticated account - decided by the
     *        caller, since this class has no notion of "current user" of its own.
     * @return bool True if a row was written, false if collection is off.
     */
    public static function record_activation(string $featureid, bool $isguest = false): bool {
        if (!config::collect_stats_enabled()) {
            return false;
        }
        global $DB;
        $now = time();

        if ($DB->record_exists(self::TABLE, ['featureid' => $featureid])) {
            self::increment($featureid, $now);
        } else {
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
        }

        self::increment_daily($featureid, self::day_bucket($now));
        self::increment_bytype($featureid, $isguest);
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
     * Today's date as a `YYYYMMDD` integer (e.g. 20260912), always
     * computed in UTC (gmdate(), not date()) so the day boundary doesn't
     * shift with the server's configured timezone or a site's per-user
     * timezone settings - the same bucket is used no matter who triggers
     * the request that happens to cross midnight.
     *
     * @param int $now Unix timestamp.
     * @return int The day bucket $now falls into.
     */
    private static function day_bucket(int $now): int {
        return (int) gmdate('Ymd', $now);
    }

    /**
     * Same insert-or-increment pattern as record_activation() above, for
     * TABLE_DAILY's (featureid, day) unique key instead of TABLE's
     * featureid-only one.
     *
     * @param string $featureid Option id being activated.
     * @param int $day Day bucket from day_bucket().
     * @return void
     */
    private static function increment_daily(string $featureid, int $day): void {
        global $DB;
        $params = ['featureid' => $featureid, 'day' => $day];

        if ($DB->record_exists(self::TABLE_DAILY, $params)) {
            $DB->execute(
                'UPDATE {' . self::TABLE_DAILY . '} SET counter = counter + 1 WHERE featureid = :featureid AND day = :day',
                $params
            );
            return;
        }

        try {
            $DB->insert_record(self::TABLE_DAILY, (object) ($params + ['counter' => 1]));
        } catch (\dml_exception $e) {
            $DB->execute(
                'UPDATE {' . self::TABLE_DAILY . '} SET counter = counter + 1 WHERE featureid = :featureid AND day = :day',
                $params
            );
        }
    }

    /**
     * Same insert-or-increment pattern as record_activation() above, for
     * TABLE_BYTYPE's (featureid, guest) unique key.
     *
     * @param string $featureid Option id being activated.
     * @param bool $isguest Whether this activation came from Moodle's Guest account.
     * @return void
     */
    private static function increment_bytype(string $featureid, bool $isguest): void {
        global $DB;
        $params = ['featureid' => $featureid, 'guest' => (int) $isguest];

        if ($DB->record_exists(self::TABLE_BYTYPE, $params)) {
            $DB->execute(
                'UPDATE {' . self::TABLE_BYTYPE . '} SET counter = counter + 1 WHERE featureid = :featureid AND guest = :guest',
                $params
            );
            return;
        }

        try {
            $DB->insert_record(self::TABLE_BYTYPE, (object) ($params + ['counter' => 1]));
        } catch (\dml_exception $e) {
            $DB->execute(
                'UPDATE {' . self::TABLE_BYTYPE . '} SET counter = counter + 1 WHERE featureid = :featureid AND guest = :guest',
                $params
            );
        }
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

    /**
     * Daily activation counts for the trend chart on admin/stats.php,
     * from $days ago (inclusive) to today.
     *
     * @param int $days How many days back to include (e.g. 30).
     * @return array<int, \stdClass> Rows (id, featureid, day, counter), day ascending. `id` is
     *         included only because get_records_select() needs a unique first column to key the
     *         returned array by - featureid/day repeat across rows, so neither alone would do.
     */
    public static function get_daily_since(int $days): array {
        global $DB;
        $sinceday = self::day_bucket(time() - $days * DAYSECS);
        return $DB->get_records_select(
            self::TABLE_DAILY,
            'day >= :sinceday',
            ['sinceday' => $sinceday],
            'day ASC, featureid ASC',
            'id, featureid, day, counter'
        );
    }

    /**
     * User-type breakdown for admin/stats.php's "by user type" chart.
     * Existing sites have no by-type history before this feature was
     * added - every activation before then went only into TABLE, with no
     * record of which type of account triggered it, so it cannot be
     * split retroactively. This only ever reflects activations recorded
     * since that version.
     *
     * @return array<int, \stdClass> Rows (id, featureid, guest, counter). `id` is included for the
     *         same reason as get_daily_since() - featureid/guest each repeat across rows.
     */
    public static function get_bytype(): array {
        global $DB;
        return $DB->get_records(self::TABLE_BYTYPE, null, 'featureid ASC, guest ASC', 'id, featureid, guest, counter');
    }
}
