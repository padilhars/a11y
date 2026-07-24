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

use local_a11y\manager;

/**
 * Renderer for local_a11y.
 *
 * @package    local_a11y
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class renderer extends \plugin_renderer_base {

    /**
     * HTML injected into <head>: the colour-blindness SVG filter defs and a
     * tiny inline no-FOUC bootstrap that reads the preference already
     * rendered server-side (data attribute on <html>) and applies the body
     * classes before first paint.
     *
     * The bulk of the state logic (reading storage, applying classes) lives
     * in amd/src/effects.js; this only needs to run synchronously before
     * paint, so it stays a small inline <script>, not an AMD module (AMD
     * modules load async after the page has already rendered).
     *
     * @return string
     */
    public function render_head_html(): string {
        global $PAGE;

        $svgfilters = $this->render_colourblind_filters();

        // NO-FOUC bootstrap: apply the body.a11y-* classes synchronously,
        // before first paint, using whatever preference value the PHP
        // request already resolved (M3 wires the actual value in via
        // manager::get_current_user_settings(); until then this is a no-op
        // safe default so M2 has no behaviour to verify yet).
        $bootstrap = '';

        return $svgfilters . $bootstrap;
    }

    /**
     * HTML injected before </body>: the FAB + panel markup. The AMD
     * bootstrap call itself is done by hook_callbacks via
     * $PAGE->requires->js_call_amd(), not here, so it participates in
     * Moodle's normal JS loading/caching instead of an inline <script>.
     *
     * @return string
     */
    public function render_footer_html(): string {
        $fab = new fab();
        $panel = new panel();

        return $this->render($fab) . $this->render($panel);
    }

    /**
     * SVG <filter> definitions used by the colour-adjustment (colour-blindness
     * simulation) stepper, referenced from styles.css via url(#local-a11y-*).
     * Kept as real SVG filters (not just CSS sepia/hue-rotate approximations)
     * for a more accurate simulation; see DECISIONS.md D6.
     *
     * @return string
     */
    private function render_colourblind_filters(): string {
        // Colour-blindness simulation matrices (Machado, Oliveira & Fluck 2009).
        $matrices = [
            'protanopia' => '0.152,1.053,-0.205,0,0  0.115,0.786,0.099,0,0  -0.004,-0.048,1.052,0,0  0,0,0,1,0',
            'deuteranopia' => '0.367,0.861,-0.228,0,0  0.280,0.673,0.047,0,0  -0.012,0.043,0.969,0,0  0,0,0,1,0',
            'tritanopia' => '1.256,-0.077,-0.179,0,0  -0.078,0.931,0.148,0,0  0.005,0.691,0.304,0,0  0,0,0,1,0',
        ];
        $svg = '<svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden;" xmlns="http://www.w3.org/2000/svg">';
        foreach ($matrices as $name => $matrix) {
            $svg .= '<filter id="local-a11y-' . $name . '" color-interpolation-filters="sRGB">'
                . '<feColorMatrix type="matrix" values="' . $matrix . '"/></filter>';
        }
        $svg .= '</svg>';
        return $svg;
    }
}
