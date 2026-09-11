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
 * Tests for config, in particular the WCAG contrast-ratio helpers added to
 * resolve AUDIT-V2 finding WCAG-002 (customisable colours were never
 * validated for contrast).
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      1.0.0
 */
#[\PHPUnit\Framework\Attributes\CoversClass(config::class)]
final class config_test extends \advanced_testcase {
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
     * Black vs white is the maximum possible contrast ratio: exactly 21:1.
     * @return void
     */
    public function test_contrast_ratio_black_vs_white_is_21(): void {
        $this->assertEqualsWithDelta(21.0, config::contrast_ratio('#000000', '#ffffff'), 0.01);
    }

    /**
     * Identical colours have the minimum possible ratio: exactly 1:1.
     * @return void
     */
    public function test_contrast_ratio_identical_colours_is_1(): void {
        $this->assertEqualsWithDelta(1.0, config::contrast_ratio('#3b82f6', '#3b82f6'), 0.01);
    }

    /**
     * Argument order must not matter - contrast is symmetric.
     * @return void
     */
    public function test_contrast_ratio_is_order_independent(): void {
        $ab = config::contrast_ratio('#eab308', '#ffffff');
        $ba = config::contrast_ratio('#ffffff', '#eab308');
        $this->assertEqualsWithDelta($ab, $ba, 0.0001);
    }

    /**
     * 3-digit hex shorthand must resolve to the same result as its expanded 6-digit form.
     * @return void
     */
    public function test_contrast_ratio_accepts_3_digit_shorthand(): void {
        $short = config::contrast_ratio('#000', '#fff');
        $long = config::contrast_ratio('#000000', '#ffffff');
        $this->assertEqualsWithDelta($long, $short, 0.0001);
    }

    /**
     * A malformed colour (not 3/6 hex digits) must return null, never throw
     * or silently treat it as black/white.
     * @return void
     */
    public function test_contrast_ratio_returns_null_for_malformed_colour(): void {
        $this->assertNull(config::contrast_ratio('not-a-colour', '#ffffff'));
        $this->assertNull(config::contrast_ratio('#12', '#ffffff'));
        $this->assertNull(config::contrast_ratio('', '#ffffff'));
    }

    /**
     * warn_if_low_contrast() must add a \core\notification warning when the
     * configured colour falls below the WCAG 1.4.11 3:1 minimum against
     * white (the plugin's default accent, #3b82f6, is well above it - used
     * here as a known-bad-if-inverted-logic guard, then a real light
     * pastel colour is checked for the actual warning path).
     * @return void
     */
    public function test_warn_if_low_contrast_adds_notification_for_low_contrast_colour(): void {
        // A light pastel yellow: contrast against white is well under 3:1.
        set_config('accent', '#fdf6b2', 'local_a11y');
        $this->assertLessThan(3.0, config::contrast_ratio('#fdf6b2', '#ffffff'));

        config::warn_if_low_contrast('accent', 'Accent color');

        $notifications = \core\notification::fetch();
        $this->assertNotEmpty($notifications);
        $found = false;
        foreach ($notifications as $notification) {
            if (str_contains($notification->get_message(), 'Accent color')) {
                $found = true;
            }
        }
        $this->assertTrue($found, 'Expected a low-contrast warning notification mentioning the setting label.');
    }

    /**
     * A colour with sufficient contrast must not add any notification.
     * @return void
     */
    public function test_warn_if_low_contrast_adds_nothing_for_good_contrast_colour(): void {
        set_config('accent', '#1d4ed8', 'local_a11y');
        $this->assertGreaterThanOrEqual(3.0, config::contrast_ratio('#1d4ed8', '#ffffff'));

        config::warn_if_low_contrast('accent', 'Accent color');

        $this->assertEmpty(\core\notification::fetch());
    }
}
