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
 * Tests for the local_a11y privacy provider.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
#[\PHPUnit\Framework\Attributes\CoversClass(\local_a11y\privacy\provider::class)]
final class privacy_provider_test extends \advanced_testcase {
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
     * Metadata must declare exactly the local_a11y_settings user preference
     * and, since D62, the external speech-recognition-service disclosure
     * (Voice Commands, browser-dependent - see classes/privacy/provider.php).
     * @return void
     */
    public function test_get_metadata_declares_the_preference(): void {
        $collection = new collection('local_a11y');
        $result = provider::get_metadata($collection);

        $items = $result->get_collection();
        $this->assertCount(2, $items);

        $names = array_map(fn($item) => $item->get_name(), $items);
        $this->assertContains(\local_a11y\manager::PREFERENCE_NAME, $names);
        $this->assertContains('speechrecognitionservice', $names);
    }

    /**
     * No preference saved -> nothing exported.
     * @return void
     */
    public function test_export_user_preferences_without_data(): void {
        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);

        provider::export_user_preferences($user->id);

        $writer = writer::with_context(\context_system::instance());
        $this->assertFalse($writer->has_any_data());
    }

    /**
     * A saved preference must be exported as pretty-printed, sanitized JSON.
     * @return void
     */
    public function test_export_user_preferences_with_data(): void {
        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);

        $settings = \local_a11y\manager::get_default_settings();
        $settings['readableFont'] = true;
        $settings['textSize'] = 2;
        $settings['notARealOption'] = 'should be dropped on export';
        set_user_preference(\local_a11y\manager::PREFERENCE_NAME, json_encode($settings), $user);

        provider::export_user_preferences($user->id);

        $writer = writer::with_context(\context_system::instance());
        $this->assertTrue($writer->has_any_data());

        $preferences = (array) $writer->get_user_preferences('local_a11y');
        $this->assertArrayHasKey(\local_a11y\manager::PREFERENCE_NAME, $preferences);

        $exported = json_decode($preferences[\local_a11y\manager::PREFERENCE_NAME]->value, true);
        $this->assertTrue($exported['readableFont']);
        $this->assertSame(2, $exported['textSize']);
        $this->assertArrayNotHasKey('notARealOption', $exported);
    }
}
