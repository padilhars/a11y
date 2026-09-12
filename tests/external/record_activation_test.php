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

namespace local_a11y\external;

/**
 * Tests for record_activation, the plugin's only external-API/AJAX
 * endpoint. Added to resolve AUDIT-V2 finding TEST-002: this endpoint had
 * no dedicated unit test covering its parameter validation, capability
 * check, sesskey check, and unknown-featureid handling - only exercised
 * indirectly via stats_test.php (which calls \local_a11y\stats directly,
 * bypassing this class entirely) and Behat.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      1.0.0
 */
#[\PHPUnit\Framework\Attributes\CoversClass(record_activation::class)]
final class record_activation_test extends \advanced_testcase {
    /**
     * PHPUnit fixture setup: resets the Moodle test environment after each
     * test and logs in a standard user with a valid sesskey (the common
     * case for most tests below; the sesskey/capability tests override
     * what they need to).
     *
     * @return void
     */
    public function setUp(): void {
        parent::setUp();
        $this->resetAfterTest();

        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);
        $_POST['sesskey'] = sesskey();

        set_config('collectstats', 1, 'local_a11y');
    }

    /**
     * A known, real option id must be recorded and reported as such.
     * @return void
     */
    public function test_execute_records_a_known_featureid(): void {
        global $DB;

        $result = record_activation::execute('readableFont');

        $this->assertTrue($result['recorded']);
        $this->assertEquals(1, $DB->count_records(\local_a11y\stats::TABLE, ['featureid' => 'readableFont']));
    }

    /**
     * A real authenticated account's activation must land in
     * TABLE_BYTYPE's guest=0 row - execute() passes isguestuser(), not a
     * client-supplied value, so this only proves the wiring is correct
     * for the ordinary case setUp() already logs in as.
     * @return void
     */
    public function test_execute_records_authenticated_activation_as_not_guest(): void {
        global $DB;

        record_activation::execute('readableFont');

        $row = $DB->get_record(\local_a11y\stats::TABLE_BYTYPE, ['featureid' => 'readableFont']);
        $this->assertSame('0', (string) $row->guest);
    }

    /**
     * Moodle's Guest account (local/a11y:view is granted to it by default
     * - see db/access.php) must land in TABLE_BYTYPE's guest=1 row.
     * @return void
     */
    public function test_execute_records_guest_activation_as_guest(): void {
        global $DB;
        $this->setGuestUser();
        $_POST['sesskey'] = sesskey();

        $result = record_activation::execute('readableFont');

        $this->assertTrue($result['recorded']);
        $row = $DB->get_record(\local_a11y\stats::TABLE_BYTYPE, ['featureid' => 'readableFont']);
        $this->assertSame('1', (string) $row->guest);
    }

    /**
     * An unknown/stale featureid must be silently ignored (no exception,
     * `recorded => false`, nothing written) - see the docblock on
     * record_activation::execute() for why this is deliberate.
     * @return void
     */
    public function test_execute_ignores_unknown_featureid(): void {
        global $DB;

        $result = record_activation::execute('notARealOptionId');

        $this->assertFalse($result['recorded']);
        $this->assertEquals(0, $DB->count_records(\local_a11y\stats::TABLE));
    }

    /**
     * A malformed featureid (fails PARAM_ALPHANUMEXT) must be rejected by
     * parameter validation itself, before execute()'s own body ever runs.
     * @return void
     */
    public function test_execute_rejects_malformed_featureid(): void {
        $this->expectException(\invalid_parameter_exception::class);
        record_activation::execute('not valid! id/with spaces');
    }

    /**
     * Without a valid sesskey, execute() must refuse to run at all - this
     * is the plugin's only state-changing endpoint, so this is its one
     * CSRF check.
     * @return void
     */
    public function test_execute_requires_valid_sesskey(): void {
        global $DB;
        $_POST['sesskey'] = 'not-the-real-sesskey';

        $this->expectException(\moodle_exception::class);
        try {
            record_activation::execute('readableFont');
        } finally {
            $this->assertEquals(0, $DB->count_records(\local_a11y\stats::TABLE));
        }
    }

    /**
     * Without the local/a11y:view capability, execute() must refuse to
     * run, regardless of sesskey validity.
     * @return void
     */
    public function test_execute_requires_capability(): void {
        global $DB;

        $context = \context_system::instance();
        $roleid = $this->getDataGenerator()->create_role();
        assign_capability('local/a11y:view', CAP_PROHIBIT, $roleid, $context->id);
        role_assign($roleid, $this->getDataGenerator()->create_user()->id, $context->id);

        $noaccessuser = $this->getDataGenerator()->create_user();
        role_assign($roleid, $noaccessuser->id, $context->id);
        $this->setUser($noaccessuser);
        $_POST['sesskey'] = sesskey();

        $this->expectException(\required_capability_exception::class);
        try {
            record_activation::execute('readableFont');
        } finally {
            $this->assertEquals(0, $DB->count_records(\local_a11y\stats::TABLE));
        }
    }

    /**
     * With usage-stat collection disabled site-wide, a known featureid
     * must still be accepted (no exception) but report `recorded => false`
     * and write nothing - classes/stats.php::record_activation() re-checks
     * this itself rather than trusting the client.
     * @return void
     */
    public function test_execute_reports_not_recorded_when_stats_disabled(): void {
        global $DB;
        set_config('collectstats', 0, 'local_a11y');

        $result = record_activation::execute('readableFont');

        $this->assertFalse($result['recorded']);
        $this->assertEquals(0, $DB->count_records(\local_a11y\stats::TABLE));
    }
}
