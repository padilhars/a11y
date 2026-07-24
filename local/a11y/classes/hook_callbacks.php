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
 * Hook callbacks for local_a11y.
 *
 * @package    local_a11y
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class hook_callbacks {

    /**
     * Injects the plugin's CSS, web fonts, colour-blindness SVG filters and
     * the inline no-FOUC bootstrap snippet into the page <head>.
     *
     * @param \core\hook\output\before_standard_head_html_generation $hook
     */
    public static function before_standard_head_html_generation(
        \core\hook\output\before_standard_head_html_generation $hook
    ): void {
        if (!manager::is_active_on_current_page()) {
            return;
        }
        global $PAGE;
        $renderer = $PAGE->get_renderer('local_a11y');
        $hook->add_html($renderer->render_head_html());
    }

    /**
     * Injects the FAB + panel HTML and the AMD bootstrap call into the footer.
     *
     * @param \core\hook\output\before_footer_html_generation $hook
     */
    public static function before_footer_html_generation(
        \core\hook\output\before_footer_html_generation $hook
    ): void {
        if (!manager::is_active_on_current_page()) {
            return;
        }
        global $PAGE;
        $renderer = $PAGE->get_renderer('local_a11y');
        $hook->add_html($renderer->render_footer_html());
    }
}
