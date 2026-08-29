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
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */

defined('MOODLE_INTERNAL') || die();

$plugin->component = 'local_a11y';
$plugin->version   = 2026082903;
// Approximate branching version for the Moodle 5.0 release on this timeline
// (this install is already on branch 502 / 2026042001.07 — see DECISIONS.md D2).
// Any value at or below the site's current $version satisfies "5.0+" support.
$plugin->requires  = 2025041500;
// Declared branch range for the Moodle Plugins Directory. LOWER bound (500)
// mirrors $requires above - nothing in this plugin uses any API introduced
// after Moodle 5.0, so there's no known reason 5.0/5.1 wouldn't work, but
// this has only ever actually been *run* against 5.2 (this development/
// production host has never had anything but 5.2.1 installed - see
// DECISIONS.md D2). UPPER bound (502) is the one branch this has real,
// live-tested evidence for. Widen the upper bound only after actually
// testing against a newer branch, not just because a newer one exists.
$plugin->supported = [500, 502];
$plugin->maturity  = MATURITY_STABLE;
$plugin->release   = '0.1.0';
