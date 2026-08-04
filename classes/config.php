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
 * @description Reads admin settings (settings.php) with sane defaults.
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */
class config {

    /**
     * @return bool
     */
    public static function is_enabled(): bool {
        $value = get_config('local_a11y', 'enabled');
        return $value === false ? true : (bool) $value;
    }

    /**
     * @return bool
     */
    public static function show_for_guests(): bool {
        $value = get_config('local_a11y', 'showforguests');
        return $value === false ? true : (bool) $value;
    }

    /**
     * @return bool True if the current user (guest or logged in) is allowed to see the plugin.
     */
    public static function allowed_for_current_user(): bool {
        // Anonymous (not-logged-in) visitors have no role assignment to check
        // a capability against on sites with forced login, so the admin's
        // "show for guests" boolean is the control here, not the capability.
        if (!isloggedin() || isguestuser()) {
            return self::show_for_guests();
        }

        $context = \context_system::instance();
        return has_capability('local/a11y:view', $context);
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
            'fabicon' => (string) (get_config('local_a11y', 'fabicon') ?: 'un'),
            'fabshape' => (string) (get_config('local_a11y', 'fabshape') ?: 'circle'),
            'panelformat' => (string) (get_config('local_a11y', 'panelformat') ?: 'popover'),
            'density' => (string) (get_config('local_a11y', 'density') ?: 'regular'),
            'accent' => (string) (get_config('local_a11y', 'accent') ?: '#3b82f6'),
            'showprofiles' => (function() {
                $value = get_config('local_a11y', 'showprofiles');
                return $value === false ? true : (bool) $value;
            })(),
        ];
    }

    /**
     * Colours for the page-effect options that don't have a fixed one
     * (--local-a11y-accent is FAB/panel-only, see get_appearance() -
     * these two apply to page content itself): "Destacar títulos/links/
     * botões" and "Guia de leitura".
     *
     * @return string[] hex colours, keyed 'highlight' and 'readingguide'.
     */
    public static function get_effect_colors(): array {
        return [
            'highlight' => (string) (get_config('local_a11y', 'highlightcolor') ?: '#f97316'),
            'readingguide' => (string) (get_config('local_a11y', 'readingguidecolor') ?: '#3b82f6'),
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

    /**
     * The panel footer message (below the option categories, above the
     * Alt+A hint) - "Made with <3 by CPTED, for you" by default (the
     * 'savetitle' lang string), customisable per-site since D34. Admin
     * input is rich text (admin_setting_confightmleditor) so the same kind
     * of inline emphasis the default already uses (a <strong> tag) stays
     * possible, but it's run through format_text() - never trusted/output
     * verbatim - exactly like any other admin-authored HTML snippet
     * (frontpage summary, additional HTML footer, etc.) elsewhere in
     * Moodle core.
     *
     * @return string Safe HTML, ready for raw (unescaped) template output.
     */
    public static function footer_text(): string {
        $custom = trim((string) (get_config('local_a11y', 'footertext') ?? ''));
        if ($custom === '') {
            return get_string('savetitle', 'local_a11y');
        }
        return format_text($custom, FORMAT_HTML, ['context' => \context_system::instance(), 'para' => false]);
    }
}
