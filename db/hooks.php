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
 * Hook callback registrations for local_a11y.
 *
 * Uses the Hooks API (Moodle 4.4+) instead of the deprecated legacy
 * callbacks local_a11y_before_footer_html_generation() / before_standard_html_head().
 *
 * @package    local_a11y
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$callbacks = [
    [
        'hook' => \core\hook\output\before_standard_head_html_generation::class,
        'callback' => \local_a11y\hook_callbacks::class . '::before_standard_head_html_generation',
        'priority' => 0,
    ],
    [
        // Fires right after <body> opens, before any page content paints -
        // the only place a synchronous no-FOUC bootstrap script can run and
        // still have `document.body` available. See DECISIONS.md.
        'hook' => \core\hook\output\before_standard_top_of_body_html_generation::class,
        'callback' => \local_a11y\hook_callbacks::class . '::before_standard_top_of_body_html_generation',
        'priority' => 0,
    ],
    [
        'hook' => \core\hook\output\before_footer_html_generation::class,
        'callback' => \local_a11y\hook_callbacks::class . '::before_footer_html_generation',
        'priority' => 0,
    ],
];
