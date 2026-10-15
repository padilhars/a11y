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

namespace local_a11y\integration;

/**
 * Tests for the manual-mode path a real site reported: VLibras added via
 * Moodle's "Additional HTML" admin setting rather than the local_vlibras
 * Marketplace plugin, which is_available() used to always read as "not
 * present" (is_installed() can only ever see an actually-installed plugin,
 * never raw injected HTML/JS).
 *
 * vlibras::is_installed() is deliberately never asserted to be false here:
 * whether local_vlibras happens to be installed is a property of whichever
 * site runs this test suite (it genuinely is, on this project's own dev
 * site - D54-D58 were all written against it live), not something a unit
 * test should assume either way. The manual-mode-specific tests below
 * markTestSkipped() themselves on a site where it IS installed, since their
 * whole premise - "no real plugin exists to answer these questions" - does
 * not hold there; manager_test.php-style environment guards like this are
 * the standard way Moodle core itself handles the same situation.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      1.1.0
 */
#[\PHPUnit\Framework\Attributes\CoversClass(vlibras::class)]
final class vlibras_integration_test extends \advanced_testcase {
    /**
     * PHPUnit fixture setup: resets the Moodle test environment after each
     * test, then skips straight away on a site where local_vlibras is
     * actually installed - every test in this file specifically exercises
     * the "no real plugin" fallback path.
     *
     * @return void
     */
    public function setUp(): void {
        parent::setUp();
        $this->resetAfterTest();
        if (vlibras::is_installed()) {
            $this->markTestSkipped(
                'local_vlibras is installed on this site; manual-mode fallback tests only apply when it is not.'
            );
        }
    }

    /**
     * With the manual flag off (the default), VLibras must read as
     * unavailable - the exact bug reported: silently doing nothing is
     * correct here only because nothing was ever declared present.
     *
     * @return void
     */
    public function test_not_available_without_manual_flag(): void {
        set_config('vlibrasmanual', 0, 'local_a11y');
        $this->assertFalse(vlibras::is_available());
        $this->assertFalse(vlibras::is_integrated());
    }

    /**
     * The reported scenario: VLibras is running on the page (admin pasted
     * its script into Additional HTML), local_vlibras was never installed,
     * but the admin has told this plugin about it via vlibrasmanual. That
     * alone must make is_available() true; is_integrated() still also
     * needs local_a11y/integratevlibras, same as the installed-plugin path.
     *
     * @return void
     */
    public function test_manual_flag_makes_vlibras_available_without_the_plugin(): void {
        set_config('vlibrasmanual', 1, 'local_a11y');
        $this->assertTrue(vlibras::is_available());
        $this->assertFalse(vlibras::is_integrated(), 'available alone must not imply integrated');

        set_config('integratevlibras', 1, 'local_a11y');
        $this->assertTrue(vlibras::is_integrated());
    }

    /**
     * Manual mode has no `local_vlibras/position` config to read at all
     * (nothing installed it), so a position collision must never be
     * reported for it - there is nothing real to compare against, and a
     * coincidental default-bucket match would be a false positive, not a
     * real warning about two floating buttons stacking on screen.
     *
     * @return void
     */
    public function test_no_position_collision_warning_in_manual_mode(): void {
        set_config('vlibrasmanual', 1, 'local_a11y');
        set_config('fabposition', 'bottom-right', 'local_a11y');
        $this->assertFalse(vlibras::has_position_collision());
    }
}
