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
 * Inline SVG icon registry — a verbatim PHP port of ICON_PATHS in
 * _design-reference/a11y-data.jsx (Lucide icons @ 0.453, stroke 1.75), so
 * the plugin renders pixel-identical icons without a JS icon library.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
class icons {
    /** @var array<string,string> Icon name => inner SVG markup (path/circle/etc, no outer <svg>). */
    const PATHS = [
        'accessibility' => '<circle cx="12" cy="4" r="2"/><path d="M19 13v-2a7 7 0 0 0-14 0v2"/><path d="m12 12 4 10"/><path '
            . 'd="m12 12-4 10"/><path d="M8 16h8"/>',
        'close' => '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        'chevronDown' => '<path d="m6 9 6 6 6-6"/>',
        'chevronRight' => '<path d="m9 18 6-6-6-6"/>',
        'search' => '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
        'refresh' => '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 '
            . '9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
        'check' => '<path d="M20 6 9 17l-5-5"/>',
        'star' => '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 '
            . '8.26 12 2"/>',
        'sparkles' => '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 '
            . '8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 '
            . '14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 '
            . '5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
        'typography' => '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" '
            . 'y1="4" y2="20"/>',
        'palette' => '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" '
            . 'fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" '
            . 'r=".5" fill="currentColor"/><path d="M12 2A10 10 0 0 0 2 12c0 5.5 4.5 10 10 10a3 3 0 0 0 3-3 1.7 1.7 '
            . '0 0 0-.4-1.1 1.7 1.7 0 0 1-.4-1.1 3 3 0 0 1 3-3h2.5a4.5 4.5 0 0 0 4.5-4.5c0-5.5-4.5-9.3-10-9.3z"/>',
        'media' => '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 '
            . '15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
        'navigation' => '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
        'tools' => '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 '
            . '6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
        'profile' => '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 '
            . '21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'eye' => '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
        'eyeLow' => '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 '
            . '7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 '
            . '5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
        'droplets' => '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 '
            . '2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 '
            . '3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
        'book' => '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
        'zap' => '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 '
            . '.78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
        'user' => '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        'alertTriangle' => '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 '
            . '9v4"/><path d="M12 17h.01"/>',
        'hand' => '<path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 '
            . '2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 '
            . '1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
        'brain' => '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 '
            . '1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 '
            . '2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 '
            . '0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>',
        'moon' => '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
        'type' => '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" '
            . 'y1="4" y2="20"/>',
        'bold' => '<path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8Z"/>',
        'bookOpen' => '<path d="M12 7v14"/><path d="M16 12h2"/><path d="M16 8h2"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 '
            . '1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 '
            . '0-3-3z"/><path d="M6 12h2"/><path d="M6 8h2"/>',
        'heading' => '<path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/>',
        'link' => '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 '
            . '0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
        'squareButton' => '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 12h6"/>',
        'image' => '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 '
            . '15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
        'imageOff' => '<line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" '
            . 'x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/><path d="M3.59 3.59A1.99 1.99 0 0 0 '
            . '3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/>',
        'tooltip' => '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        'pause' => '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
        'volumeX' => '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line '
            . 'x1="16" x2="22" y1="9" y2="15"/>',
        'textSize' => '<path d="M21 6V4H3v2"/><path d="M7 18h10"/><path d="M12 4v14"/>',
        'lineHeight' => '<path d="M3 8 7 4l4 4"/><path d="M7 4v16"/><path d="m3 16 4 4 4-4"/><path d="M15 4h7"/><path d="M15 '
            . '12h7"/><path d="M15 20h7"/>',
        'textSpacing' => '<path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 '
            . '2-2v-3"/><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/>',
        'moveHorizontal' => '<polyline points="18 8 22 12 18 16"/><polyline points="6 8 2 12 6 16"/><line x1="2" x2="22" y1="12" '
            . 'y2="12"/>',
        'textAlign' => '<line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" '
            . 'y1="18" y2="18"/>',
        'contrast' => '<circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z" fill="currentColor"/>',
        'sun' => '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 '
            . '1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 '
            . '17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
        'contrastHigh' => '<circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/>',
        'invertColors' => '<path d="M12 22A10 10 0 0 1 5 5l7 7Z"/><path d="M12 2a10 10 0 0 1 7 17l-7-7Z"/>',
        'pipette' => '<path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 '
            . '9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>',
        'saturation' => '<path d="M5.5 5 7 2h10l1.5 3"/><path d="M5.5 19 7 22h10l1.5-3"/><path d="M2 12h20"/><circle cx="12" '
            . 'cy="12" r="6"/>',
        'blackAndWhite' => '<circle cx="12" cy="12" r="10"/><path d="M12 2v20"/>',
        'ruler' => '<path d="M21.3 8.7 8.7 21.3a2.41 2.41 0 0 1-3.4 0l-2.6-2.6a2.41 2.41 0 0 1 0-3.4L15.3 2.7a2.41 2.41 0 '
            . '0 1 3.4 0l2.6 2.6a2.41 2.41 0 0 1 0 3.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path '
            . 'd="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/>',
        'mask' => '<path d="M3 7v8a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4z"/><path d="M7 '
            . '11h.01"/><path d="M17 11h.01"/><path d="M7 15h10"/>',
        'mousePointer' => '<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/>',
        'mousePointer2' => '<path d="M4 4l7.07 17 2.51-7.39 7.39-2.51L4 4z"/>',
        'focus' => '<circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 '
            . '2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',
        'volume' => '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path '
            . 'd="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
        'keyboard' => '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path '
            . 'd="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 '
            . '12h.01"/><path d="M7 16h10"/>',
        'mic' => '<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" '
            . 'x2="12" y1="19" y2="22"/>',
        'scanFace' => '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 '
            . '2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 '
            . '9h.01"/><path d="M15 9h.01"/>',
        'bell' => '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
        'arrowRight' => '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
        'dot' => '<circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
        'clock' => '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
        'zoomIn' => '<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" '
            . 'y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/>',
        // Lucide "maximize-2" - not in _design-reference/a11y-data.jsx's
        // ICON_PATHS (contentWidth has no prototype equivalent, same
        // situation focusMode was in per D52) - added new, same stroke/
        // viewBox conventions as every other icon here.
        'maximize' => '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" '
            . 'y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>',
    ];

