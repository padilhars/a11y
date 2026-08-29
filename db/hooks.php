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
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */

defined('MOODLE_INTERNAL') || die();

$callbacks = [
    [
        // Fires at the very top of core_renderer::header(), before $PAGE's
        // state moves past STATE_BEFORE_HEADER - the only hook this plugin
        // uses where moodle_page::add_body_class() is still legal to call.
        // See classes/hook_callbacks.php::before_http_headers()'s own
        // docblock for the coding_exception this replaced.
        'hook' => \core\hook\output\before_http_headers::class,
        'callback' => \local_a11y\hook_callbacks::class . '::before_http_headers',
        'priority' => 0,
    ],
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
