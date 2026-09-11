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
 * Tests for db/upgrade.php's data-migration step (the 2026082800 step,
 * D52: focusMode's legacy boolean value gets normalised to the integer
 * every other stepper key has always used). Added to resolve AUDIT-V2
 * finding TEST-001: this migration - unlike the schema-only 2026082700
 * step, already covered structurally by moodle-plugin-ci's `savepoints`
 * check - transforms live user data and had no test of its own.
 *
 * xmldb_local_a11y_upgrade() isn't autoloaded (it's a plain function, not
 * a namespaced class), so db/upgrade.php is required explicitly here -
 * the same file the real upgrade process includes.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      1.0.0
 */
#[\PHPUnit\Framework\Attributes\CoversFunction('xmldb_local_a11y_upgrade')]
final class upgrade_test extends \advanced_testcase {
    /**
     * PHPUnit fixture setup: resets the Moodle test environment after each
     * test and ensures xmldb_local_a11y_upgrade() is loaded.
     *
     * @return void
     */
    public function setUp(): void {
        parent::setUp();
        $this->resetAfterTest();

        global $CFG;
        // Function upgrade_plugin_savepoint() (called by
        // xmldb_local_a11y_upgrade() itself) lives in upgradelib.php, only
        // loaded during a real upgrade request - not part of PHPUnit's own
        // bootstrap.
        require_once($CFG->libdir . '/upgradelib.php');
        require_once($CFG->dirroot . '/local/a11y/db/upgrade.php');
    }

    /**
     * A legacy `focusMode: true`/`focusMode: false` value in a stored
     * preference must become the integer 1/0 after the 2026082800 step
     * runs, with every other key in the same JSON blob left untouched.
     * @return void
     */
    public function test_upgrade_normalises_legacy_boolean_focusmode(): void {
        global $DB;

        $user = $this->getDataGenerator()->create_user();
        $onsettings = manager::get_default_settings();
        $onsettings['focusMode'] = true;
        $onsettings['readableFont'] = true;
        set_user_preference(manager::PREFERENCE_NAME, json_encode($onsettings), $user);

        $offuser = $this->getDataGenerator()->create_user();
        $offsettings = manager::get_default_settings();
        $offsettings['focusMode'] = false;
        set_user_preference(manager::PREFERENCE_NAME, json_encode($offsettings), $offuser);

        // Function upgrade_plugin_savepoint() refuses to set a savepoint older than
        // the plugin's currently-recorded version (a real "downgrade"
        // guard) - this test environment already has the real, current
        // version.php installed, so the plugin's own recorded version has
        // to be wound back first to simulate actually being mid-upgrade.
        set_config('version', 2026082700, 'local_a11y');

        $result = xmldb_local_a11y_upgrade(2026082700);
        $this->assertTrue($result);

        $onvalue = json_decode($DB->get_field('user_preferences', 'value', [
            'userid' => $user->id, 'name' => manager::PREFERENCE_NAME,
        ]), true);
        $this->assertSame(1, $onvalue['focusMode']);
        $this->assertTrue($onvalue['readableFont'], 'Unrelated keys in the same blob must be left untouched.');

        $offvalue = json_decode($DB->get_field('user_preferences', 'value', [
            'userid' => $offuser->id, 'name' => manager::PREFERENCE_NAME,
        ]), true);
        $this->assertSame(0, $offvalue['focusMode']);
    }

    /**
     * A preference already storing focusMode as an integer (already
     * migrated, or a fresh install that never had the legacy boolean
     * format) must be left byte-for-byte unchanged.
     * @return void
     */
    public function test_upgrade_leaves_already_integer_focusmode_untouched(): void {
        global $DB;

        $user = $this->getDataGenerator()->create_user();
        $settings = manager::get_default_settings();
        $settings['focusMode'] = 2;
        $raw = json_encode($settings);
        set_user_preference(manager::PREFERENCE_NAME, $raw, $user);

        set_config('version', 2026082700, 'local_a11y');
        xmldb_local_a11y_upgrade(2026082700);

        $stored = $DB->get_field('user_preferences', 'value', [
            'userid' => $user->id, 'name' => manager::PREFERENCE_NAME,
        ]);
        $this->assertSame($raw, $stored);
    }

    /**
     * A preference blob with no focusMode key at all (e.g. a very old or
     * hand-crafted value) must not gain one, and must not break the loop
     * for other users' rows.
     * @return void
     */
    public function test_upgrade_skips_preference_without_focusmode_key(): void {
        global $DB;

        $user = $this->getDataGenerator()->create_user();
        $settings = manager::get_default_settings();
        unset($settings['focusMode']);
        $raw = json_encode($settings);
        set_user_preference(manager::PREFERENCE_NAME, $raw, $user);

        set_config('version', 2026082700, 'local_a11y');
        $result = xmldb_local_a11y_upgrade(2026082700);

        $this->assertTrue($result);
        $stored = $DB->get_field('user_preferences', 'value', [
            'userid' => $user->id, 'name' => manager::PREFERENCE_NAME,
        ]);
        $this->assertSame($raw, $stored);
    }