    /**
     * Render an inline <svg> for the given icon name, matching the
     * prototype's <Icon> component defaults exactly (viewBox 0 0 24 24,
     * stroke currentColor, round caps/joins).
     *
     * @param string $name Icon key into self::PATHS; unknown names render as empty string.
     * @param int $size Width/height in pixels (icon is square).
     * @param float $stroke SVG stroke-width.
     * @param string $class extra CSS class(es)
     * @return string Inline <svg>...</svg> markup, or '' if $name is unknown.
     */
    public static function svg(string $name, int $size = 18, float $stroke = 1.75, string $class = ''): string {
        $inner = self::PATHS[$name] ?? '';
        if ($inner === '') {
            return '';
        }
        $classattr = $class !== '' ? ' class="' . s($class) . '"' : '';
        return '<svg width="' . $size . '" height="' . $size . '" viewBox="0 0 24 24" fill="none" '
            . 'stroke="currentColor" stroke-width="' . $stroke . '" stroke-linecap="round" '
            . 'stroke-linejoin="round" aria-hidden="true" focusable="false"' . $classattr . '>' . $inner . '</svg>';
    }

    /** @var string|null Cached inner markup of pix/accessibility-un.svg (null until first read). */
    private static $unaccessibilityinner = null;

    /**
     * Render an inline <svg> for the "Accessibility logo (UN)" — themes via
     * currentColor like every icon in PATHS/svg() above, but gets its own
     * method instead of a PATHS entry because its viewBox (0 0 1000 1000)
     * and markup don't fit svg()'s 24x24 Lucide-style wrapper. Inner markup
     * comes straight from pix/accessibility-un.svg (see that file for the
     * source/licence — CC BY-SA 4.0, attribution in README.md), read once
     * and cached rather than re-parsed on every render.
     *
     * @param int $size Width/height in pixels (icon is square).
     * @param string $class extra CSS class(es)
     * @return string Inline <svg>...</svg> markup, or '' if the source file is unreadable.
     */
    public static function un_accessibility_svg(int $size = 26, string $class = ''): string {
        if (self::$unaccessibilityinner === null) {
            $path = __DIR__ . '/../pix/accessibility-un.svg';
            $raw = is_readable($path) ? file_get_contents($path) : '';
            self::$unaccessibilityinner = '';
            if ($raw !== '' && preg_match('#<svg[^>]*>(.*)</svg>#s', $raw, $matches)) {
                self::$unaccessibilityinner = $matches[1];
            }
        }
        if (self::$unaccessibilityinner === '') {
            return '';
        }
        $classattr = $class !== '' ? ' class="' . s($class) . '"' : '';
        return '<svg width="' . $size . '" height="' . $size . '" viewBox="0 0 1000 1000" '
            . 'aria-hidden="true" focusable="false"' . $classattr . '>' . self::$unaccessibilityinner . '</svg>';
    }

