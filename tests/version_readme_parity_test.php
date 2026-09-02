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
 * Guards version.php's $plugin->supported against drifting apart from the
 * Moodle version claims in README.md (badge and prose) - a real instance of
 * this already happened once (see DECISIONS.md D67/D74 and audit/05-sdlc.md):
 * $plugin->supported was corrected from [500, 502] to [502, 502] after CI
 * proved Moodle 5.0 was never actually installable, but README.md's badge
 * and two prose mentions of "Moodle 5.0+" were left untouched in the same
 * change, because nothing forced the two to be checked together.
 *
 * Deliberately reads version.php's own $plugin object via include(), the
 * same technique lang_parity_test.php uses for lang files - the point is to
 * compare exactly what the file itself declares, not a cached/derived value.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
#[\PHPUnit\Framework\Attributes\CoversNothing]
final class version_readme_parity_test extends \advanced_testcase {
    /**
     * Load version.php's own $plugin object by including it in an isolated
     * scope, the same way Moodle's own upgrade/install code does.
     *
     * @return \stdClass The file's own $plugin object.
     */
    private static function load_plugin_version_info(): \stdClass {
        $plugin = new \stdClass();
        include(\core_component::get_component_directory('local_a11y') . '/version.php');
        return $plugin;
    }

    /**
     * Convert a Moodle branch code (e.g. 502) to its human-facing version
     * string (e.g. "5.2"), per Moodle's own $plugin->supported convention
     * (major*100 + minor - confirmed against real codes: 401 = 4.1,
     * 405 = 4.5, 500 = 5.0, 502 = 5.2).
     *
     * @param int $code A Moodle branch code such as 502.
     * @return string The human-facing version string such as "5.2".
     */
    private static function branch_code_to_version_string(int $code): string {
        return intdiv($code, 100) . '.' . ($code % 100);
    }

    /**
     * README.md must mention the minimum Moodle version version.php actually
     * declares support for, and must not mention any Moodle version below
     * that minimum as if it were still supported - the second half is what
     * would have caught the real D67 desync (a stale "Moodle 5.0+" left
     * behind after $plugin->supported was narrowed to 5.2 only).
     *
     * @return void
     */
    public function test_readme_moodle_version_claims_match_plugin_supported(): void {
        $plugin = self::load_plugin_version_info();
        $this->assertNotEmpty(
            $plugin->supported ?? null,
            'version.php did not populate $plugin->supported.'
        );

        $minsupported = min($plugin->supported);
        $expected = self::branch_code_to_version_string($minsupported);

        $readmepath = \core_component::get_component_directory('local_a11y') . '/README.md';
        $readme = file_get_contents($readmepath);
        $this->assertNotFalse($readme, "Could not read {$readmepath}.");

        $this->assertStringContainsString(
            "Moodle {$expected}",
            $readme,
            "README.md does not mention \"Moodle {$expected}\", the minimum version in "
            . 'version.php\'s $plugin->supported = [' . implode(', ', $plugin->supported) . ']. '
            . 'If $plugin->supported changed, update README.md\'s badge and prose to match.'
        );

        preg_match_all('/Moodle[\s-](\d+\.\d+)\+?/', $readme, $matches);
        $mentioned = array_unique($matches[1]);
        foreach ($mentioned as $version) {
            [$major, $minor] = array_map('intval', explode('.', $version));
            $code = $major * 100 + $minor;
            $this->assertGreaterThanOrEqual(
                $minsupported,
                $code,
                "README.md mentions \"Moodle {$version}\", but version.php's \$plugin->supported "
                . "starts at {$expected} - this looks like a stale claim left over from before "
                . '$plugin->supported was last narrowed (exactly what happened in D67/D74 - see '
                . 'audit/05-sdlc.md).'
            );
        }
    }
}
