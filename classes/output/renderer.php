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

use local_a11y\config;
use local_a11y\manager;

/**
 * Renderer for local_a11y.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
class renderer extends \plugin_renderer_base {
    /**
     * HTML injected into <head>: just the colour-blindness SVG filter defs.
     * The no-FOUC bootstrap itself has to run from the *top of body* (see
     * render_nofouc_script()) because `document.body` does not exist yet
     * while <head> is being parsed.
     *
     * @return string Safe HTML, ready for raw (unescaped) output into <head>.
     */
    public function render_head_html(): string {
        return $this->render_colourblind_filters() . $this->render_effect_color_vars();
    }

    /**
     * Synchronous inline bootstrap script: reads the settings already known
     * server-side (logged-in users, embedded as JSON) or falls back to
     * reading localStorage (guests), computes the same `a11y-*` body classes
     * amd/src/effects.js would, and applies them immediately - before any
     * page content below this point paints - eliminating FOUC.
     *
     * This duplicates a small slice of the class-name logic in
     * amd/src/effects.js by necessity: this has to run synchronously before
     * the AMD loader is even available, so it cannot import that module.
     * Keep the two in sync when either one changes.
     *
     * @return string A <script>...</script> tag, ready for raw (unescaped) output.
     */
    public function render_nofouc_script(): string {
        $settings = manager::get_current_user_settings();
        $isloggedin = isloggedin() && !isguestuser();

        // Only trust the server-rendered value when we actually know it
        // (logged-in user); otherwise emit null so the script reads
        // localStorage itself, matching amd/src/storage.js's own fallback.
        //
        // Security audit finding (defence in depth, not exploitable today):
        // every value below is guaranteed bool/int (manager::sanitize_settings())
        // or a hardcoded PHP string/array, never user-supplied free text, so
        // none of them can contain `</script>` as things stand. That safety
        // depends entirely on that invariant holding forever, though - the
        // JSON_HEX_* flags make it true unconditionally instead, at zero cost,
        // so a future settings key that happens to hold a string can never
        // break out of this inline <script> even if sanitize_settings() isn't
        // updated to match.
        $jsonflags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT;
        $serversettings = $isloggedin ? json_encode($settings, $jsonflags) : 'null';
        $preferencename = json_encode(manager::PREFERENCE_NAME, $jsonflags);
        $boolmap = json_encode(manager::get_boolean_class_map(), $jsonflags);
        $steppermap = json_encode(manager::get_stepper_class_prefix_map(), $jsonflags);

        $js = <<<JS
(function() {
    try {
        var settings = {$serversettings};
        if (!settings) {
            var raw = window.localStorage ? window.localStorage.getItem({$preferencename}) : null;
            settings = raw ? JSON.parse(raw) : null;
        }
        if (!settings) {
            return;
        }
        var boolMap = {$boolmap};
        var stepperMap = {$steppermap};
        var classes = [];
        Object.keys(boolMap).forEach(function(key) {
            if (settings[key]) {
                classes.push(boolMap[key]);
            }
        });
        Object.keys(stepperMap).forEach(function(key) {
            // A guest's localStorage can still hold a pre-D52 legacy
            // boolean for a key that has since become a stepper (focusMode:
            // true/false) - this path never goes through sanitize_settings()
            // server-side (guests have no server record), so it has to
            // guard for itself. parseInt(true, 10) stringifies to "true"
            // first and returns NaN -> the `|| 0` fallback would silently
            // turn a legacy "on" into level 0 (off) instead of preserving
            // it - coerce true/false to 1/0 before parseInt ever runs.
            var raw = settings[key];
            if (typeof raw === 'boolean') {
                raw = raw ? 1 : 0;
            }
            var value = parseInt(raw, 10) || 0;
            if (value > 0) {
                classes.push(stepperMap[key] + value);
            }
        });
        if (classes.length) {
            document.body.className += ' ' + classes.join(' ');
        }
    } catch (e) {
        // Never let a storage/JSON error break the page.
    }
})();
JS;

        return '<script>' . $js . '</script>';
    }

    /**
     * HTML injected before </body>: the FAB + panel markup. The AMD
     * bootstrap call itself is done by hook_callbacks via
     * $PAGE->requires->js_call_amd(), not here, so it participates in
     * Moodle's normal JS loading/caching instead of an inline <script>.
     *
     * @return string Concatenated safe HTML for the FAB and panel, ready for raw output.
     */
    public function render_footer_html(): string {
        $fab = new fab();
        $panel = new panel();

        return $this->render($fab) . $this->render($panel);
    }

    /**
     * HTML injected into <head>: a tiny inline <style> defining the 4
     * admin-configurable page-effect colours (config::get_effect_colors())
     * as CSS custom properties on :root - --a11y-highlight-titles-color,
     * --a11y-highlight-links-color, --a11y-highlight-buttons-color
     * (Destacar Títulos/Links/Botões, independently configurable) and
     * --a11y-guide-color (Guia de Leitura) - consumed by the matching
     * rules in styles.css. Custom-property inheritance resolves from
     * wherever they're declared down through the whole DOM regardless of
     * stylesheet load order, so an early <head> declaration reaches rules
     * in the (separately loaded, compiled-in) plugin stylesheet just fine.
     *
     * admin_setting_configcolourpicker already validates hex on save, but
     * re-validated here too before it goes into raw HTML - defence in
     * depth against a malformed value somehow ending up in config either
     * way (matches this plugin's general stance on trusting stored config,
     * e.g. footer_text()'s own format_text() pass).
     *
     * @return string A <style>...</style> tag, ready for raw (unescaped) output.
     */
    private function render_effect_color_vars(): string {
        $colors = config::get_effect_colors();
        $hex = '/^#[0-9a-fA-F]{3,8}$/';
        $valid = function (string $color, string $default) use ($hex): string {
            return preg_match($hex, $color) ? $color : $default;
        };
        $titles = $valid($colors['highlighttitles'], '#eab308');
        $links = $valid($colors['highlightlinks'], '#3b82f6');
        $buttons = $valid($colors['highlightbuttons'], '#f97316');
        $readingguide = $valid($colors['readingguide'], '#3b82f6');
        return '<style>:root{'
            . '--a11y-highlight-titles-color:' . $titles . ';'
            . '--a11y-highlight-links-color:' . $links . ';'
            . '--a11y-highlight-buttons-color:' . $buttons . ';'
            . '--a11y-guide-color:' . $readingguide . ';'
            . '}</style>';
    }

    /**
     * SVG <filter> definitions used by the colour-adjustment (colour-blindness
     * simulation) stepper, referenced from styles.css via url(#local-a11y-*).
     * Kept as real SVG filters (not just CSS sepia/hue-rotate approximations)
     * for a more accurate simulation; see DECISIONS.md D6.
     *
     * @return string An inline (visually hidden) <svg> containing the 3 <filter> defs.
     */
    private function render_colourblind_filters(): string {
        // Colour-blindness simulation matrices (Machado, Oliveira & Fluck 2009).
        $matrices = [
            'protanopia' => '0.152,1.053,-0.205,0,0  0.115,0.786,0.099,0,0  -0.004,-0.048,1.052,0,0  0,0,0,1,0',
            'deuteranopia' => '0.367,0.861,-0.228,0,0  0.280,0.673,0.047,0,0  -0.012,0.043,0.969,0,0  0,0,0,1,0',
            'tritanopia' => '1.256,-0.077,-0.179,0,0  -0.078,0.931,0.148,0,0  0.005,0.691,0.304,0,0  0,0,0,1,0',
        ];
        $svg = '<svg aria-hidden="true" focusable="false" '
            . 'style="position:absolute;width:0;height:0;overflow:hidden;" '
            . 'xmlns="http://www.w3.org/2000/svg">';
        foreach ($matrices as $name => $matrix) {
            $svg .= '<filter id="local-a11y-' . $name . '" color-interpolation-filters="sRGB">'
                . '<feColorMatrix type="matrix" values="' . $matrix . '"/></filter>';
        }
        $svg .= '</svg>';
        return $svg;
    }
}
