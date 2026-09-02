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
$plugin->version   = 2026090201;
// Approximate branching version for the Moodle 5.0 release on this timeline
// (this install is already on branch 502 / 2026042001.07 — see DECISIONS.md D2).
// Any value at or below the site's current $version satisfies "5.0+" support.
$plugin->requires  = 2025041500;
// Declared branch range for the Moodle Plugins Directory. Previously [500, 502]
// on the (untested) assumption that $requires above corresponded to a real
// Moodle 5.0 core build. Disproved: CI (moodle-plugin-ci against the real
// MOODLE_500_STABLE branch) shows 5.0's actual core version tops out at
// 2025041409 - lower than $requires (2025041500) - so the plugin refuses to
// even install on real Moodle 5.0 ("pluginrequirementsnotmet"). Narrowed to
// the one branch with real, live-tested evidence (502 - this development/
// production host has only ever run 5.2.1, see DECISIONS.md D2) until 5.0
// support is either fixed (lowering $requires, if nothing here actually
// needs a 5.2-only API) or dropped for good. See DECISIONS.md D66.
$plugin->supported = [502, 502];
$plugin->maturity  = MATURITY_STABLE;
$plugin->release   = '1.0.0';