    /**
     * Calling the upgrade function again from a version at/after
     * 2026082800 (i.e. the step has already run) must be a no-op - the
     * $oldversion guard, not re-running the migration, is what makes this
     * safe to be idempotent.
     * @return void
     */
    public function test_upgrade_step_is_skipped_when_oldversion_is_current(): void {
        global $DB;

        $user = $this->getDataGenerator()->create_user();
        $settings = manager::get_default_settings();
        $settings['focusMode'] = true;
        $raw = json_encode($settings);
        set_user_preference(manager::PREFERENCE_NAME, $raw, $user);

        // 2026082800 is still below the later 2026091200 (fontVariant) step,
        // so that step's own branch also runs here - harmless (this
        // preference has no 'dyslexicFont' key to migrate) but still needs
        // the same savepoint-downgrade guard as the other tests above.
        set_config('version', 2026082800, 'local_a11y');
        xmldb_local_a11y_upgrade(2026082800);

        $stored = $DB->get_field('user_preferences', 'value', [
            'userid' => $user->id, 'name' => manager::PREFERENCE_NAME,
        ]);
        $this->assertSame($raw, $stored, 'The 2026082800 step must not re-run once $oldversion is already at/after it.');
    }

    /**
     * AUDIT-V2 LGPD-002: a stored preference with the legacy 'dyslexicFont'
     * key must be renamed to 'fontVariant', preserving its value and every
     * other key in the same JSON blob, after the 2026091200 step runs.
     * @return void
     */
    public function test_upgrade_renames_dyslexicfont_key_to_fontvariant(): void {
        global $DB;

        $user = $this->getDataGenerator()->create_user();
        $settings = manager::get_default_settings();
        unset($settings['fontVariant']);
        $settings['dyslexicFont'] = 2;
        $settings['readableFont'] = true;
        set_user_preference(manager::PREFERENCE_NAME, json_encode($settings), $user);

        set_config('version', 2026091100, 'local_a11y');
        $result = xmldb_local_a11y_upgrade(2026091100);
        $this->assertTrue($result);

        $stored = json_decode($DB->get_field('user_preferences', 'value', [
            'userid' => $user->id, 'name' => manager::PREFERENCE_NAME,
        ]), true);
        $this->assertArrayNotHasKey('dyslexicFont', $stored);
        $this->assertSame(2, $stored['fontVariant']);
        $this->assertTrue($stored['readableFont'], 'Unrelated keys in the same blob must be left untouched.');
    }

    /**
     * A preference blob without a legacy 'dyslexicFont' key (a fresh
     * install, or one already migrated) must be left byte-for-byte
     * unchanged by the 2026091200 step.
     * @return void
     */
    public function test_upgrade_skips_preference_without_dyslexicfont_key(): void {
        global $DB;

        $user = $this->getDataGenerator()->create_user();
        $raw = json_encode(manager::get_default_settings());
        set_user_preference(manager::PREFERENCE_NAME, $raw, $user);

        set_config('version', 2026091100, 'local_a11y');
        xmldb_local_a11y_upgrade(2026091100);

        $stored = $DB->get_field('user_preferences', 'value', [
            'userid' => $user->id, 'name' => manager::PREFERENCE_NAME,
        ]);
        $this->assertSame($raw, $stored);
    }

    /**
     * The {local_a11y_stats} aggregate counter row for 'dyslexicFont' (if
     * any) must be renamed to 'fontVariant' in place, preserving its
     * counter - this is site-wide aggregate data (D47), not personal data,
     * but usage-stat continuity still matters.
     * @return void
     */
    public function test_upgrade_renames_stats_featureid(): void {
        global $DB;

        $DB->insert_record(\local_a11y\stats::TABLE, (object) [
            'featureid' => 'dyslexicFont',
            'counter' => 7,
            'timemodified' => time(),
        ]);

        set_config('version', 2026091100, 'local_a11y');
        xmldb_local_a11y_upgrade(2026091100);

        $this->assertFalse($DB->record_exists(\local_a11y\stats::TABLE, ['featureid' => 'dyslexicFont']));
        $renamed = $DB->get_record(\local_a11y\stats::TABLE, ['featureid' => 'fontVariant']);
        $this->assertNotFalse($renamed);
        $this->assertSame('7', (string) $renamed->counter);
    }

    /**
     * A site that ever saved `local_a11y/enabledfeatures` (admin config,
     * a comma-separated string of option ids) has 'dyslexicFont' baked
     * into that string verbatim. Found live, after first shipping this
     * migration without this step: the option silently disappeared from
     * the panel entirely post-rename, because
     * \local_a11y\config::enabled_features() matches ids by exact string,
     * and 'fontVariant' is a different string. Must be renamed in place,
     * with every other id in the list left untouched and in order.
     * @return void
     */
    public function test_upgrade_renames_id_in_enabledfeatures_config(): void {
        set_config('enabledfeatures', 'readableFont,dyslexicFont,highlightTitles', 'local_a11y');

        set_config('version', 2026091100, 'local_a11y');
        xmldb_local_a11y_upgrade(2026091100);

        $this->assertSame(
            'readableFont,fontVariant,highlightTitles',
            get_config('local_a11y', 'enabledfeatures')
        );
    }

    /**
     * A site whose `enabledfeatures` never mentioned 'dyslexicFont' (e.g.
     * the default, unset - or already migrated) must be left untouched.
     * @return void
     */
    public function test_upgrade_leaves_enabledfeatures_untouched_without_legacy_id(): void {
        set_config('enabledfeatures', 'readableFont,fontVariant,highlightTitles', 'local_a11y');

        set_config('version', 2026091100, 'local_a11y');
        xmldb_local_a11y_upgrade(2026091100);

        $this->assertSame(
            'readableFont,fontVariant,highlightTitles',
            get_config('local_a11y', 'enabledfeatures')
        );
    }
}
