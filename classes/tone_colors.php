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
 * Profile "tone" colour chips — a verbatim PHP port of TONE_COLORS in
 * _design-reference/a11y-data.jsx.
 *
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
class tone_colors {
    /** @var array<string, array<string, string>> */
    const COLORS = [
        'blue'   => ['bg' => '#eff6ff', 'text' => '#1d4ed8', 'icon' => '#3b82f6', 'border' => '#dbeafe'],
        'amber'  => ['bg' => '#fffbeb', 'text' => '#b45309', 'icon' => '#f59e0b', 'border' => '#fef3c7'],
        'violet' => ['bg' => '#f5f3ff', 'text' => '#6d28d9', 'icon' => '#8b5cf6', 'border' => '#ede9fe'],
        'pink'   => ['bg' => '#fdf2f8', 'text' => '#be185d', 'icon' => '#ec4899', 'border' => '#fce7f3'],
        'green'  => ['bg' => '#f0fdf4', 'text' => '#15803d', 'icon' => '#22c55e', 'border' => '#dcfce7'],
        'red'    => ['bg' => '#fef2f2', 'text' => '#b91c1c', 'icon' => '#ef4444', 'border' => '#fee2e2'],
        'cyan'   => ['bg' => '#ecfeff', 'text' => '#0e7490', 'icon' => '#06b6d4', 'border' => '#cffafe'],
        'teal'   => ['bg' => '#f0fdfa', 'text' => '#0f766e', 'icon' => '#14b8a6', 'border' => '#ccfbf1'],
        'slate'  => ['bg' => '#f1f5f9', 'text' => '#334155', 'icon' => '#475569', 'border' => '#e2e8f0'],
    ];

    /**
     * Looks up a profile tone's colour chip (bg/text/icon/border).
     *
     * @param string $tone Tone id, e.g. 'blue'; falls back to 'blue' if unknown.
     * @return array<string, string> Keys: bg, text, icon, border (hex colours).
     */
    public static function get(string $tone): array {
        return self::COLORS[$tone] ?? self::COLORS['blue'];
    }
}
