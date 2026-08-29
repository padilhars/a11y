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
 * Tests for stats: aggregate, anonymous usage-counter storage (D47).
 *
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
#[\PHPUnit\Framework\Attributes\CoversClass(stats::class)]
final class stats_test extends \advanced_testcase {
    /**
     * PHPUnit fixture setup: resets the Moodle test environment after each test.
     *
     * @return void
     */
    public function setUp(): void {
        parent::setUp();
        $this->resetAfterTest();
    }

    /**
     * With collection off (the default), record_activation() must write
     * nothing at all and report false.
     * @return void
     */
    public function test_record_activation_writes_nothing_when_disabled(): void {
        global $DB;
        set_config('collectstats', 0, 'local_a11y');

        $result = stats::record_activation('readableFont');

        $this->assertFalse($result);
        $this->assertEquals(0, $DB->count_records(stats::TABLE));
    }

    /**
     * With collection on, the first activation creates a row with
     * counter=1, and a second activation of the same feature increments
     * the same row rather than creating a second one.
     * @return void
     */
    public function test_record_activation_increments_when_enabled(): void {
        global $DB;
        set_config('collectstats', 1, 'local_a11y');

        $first = stats::record_activation('readableFont');
        $this->assertTrue($first);

        $row = $DB->get_record(stats::TABLE, ['featureid' => 'readableFont']);
        $this->assertNotFalse($row);
        $this->assertSame('1', (string) $row->counter);

        stats::record_activation('readableFont');
        $row = $DB->get_record(stats::TABLE, ['featureid' => 'readableFont']);
        $this->assertSame('2', (string) $row->counter);

        // Still exactly one row for this feature - never a row per event.
        $this->assertEquals(1, $DB->count_records(stats::TABLE, ['featureid' => 'readableFont']));

        // A different feature gets its own independent row/counter.
        stats::record_activation('magnifier');
        $this->assertEquals(2, $DB->count_records(stats::TABLE));
        $magnifierrow = $DB->get_record(stats::TABLE, ['featureid' => 'magnifier']);
        $this->assertSame('1', (string) $magnifierrow->counter);
    }

    /**
     * The table must never carry any column that could identify a user,
     * session, course or individual request - only the 4 aggregate
     * columns declared in db/install.xml (id, featureid, counter,
     * timemodified) may exist.
     * @return void
     */
    public function test_table_has_no_user_identifying_columns(): void {
        global $DB;

        $columns = array_keys($DB->get_columns(stats::TABLE));

        $forbidden = ['userid', 'usermodified', 'courseid', 'sessionid', 'ip', 'ipaddress', 'useragent', 'eventtime'];
        foreach ($forbidden as $col) {
            $this->assertNotContains(
                $col,
                $columns,
                "Column '$col' must not exist on " . stats::TABLE . " - it would let individual behaviour be reconstructed."
            );
        }

        $this->assertEqualsCanonicalizing(['id', 'featureid', 'counter', 'timemodified'], $columns);
    }

    /**
     * get_all() returns every recorded row, most-activated first.
     * @return void
     */
    public function test_get_all_orders_by_counter_descending(): void {
        set_config('collectstats', 1, 'local_a11y');

        stats::record_activation('readableFont');
        stats::record_activation('magnifier');
        stats::record_activation('magnifier');
        stats::record_activation('magnifier');

        $rows = array_values(stats::get_all());

        $this->assertCount(2, $rows);
        $this->assertSame('magnifier', $rows[0]->featureid);
        $this->assertSame('3', (string) $rows[0]->counter);
        $this->assertSame('readableFont', $rows[1]->featureid);
    }
}
