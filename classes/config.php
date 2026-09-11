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
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
class config {
    /**
     * Whether the plugin is enabled site-wide.
     *
     * @return bool True if enabled (default when the setting is unset).
     */
    public static function is_enabled(): bool {
        $value = get_config('local_a11y', 'enabled');
        return $value === false ? true : (bool) $value;
    }

    /**
     * Whether the plugin should be shown to not-logged-in/guest users.
     *
     * @return bool True if shown to guests (default when the setting is unset).
     */
    public static function show_for_guests(): bool {
        $value = get_config('local_a11y', 'showforguests');
        return $value === false ? true : (bool) $value;
    }

    /**
     * Checks visibility for the current request: guests are gated by
     * show_for_guests(), logged-in users by the local/a11y:view capability.
     *
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
     * Parses the admin-configured excludedpages textarea into a clean list.
     *
     * @return string[] URL wildcard patterns (one per line in the setting) to exclude.
     */
    public static function excluded_page_patterns(): array {
        $raw = (string) (get_config('local_a11y', 'excludedpages') ?? '');
        $lines = preg_split('/[\r\n]+/', $raw, -1, PREG_SPLIT_NO_EMPTY);
        return array_map('trim', $lines ?: []);
    }

    /**
     * Matches the current request URL ($FULLME) against excluded_page_patterns().
     *
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
     * Reads the FAB/panel appearance admin settings with defaults applied.
     *
     * @return array Tweak-style settings consumed by the panel/FAB templates.
     */
    public static function get_appearance(): array {
        return [
            'fabposition' => (string) (get_config('local_a11y', 'fabposition') ?: 'bottom-right'),
            'fabicon' => (string) (get_config('local_a11y', 'fabicon') ?: 'default'),
            'fabshape' => (string) (get_config('local_a11y', 'fabshape') ?: 'circle'),
            'panelformat' => (string) (get_config('local_a11y', 'panelformat') ?: 'popover'),
            'density' => (string) (get_config('local_a11y', 'density') ?: 'regular'),
            'accent' => self::valid_hex_color((string) get_config('local_a11y', 'accent'), '#3b82f6'),
            'showprofiles' => (function () {
                $value = get_config('local_a11y', 'showprofiles');
                return $value === false ? true : (bool) $value;
            })(),
        ];
    }

    /**
     * Security audit finding: unlike the 4 page-effect colours (re-validated
     * in classes/output/renderer.php::render_effect_color_vars() before
     * going into raw HTML), 'accent' went from admin_setting_configcolourpicker
     * straight into templates/fab.mustache and panel.mustache's
     * `style="--local-a11y-accent: {{accent}};"` with no format check of its
     * own - Mustache's default HTML-escaping stops it from breaking out of
     * the style attribute, but a malformed value could still smuggle extra
     * `property: value;` declarations onto that one element. Site-admin-only
     * input (same trust tier as the setting itself), so low severity, but
     * inconsistent with the other 4 - validated here too now, for every
     * caller of get_appearance() at once.
     *
     * @param string $color The raw stored value.
     * @param string $default Fallback if $color isn't a valid #rgb[a]/#rrggbb[aa] hex colour.
     * @return string $color if valid, otherwise $default.
     */
    private static function valid_hex_color(string $color, string $default): string {
        return preg_match('/^#[0-9a-fA-F]{3,8}$/', $color) ? $color : $default;
    }

    /**
     * Colours for the page-effect options that don't have a fixed one
     * (--local-a11y-accent is FAB/panel-only, see get_appearance() -
     * these apply to page content itself): "Destacar Títulos", "Destacar
     * Links", "Destacar Botões" (each independently configurable, not one
     * shared colour) and "Guia de Leitura".
     *
     * @return string[] hex colours, keyed 'highlighttitles', 'highlightlinks', 'highlightbuttons', 'readingguide'.
     */
    public static function get_effect_colors(): array {
        return [
            'highlighttitles' => (string) (get_config('local_a11y', 'highlighttitlescolor') ?: '#eab308'),
            'highlightlinks' => (string) (get_config('local_a11y', 'highlightlinkscolor') ?: '#3b82f6'),
            'highlightbuttons' => (string) (get_config('local_a11y', 'highlightbuttonscolor') ?: '#f97316'),
            'readingguide' => (string) (get_config('local_a11y', 'readingguidecolor') ?: '#3b82f6'),
        ];
    }

