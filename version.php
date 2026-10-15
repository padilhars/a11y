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
$plugin->version   = 2026101500;
// D92: $plugin->requires lowered from 2025041500 to 2025041409 - the real
// build number the MOODLE_500_STABLE branch actually reaches (confirmed
// live by the CI run in D67). $plugin->supported below was widened back
// to include 500 only after a real CI run (GitHub Actions run 38561624902,
// 14/10/2026) confirmed - install + phplint/phpcpd/phpmd/codechecker/
// validate/savepoints/mustache/grunt/phpunit/behat, all 4 combinations
// (PHP 8.3/8.4 x Postgres/MariaDB) - that the plugin actually installs and
// passes against MOODLE_500_STABLE with this requires value. Not an
// assumption or analogy this time: this project's own discipline
// (DECISIONS.md D66-D71, reaffirmed in D92) is to never change a
// compatibility value without exactly this kind of real evidence.
$plugin->requires  = 2025041409;
$plugin->supported = [500, 502];
$plugin->maturity  = MATURITY_STABLE;
$plugin->release   = '1.1.0';