    /** @var string|null Cached inner markup of pix/accessibility-default.svg (null until first read). */
    private static $defaultaccessibilityinner = null;

    /**
     * Render an inline <svg> for the "Accessibility (default)" fabicon
     * option - same read-once-and-cache-the-inner-markup pattern as
     * un_accessibility_svg() just above, for the same reason: this icon's
     * viewBox (0 0 512 512) and markup (fill-based, not PATHS' 24x24
     * stroke-based Lucide style) don't fit svg()'s wrapper. Inner markup
     * comes straight from pix/accessibility-default.svg (see that file for
     * source/licence notes), themed via currentColor like every other icon
     * here.
     *
     * @param int $size Width/height in pixels (icon is square).
     * @param string $class extra CSS class(es)
     * @return string Inline <svg>...</svg> markup, or '' if the source file is unreadable.
     */
    public static function default_accessibility_svg(int $size = 26, string $class = ''): string {
        if (self::$defaultaccessibilityinner === null) {
            $path = __DIR__ . '/../pix/accessibility-default.svg';
            $raw = is_readable($path) ? file_get_contents($path) : '';
            self::$defaultaccessibilityinner = '';
            if ($raw !== '' && preg_match('#<svg[^>]*>(.*)</svg>#s', $raw, $matches)) {
                self::$defaultaccessibilityinner = $matches[1];
            }
        }
        if (self::$defaultaccessibilityinner === '') {
            return '';
        }
        $classattr = $class !== '' ? ' class="' . s($class) . '"' : '';
        return '<svg width="' . $size . '" height="' . $size . '" viewBox="0 0 512 512" '
            . 'aria-hidden="true" focusable="false"' . $classattr . '>' . self::$defaultaccessibilityinner . '</svg>';
    }

    /**
     * Resolve the admin-configured `local_a11y/fabicon` setting to actual
     * rendered markup — shared by the FAB (classes/output/fab.php) and the
     * panel header badge (classes/output/panel.php) so both always show the
     * *same* icon, per the setting.
     *
     * @param string $fabicon raw `appearance['fabicon']` value (untrusted -
     *        falls back to 'default' for anything unrecognised).
     * @param int $size Width/height in pixels (icon is square).
     * @return array{svg: string, isun: bool} `isun` lets callers apply their
     *         own un-specific modifier class where needed (e.g. the FAB
     *         gives it a touch of padding - see local-a11y-fab__icon--un in
     *         styles.css); the icon itself themes via currentColor like the
     *         rest of PATHS/svg(), so callers that don't need special
     *         treatment (e.g. the panel badge) can ignore this flag.
     */
    public static function fabicon_svg(string $fabicon, int $size): array {
        $known = ['default', 'un'];
        $iconname = in_array($fabicon, $known, true) ? $fabicon : 'default';
        if ($iconname === 'un') {
            return ['svg' => self::un_accessibility_svg($size), 'isun' => true];
        }
        return ['svg' => self::default_accessibility_svg($size), 'isun' => false];
    }
}