    /**
     * Reads the admin-configured list of enabled option ids.
     *
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
     * Alt+A hint) - "Made with <3 by UFPel, for you" by default (the
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

    /**
     * Whether aggregate, anonymous usage-stat collection (D47) is turned
     * on. Off by default - the site admin must opt in explicitly via
     * `local_a11y/collectstats`. This is the single source of truth both
     * the server (classes/stats.php::record_activation(), which re-checks
     * this itself rather than trusting any client-supplied flag) and the
     * client (classes/hook_callbacks.php passes this to amd/src/main.js's
     * init(), purely so it can skip a pointless network call when off -
     * never a security boundary on its own) rely on.
     *
     * @return bool
     */
    public static function collect_stats_enabled(): bool {
        return (bool) get_config('local_a11y', 'collectstats');
    }

    /**
     * WCAG 1.4.11 (Non-text Contrast, AA) compliance check for the
     * customisable colours (AUDIT-V2 finding WCAG-002): none of them were
     * validated for contrast before, so a site admin could pick a colour
     * (e.g. a light pastel) that is unreadable against the fixed white
     * icon/text it is paired with (the FAB's accent, or the coloured
     * highlight effects on page content). Called via each colour setting's
     * `set_updatedcallback()` in settings.php right after save - this is a
     * non-blocking warning (shown via \core\notification on the settings
     * page after redirect), not a hard validation failure, because a low
     * ratio against white specifically doesn't necessarily mean the colour
     * is unreadable in every context it's used in (e.g. text-decoration
     * colours are also seen against the page's own text colour, not just
     * white) - flagging it for a human to judge is safer than silently
     * rejecting a value that might be fine.
     *
     * @param string $configkey The `local_a11y/<key>` config key holding the hex colour.
     * @param string $label The setting's own display name, for the warning message.
     * @return void
     */
    public static function warn_if_low_contrast(string $configkey, string $label): void {
        $value = (string) get_config('local_a11y', $configkey);
        $ratio = self::contrast_ratio($value, '#ffffff');
        if ($ratio === null || $ratio >= 3.0) {
            return;
        }
        \core\notification::add(
            get_string('warning_lowcontrast', 'local_a11y', (object) [
                'label' => $label,
                'colour' => $value,
                'ratio' => number_format($ratio, 2),
            ]),
            \core\notification::WARNING
        );
    }

    /**
     * WCAG contrast ratio between two colours, per the standard relative-
     * luminance formula (WCAG 2.x, criteria 1.4.3/1.4.11): (L1 + 0.05) / (L2 + 0.05),
     * L1 being the lighter of the two.
     *
     * @param string $hex1 First colour, `#rgb` or `#rrggbb`.
     * @param string $hex2 Second colour, `#rgb` or `#rrggbb`.
     * @return float|null The contrast ratio (1.0-21.0), or null if either colour is malformed.
     */
    public static function contrast_ratio(string $hex1, string $hex2): ?float {
        $l1 = self::relative_luminance($hex1);
        $l2 = self::relative_luminance($hex2);
        if ($l1 === null || $l2 === null) {
            return null;
        }
        $lighter = max($l1, $l2);
        $darker = min($l1, $l2);
        return ($lighter + 0.05) / ($darker + 0.05);
    }

    /**
     * WCAG relative luminance of a single sRGB colour.
     *
     * @param string $hex `#rgb` or `#rrggbb`.
     * @return float|null Relative luminance (0.0-1.0), or null if $hex isn't a valid 3/6-digit hex colour.
     */
    private static function relative_luminance(string $hex): ?float {
        $hex = ltrim($hex, '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        if (!preg_match('/^[0-9a-fA-F]{6}$/', $hex)) {
            return null;
        }
        $channels = array_map(function (string $c): float {
            $c = hexdec($c) / 255;
            return $c <= 0.03928 ? $c / 12.92 : (($c + 0.055) / 1.055) ** 2.4;
        }, str_split($hex, 2));
        return 0.2126 * $channels[0] + 0.7152 * $channels[1] + 0.0722 * $channels[2];
    }
}
