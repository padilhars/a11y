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

/**
 * Plugin version information for local_a11y.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */

defined('MOODLE_INTERNAL') || die();

$plugin->component = 'local_a11y';
$plugin->version   = 2026100301;
// AUDIT-V2 finding CODE-001: this value can look contradictory next to
// $supported below (a reviewer might reasonably ask "why declare a 5.0
// build here if only 502 is supported?"), so the full story is worth
// spelling out once, here, rather than only in DECISIONS.md D66:
//
// This is the nominal branching version for Moodle 5.0 on the upstream
// release timeline - NOT a value confirmed against a real 5.0 core build.
// $supported below was originally [500, 502] on that (untested)
// assumption, until a real CI run against the actual MOODLE_500_STABLE
// branch disproved it: 5.0's real core version tops out at 2025041409,
// lower than this $requires (2025041500) - so the plugin actually refuses
// to install on real Moodle 5.0 ("pluginrequirementsnotmet"), despite this
// value nominally targeting it. $supported was narrowed to the one branch
// with real, live-tested evidence (502) instead.
//
// $requires itself was deliberately left as-is rather than lowered to
// match: this project's own discipline (see DECISIONS.md D66-D71) is to
// never change a version/compatibility value by assumption or analogy,
// only against real CI evidence - and no CI run has yet established what
// this plugin's actual minimum required 502 build is (only that the
// current value is safely low enough to not block installation on it).
// Lowering this number without that evidence would risk the opposite
// failure mode from the one that caused this whole finding: an incorrect
// value that's silently wrong instead of one that just reads oddly.
$plugin->requires  = 2025041500;
$plugin->supported = [502, 502];
$plugin->maturity  = MATURITY_STABLE;
$plugin->release   = '1.0.0';
