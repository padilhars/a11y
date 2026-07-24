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
 * Reads admin settings (settings.php) with sane defaults, so the rest of the
 * plugin never has to know a setting might not exist yet (fresh install
 * before cache warm-up, or M1-M5 milestones where settings.php is still
 * minimal).
 *
 * @package    local_a11y
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class config {

    /**
     * @return bool
     */
    public static function is_enabled(): bool {
        return (bool) (get_config('local_a11y', 'enabled') ?? 1);
    }

    /**
     * @return bool
     */
    public static function show_for_guests(): bool {
        return (bool) (get_config('local_a11y', 'showforguests') ?? 1);
    }

    /**
     * @return bool True if the current user (guest or logged in) is allowed to see the plugin.
     */
    public static function allowed_for_current_user(): bool {
        global $USER;

        $context = \context_system::instance();
        if (!has_capability('local/a11y:view', $context)) {
            return false;
        }

        if (isguestuser() || !isloggedin()) {
            return self::show_for_guests();
        }

        return true;
    }

    /**
     * @return string[] URL wildcard patterns (one per line in the setting) to exclude.
     */
    public static function excluded_page_patterns(): array {
        $raw = (string) (get_config('local_a11y', 'excludedpages') ?? '');
        $lines = preg_split('/[\r\n]+/', $raw, -1, PREG_SPLIT_NO_EMPTY);
        return array_map('trim', $lines ?: []);
    }

    /**
     * @return bool True if the current request URL matches an excluded pattern.
     */
    public static function current_page_excluded(): bool {
        global $FULLME;

        $patterns = self::excluded_page_patterns();
        if (empty($patterns) || empty($FULLME)) {
            return false;
        }

        foreach ($patterns as $pattern) {
            if ($pattern === '') {
                continue;
            }
            $regex = '#^' . str_replace('\*', '.*', preg_quote($pattern, '#')) . '$#i';
            if (preg_match($regex, $FULLME)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array Tweak-style settings consumed by the panel/FAB templates.
     */
    public static function get_appearance(): array {
        return [
            'fabposition' => (string) (get_config('local_a11y', 'fabposition') ?: 'bottom-right'),
            'fabicon' => (string) (get_config('local_a11y', 'fabicon') ?: 'accessibility'),
            'fabshape' => (string) (get_config('local_a11y', 'fabshape') ?: 'circle'),
            'panelformat' => (string) (get_config('local_a11y', 'panelformat') ?: 'popover'),
            'density' => (string) (get_config('local_a11y', 'density') ?: 'regular'),
            'accent' => (string) (get_config('local_a11y', 'accent') ?: '#3b82f6'),
            'showprofiles' => (bool) (get_config('local_a11y', 'showprofiles') ?? 1),
        ];
    }

    /**
     * @return string[] Option ids enabled by the site admin (default: all).
     */
    public static function enabled_features(): array {
        $raw = (string) (get_config('local_a11y', 'enabledfeatures') ?? '');
        if ($raw === '') {
            return array_keys(manager::get_default_settings());
        }
        return explode(',', $raw);
    }
}
