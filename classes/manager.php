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
 * Central place for defaults, activation checks, merge/validate/sanitize
 * logic for local_a11y settings.
 *
 * @package    local_a11y
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class manager {

    /** @var string User preference name storing the JSON-encoded settings blob. */
    const PREFERENCE_NAME = 'local_a11y_settings';

    /**
     * Default value (all options off / level 0). Mirrors DEFAULT_SETTINGS in
     * _design-reference/a11y-data.jsx (same keys, same order), plus
     * 'textAlign' - one addition beyond the prototype (see DECISIONS.md D30).
     *
     * @return array<string, bool|int>
     */
    public static function get_default_settings(): array {
        return [
            'readableFont' => false,
            'dyslexicFont' => false,
            'highlightTitles' => false,
            'highlightLinks' => false,
            'highlightButtons' => false,
            'hideImages' => false,
            'tooltips' => false,
            'pauseAnimations' => false,
            'textSize' => 0,
            'lineHeight' => 0,
            'textSpacing' => 0,
            'textAlign' => 0,
            'contrast' => 0,
            'invertColors' => false,
            'colorChange' => 0,
            'saturation' => 0,
            'readingGuide' => false,
            'readingMask' => false,
            'cursor' => 0,
            'focusMode' => false,
            'screenReader' => false,
            'virtualKeyboard' => false,
            'voiceCommands' => false,
            'faceNavigation' => false,
        ];
    }

    /**
     * Maximum stepper value per key (0 for toggles, boolean keys are absent here).
     *
     * @return array<string, int>
     */
    public static function get_stepper_max(): array {
        return [
            'textSize' => 4,
            'lineHeight' => 3,
            'textSpacing' => 3,
            'textAlign' => 4,
            'contrast' => 3,
            'colorChange' => 3,
            'saturation' => 3,
            'cursor' => 2,
        ];
    }

    /**
     * Boolean settings key -> body CSS class name, a verbatim port of the
     * `if (settings.x) body.classList.add('a11y-y')` lines in
     * _design-reference/app.jsx. Note this intentionally excludes
     * readingGuide, readingMask, screenReader, virtualKeyboard,
     * voiceCommands and (since D29 - the prototype itself does still map
     * it to a body class, but a real browser's native title tooltip can
     * only be suppressed from JS, not CSS) tooltips: those 6 booleans do
     * NOT drive a body class here, they gate always-mounted JS overlay
     * components instead (see amd/src/reading_guide.js etc., M5; D29).
     *
     * @return array<string, string>
     */
    public static function get_boolean_class_map(): array {
        return [
            'readableFont' => 'a11y-readable-font',
            'dyslexicFont' => 'a11y-dyslexic-font',
            'highlightTitles' => 'a11y-highlight-titles',
            'highlightLinks' => 'a11y-highlight-links',
            'highlightButtons' => 'a11y-highlight-buttons',
            'hideImages' => 'a11y-hide-images',
            'pauseAnimations' => 'a11y-pause-animations',
            'invertColors' => 'a11y-invert',
            'focusMode' => 'a11y-focus-mode',
        ];
    }

    /**
     * Stepper settings key -> body CSS class prefix (the level number is
     * appended, e.g. 'textSize' level 2 -> "a11y-text-size-2"), a verbatim
     * port of the equivalent lines in _design-reference/app.jsx. Note
     * colorChange maps to the "a11y-color-" prefix, not "a11y-color-change-".
     *
     * @return array<string, string>
     */
    public static function get_stepper_class_prefix_map(): array {
        return [
            'textSize' => 'a11y-text-size-',
            'lineHeight' => 'a11y-line-height-',
            'textSpacing' => 'a11y-text-spacing-',
            'textAlign' => 'a11y-text-align-',
            'contrast' => 'a11y-contrast-',
            'saturation' => 'a11y-saturation-',
            'colorChange' => 'a11y-color-',
            'cursor' => 'a11y-cursor-',
        ];
    }

    /**
     * Whether the plugin should render on the current request.
     *
     * Checks: plugin enabled, guest visibility, excluded page patterns.
     * Implemented fully in M6 (config.php); returns true for now so the
     * M1..M5 milestones can be verified end-to-end before the admin
     * settings exist.
     *
     * @return bool
     */
    public static function is_active_on_current_page(): bool {
        global $PAGE;

        if (during_initial_install()) {
            return false;
        }

        if (isset($PAGE) && $PAGE->pagelayout === 'maintenance') {
            return false;
        }

        return config::is_enabled() && config::allowed_for_current_user() && !config::current_page_excluded();
    }

    /**
     * Merge, validate and sanitize a raw (client-supplied or stored) settings
     * payload against the default shape: unknown keys are dropped, booleans
     * are coerced, stepper values are clamped to their valid range, and any
     * option disabled by the site admin (settings.php enabledfeatures) is
     * forced back to its default value.
     *
     * @param mixed $raw Decoded JSON (assoc array) or already-an-array settings payload.
     * @return array<string, bool|int> A complete, safe settings array.
     */
    public static function sanitize_settings($raw): array {
        $defaults = self::get_default_settings();
        $steppermax = self::get_stepper_max();
        $enabled = config::enabled_features();

        $result = $defaults;
        if (!is_array($raw)) {
            return $result;
        }

        foreach ($defaults as $key => $defaultvalue) {
            if (!array_key_exists($key, $raw)) {
                continue;
            }
            if (!in_array($key, $enabled, true)) {
                // Site admin disabled this option: keep it at default.
                continue;
            }
            if (isset($steppermax[$key])) {
                $value = (int) $raw[$key];
                $result[$key] = max(0, min($steppermax[$key], $value));
            } else {
                // Accept real booleans as well as the "true"/"false" strings
                // a naive JSON round-trip through form params could produce.
                $value = $raw[$key];
                if (is_string($value)) {
                    $value = $value === 'true' || $value === '1';
                }
                $result[$key] = (bool) $value;
            }
        }

        return $result;
    }

    /**
     * @param array<string, bool|int> $settings
     * @return int Count of options that differ from their default value.
     */
    public static function count_active(array $settings): int {
        $defaults = self::get_default_settings();
        $count = 0;
        foreach ($defaults as $key => $defaultvalue) {
            if (($settings[$key] ?? $defaultvalue) !== $defaultvalue) {
                $count++;
            }
        }
        return $count;
    }

    /**
     * Server-side known settings for the *current* user, used only for the
     * no-FOUC bootstrap (classes/output/renderer.php::render_nofouc_script()).
     * Guests/not-logged-in users have no server-side preference (their
     * settings live in localStorage only) so this returns defaults for them;
     * the client-side bootstrap script falls back to reading localStorage
     * itself in that case.
     *
     * @return array<string, bool|int>
     */
    public static function get_current_user_settings(): array {
        global $USER;

        if (!isloggedin() || isguestuser()) {
            return self::get_default_settings();
        }

        $raw = get_user_preferences(self::PREFERENCE_NAME, null, $USER);
        if ($raw === null) {
            return self::get_default_settings();
        }

        $decoded = json_decode($raw, true);
        return self::sanitize_settings($decoded);
    }
}
