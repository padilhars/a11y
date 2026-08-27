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
 * Tests for manager: defaults, merge, validation, sanitization.
 *
 * @description Tests for manager: defaults, merge, validation, sanitization.
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */
#[\PHPUnit\Framework\Attributes\CoversClass(manager::class)]
final class manager_test extends \advanced_testcase {

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
     * Default settings must have exactly the 28 known keys, all "off".
     * @return void
     */
    public function test_get_default_settings_shape(): void {
        $defaults = manager::get_default_settings();
        $this->assertCount(28, $defaults);
        foreach ($defaults as $key => $value) {
            $this->assertContains($value, [false, 0], "Default for '$key' should be false or 0");
        }
    }

    /**
     * A fully valid payload should pass through unchanged.
     * @return void
     */
    public function test_sanitize_settings_valid_payload(): void {
        $payload = manager::get_default_settings();
        $payload['readableFont'] = true;
        $payload['textSize'] = 2;

        $result = manager::sanitize_settings($payload);

        $this->assertTrue($result['readableFont']);
        $this->assertSame(2, $result['textSize']);
        $this->assertFalse($result['dyslexicFont']);
    }

    /**
     * Non-array input must fall back to defaults rather than erroring.
     * @return void
     */
    public function test_sanitize_settings_rejects_non_array(): void {
        $this->assertSame(manager::get_default_settings(), manager::sanitize_settings(null));
        $this->assertSame(manager::get_default_settings(), manager::sanitize_settings('not an array'));
        $this->assertSame(manager::get_default_settings(), manager::sanitize_settings(42));
    }

    /**
     * Stepper values must be clamped to [0, max], regardless of how far out of range.
     * @return void
     */
    public function test_sanitize_settings_clamps_stepper_values(): void {
        $result = manager::sanitize_settings(['textSize' => 999, 'contrast' => -50]);
        $this->assertSame(4, $result['textSize']);
        $this->assertSame(0, $result['contrast']);
    }

    /**
     * Unknown keys in the payload must be silently dropped, not merged in.
     * @return void
     */
    public function test_sanitize_settings_drops_unknown_keys(): void {
        $result = manager::sanitize_settings(['readableFont' => true, 'notARealOption' => 'x']);
        $this->assertArrayNotHasKey('notARealOption', $result);
        $this->assertTrue($result['readableFont']);
    }

    /**
     * Booleans arriving as the strings "true"/"1" (e.g. a naive form round-trip)
     * must still coerce correctly, and anything else must coerce to false.
     * @return void
     */
    public function test_sanitize_settings_coerces_stringy_booleans(): void {
        $result = manager::sanitize_settings([
            'readableFont' => 'true',
            'dyslexicFont' => '1',
            'highlightTitles' => 'false',
            'highlightLinks' => '0',
        ]);
        $this->assertTrue($result['readableFont']);
        $this->assertTrue($result['dyslexicFont']);
        $this->assertFalse($result['highlightTitles']);
        $this->assertFalse($result['highlightLinks']);
    }

    /**
     * An option the site admin has disabled (enabledfeatures) must be forced
     * back to its default, even if the client requests a non-default value.
     * @return void
     */
    public function test_sanitize_settings_respects_disabled_features(): void {
        set_config('enabledfeatures', 'readableFont,dyslexicFont', 'local_a11y');

        $result = manager::sanitize_settings(['textSize' => 3, 'readableFont' => true]);

        $this->assertSame(0, $result['textSize'], 'textSize is not in enabledfeatures, must stay default');
        $this->assertTrue($result['readableFont'], 'readableFont is in enabledfeatures, must apply');
    }

    /**
     * count_active() must count exactly the options that differ from default.
     *
     * @param array $settings Raw settings payload to sanitize and count.
     * @param int $expected Expected count_active() result.
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\DataProvider('count_active_provider')]
    public function test_count_active(array $settings, int $expected): void {
        $this->assertSame($expected, manager::count_active(manager::sanitize_settings($settings)));
    }

    /**
     * Data provider for test_count_active().
     *
     * @return array<string, array{0: array, 1: int}> Named cases of [settings, expected count].
     */
    public static function count_active_provider(): array {
        return [
            'all defaults' => [[], 0],
            'one boolean' => [['readableFont' => true], 1],
            'one stepper' => [['textSize' => 1], 1],
            'boolean and stepper' => [['readableFont' => true, 'contrast' => 3], 2],
        ];
    }

    /**
     * The boolean/stepper -> CSS class maps must never target the
     * always-JS-overlay booleans (readingGuide, readingMask, screenReader,
     * virtualKeyboard, voiceCommands, tooltips, silenceMedia, magnifier) -
     * see DECISIONS.md D29 / D40 / D42 / app.jsx parity.
     * @return void
     */
    public function test_boolean_class_map_excludes_overlay_only_options(): void {
        $map = manager::get_boolean_class_map();
        $overlayonly = [
            'readingGuide', 'readingMask', 'screenReader', 'virtualKeyboard', 'voiceCommands',
            'tooltips', 'silenceMedia', 'magnifier',
        ];
        foreach ($overlayonly as $key) {
            $this->assertArrayNotHasKey($key, $map);
        }
        $this->assertSame('a11y-invert', $map['invertColors']);
    }

    /**
     * colorChange must map to the "a11y-color-" prefix, not "a11y-color-change-".
     * @return void
     */
    public function test_stepper_class_prefix_map_colorchange(): void {
        $map = manager::get_stepper_class_prefix_map();
        $this->assertSame('a11y-color-', $map['colorChange']);
    }
}
