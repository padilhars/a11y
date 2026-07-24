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
     * Default value (all options off / level 0), mirrors DEFAULT_SETTINGS in
     * _design-reference/a11y-data.jsx exactly (same keys, same order).
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
            'contrast' => 3,
            'colorChange' => 3,
            'saturation' => 3,
            'cursor' => 2,
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
}
