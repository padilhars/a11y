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
$plugin->version   = 2026101401;
// D92 (trial, pending real CI evidence): lowered from 2025041500 to
// 2025041409 - the real build number MOODLE_500_STABLE actually reaches
// (confirmed live by the CI run in D67, the same run that originally
// disproved 500 support). Nothing in this plugin is known to use any API
// introduced after that build; this value was simply left too high the
// first time, never actually derived from a real requirement. This is a
// trial value, not yet confirmed - DECISIONS.md D66-D71's own discipline
// (never change a compatibility value by assumption, only by real CI
// evidence) applies here too: $supported below is NOT widened back to
// include 500 until a real CI run (install + phpunit + behat, this exact
// commit, MOODLE_500_STABLE re-added to the matrix) proves the plugin
// actually installs and passes against it. See DECISIONS.md D92.
$plugin->requires  = 2025041409;
$plugin->supported = [502, 502];
$plugin->maturity  = MATURITY_STABLE;
$plugin->release   = '1.0.0';
