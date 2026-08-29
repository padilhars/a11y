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
 * Guards lang/en/local_a11y.php and lang/pt_br/local_a11y.php against
 * drifting apart, once AMOS becomes the system of record for translations
 * (see DECISIONS.md) - AMOS diffs against lang/en as the canonical source,
 * but nothing stops a future direct edit to either file from silently
 * introducing a key one side has and the other doesn't, and Moodle's own
 * get_string() fallback (English shown when a translation is missing) means
 * that class of bug is invisible in normal use, in either direction: a key
 * missing from pt_br just silently shows English; a key present only in
 * pt_br is simply never noticed as dead weight.
 *
 * Deliberately reads each lang file's raw $string array via include(),
 * bypassing get_string_manager()'s fallback/caching entirely - the point is
 * to compare exactly what each file itself declares, not what Moodle's
 * lookup chain resolves to.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
#[\PHPUnit\Framework\Attributes\CoversNothing]
final class lang_parity_test extends \advanced_testcase {
    /**
     * Load a lang file's own $string array by including it in an isolated
     * scope - the same shape get_string_manager() itself expects each lang
     * file to produce, without going through its fallback/caching layer.
     *
     * @param string $path Absolute path to a lang/<lang>/local_a11y.php file.
     * @return array<string, string> The file's own $string array, key => value.
     */
    private static function load_lang_strings(string $path): array {
        $string = [];
        include($path);
        return $string;
    }

    /**
     * lang/en/local_a11y.php and lang/pt_br/local_a11y.php must declare
     * exactly the same set of keys - a key on only one side either breaks
     * get_string() calls that expect it (missing from en) or is untranslated
     * dead weight AMOS will never have anything to do with (present only in
     * pt_br, with no English source string to translate from).
     *
     * @return void
     */
    public function test_en_and_ptbr_lang_files_have_the_same_key_set(): void {
        $dir = \core_component::get_component_directory('local_a11y');
        $en = self::load_lang_strings($dir . '/lang/en/local_a11y.php');
        $ptbr = self::load_lang_strings($dir . '/lang/pt_br/local_a11y.php');

        $this->assertNotEmpty($en, 'lang/en/local_a11y.php produced no $string entries - check the file path/include.');
        $this->assertNotEmpty($ptbr, 'lang/pt_br/local_a11y.php produced no $string entries - check the file path/include.');

        $onlyinen = array_values(array_diff(array_keys($en), array_keys($ptbr)));
        $onlyinptbr = array_values(array_diff(array_keys($ptbr), array_keys($en)));
        sort($onlyinen);
        sort($onlyinptbr);

        $this->assertSame(
            [],
            $onlyinen,
            "Keys present in lang/en/local_a11y.php but missing from lang/pt_br/local_a11y.php: "
            . implode(', ', $onlyinen)
        );
        $this->assertSame(
            [],
            $onlyinptbr,
            "Keys present in lang/pt_br/local_a11y.php but missing from lang/en/local_a11y.php: "
            . implode(', ', $onlyinptbr)
        );
    }
}
