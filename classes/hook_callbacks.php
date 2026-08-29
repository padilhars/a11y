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
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
class hook_callbacks {
    /**
     * Adds the admin-controlled VLibras-integration body class, if active.
     *
     * D54 originally did this from before_standard_head_html_generation()
     * below, on the theory that anything hooked into <head> generation
     * runs early enough - wrong, confirmed the hard way (a real
     * coding_exception in production, not just reasoning about it):
     * `moodle_page::add_body_class()` throws once `$PAGE`'s state has
     * moved past STATE_BEFORE_HEADER, and *every* before_standard_*_html_
     * generation hook fires from deep inside core_renderer::header()'s own
     * *template rendering* (drawers.php et al, via standard_head_html()) -
     * by which point header() has already called
     * set_state(STATE_PRINTING_HEADER). before_http_headers is dispatched
     * at the very top of header(), before that state transition - Moodle
     * core's own header() calls add_body_class() (for 'userloggedinas'
     * etc.) right after dispatching this exact hook, in this exact
     * function, which is what actually confirmed this is the correct place
     * rather than another guess.
     *
     * @param \core\hook\output\before_http_headers $hook
     * @return void
     */
    public static function before_http_headers(\core\hook\output\before_http_headers $hook): void {
        if (!manager::is_active_on_current_page()) {
            return;
        }
        global $PAGE;

        // Admin-controlled (not per-user, unlike everything else this
        // plugin toggles), so it's added directly server-side rather than
        // through the no-FOUC bootstrap - there is no FOUC risk to guard
        // against here, the value is the same for every request regardless
        // of who's logged in. styles.css uses it, combined with the user's
        // own 'a11y-sign-language' class (added the normal way, through
        // Effects.apply()), to decide whether VLibras' own floating button
        // is hidden or revealed - see classes/integration/vlibras.php.
        if (\local_a11y\integration\vlibras::is_integrated()) {
            $PAGE->add_body_class('a11y-vlibras-integrated');
        }
    }

    /**
     * Injects the plugin's CSS, web fonts, colour-blindness SVG filters and
     * the inline no-FOUC bootstrap snippet into the page <head>.
     *
     * @param \core\hook\output\before_standard_head_html_generation $hook The core hook instance to add HTML to.
     * @return void
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
     * Injects the synchronous no-FOUC bootstrap script right after <body> opens.
     *
     * @param \core\hook\output\before_standard_top_of_body_html_generation $hook The core hook instance to add HTML to.
     * @return void
     */
    public static function before_standard_top_of_body_html_generation(
        \core\hook\output\before_standard_top_of_body_html_generation $hook
    ): void {
        if (!manager::is_active_on_current_page()) {
            return;
        }
        global $PAGE;
        $renderer = $PAGE->get_renderer('local_a11y');
        $hook->add_html($renderer->render_nofouc_script());
    }

    /**
     * Injects the FAB + panel HTML and the AMD bootstrap call into the footer.
     *
     * @param \core\hook\output\before_footer_html_generation $hook The core hook instance to add HTML to.
     * @return void
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
        $PAGE->requires->js_call_amd('local_a11y/main', 'init', [
            isloggedin() && !isguestuser(),
            config::collect_stats_enabled(),
        ]);
    }
}
