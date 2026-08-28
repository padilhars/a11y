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

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * External function: records one aggregate activation of an accessibility
 * option (D47). Called from amd/src/stats.js whenever an option
 * transitions from inactive to default-changed in amd/src/main.js.
 *
 * Security: `require_sesskey()` (never trust a bare URL/GET parameter to
 * mutate state - this plugin's own convention, see CLAUDE.md), a system
 * context validated via the standard external_api flow (which itself
 * calls require_login()), and `local/a11y:view` - the same capability
 * that gates using the panel at all, so anyone who could have triggered
 * this activation client-side is also allowed to report it. Whether
 * anything actually gets written is decided server-side only
 * (classes/stats.php::record_activation() re-checks
 * config::collect_stats_enabled() itself) - this function's featureid
 * argument can never do anything but increment a known option's own
 * counter by exactly 1, regardless of what a tampered client sends.
 *
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */
class record_activation extends external_api {
    /**
     * Webservice parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'featureid' => new external_value(PARAM_ALPHANUMEXT, 'Accessibility option id being activated, e.g. readableFont'),
        ]);
    }

    /**
     * Record one activation of $featureid, if usage-stat collection is on
     * and $featureid is a real, known option id (silently ignoring
     * anything else - an unknown id is either a stale client or a
     * malformed request, neither worth an error for a best-effort stat).
     *
     * @param string $featureid The option id being activated.
     * @return array{recorded: bool}
     */
    public static function execute(string $featureid): array {
        ['featureid' => $featureid] = self::validate_parameters(self::execute_parameters(), [
            'featureid' => $featureid,
        ]);

        $context = \context_system::instance();
        self::validate_context($context);
        require_capability('local/a11y:view', $context);
        require_sesskey();

        $knownids = array_column(\local_a11y\options::all(), 'id');
        if (!in_array($featureid, $knownids, true)) {
            return ['recorded' => false];
        }

        $recorded = \local_a11y\stats::record_activation($featureid);
        return ['recorded' => $recorded];
    }

    /**
     * Webservice return value.
     *
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'recorded' => new external_value(
                PARAM_BOOL,
                'Whether the activation was actually recorded (false if usage-stat collection is disabled or the id is unknown)'
            ),
        ]);
    }
}
