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

namespace local_a11y\output;

/**
 * Renderer for local_a11y.
 *
 * M1: stub methods (return empty strings) so the hook callbacks are safe to
 * fire before the FAB/panel templates exist. Populated in M2.
 *
 * @package    local_a11y
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class renderer extends \plugin_renderer_base {

    /**
     * HTML to inject into <head>: CSS link, fonts preload, no-FOUC snippet.
     *
     * @return string
     */
    public function render_head_html(): string {
        return '';
    }

    /**
     * HTML to inject before </body>: FAB + panel markup, AMD bootstrap.
     *
     * @return string
     */
    public function render_footer_html(): string {
        return '';
    }
}
