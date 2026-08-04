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
 * The 23 accessibility options — a PHP port of OPTIONS in
 * _design-reference/a11y-data.jsx (same ids, same grouping, same order),
 * plus one addition beyond the prototype: 'textAlign' (see DECISIONS.md
 * D30). Labels/descriptions are resolved via get_string() instead of the
 * prototype's inline pt-BR/en literals.
 *
 * @package    local_a11y
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class options {

    /**
     * @return array<int, array<string, mixed>> Option definitions, in display order.
     */
    public static function all(): array {
        return [
            // -- Typography --
            ['id' => 'readableFont', 'cat' => 'typography', 'kind' => 'toggle', 'icon' => 'type',
                'labelkey' => 'opt_readablefont', 'desckey' => 'opt_readablefont_desc'],
            ['id' => 'dyslexicFont', 'cat' => 'typography', 'kind' => 'toggle', 'icon' => 'bookOpen',
                'labelkey' => 'opt_dyslexicfont', 'desckey' => 'opt_dyslexicfont_desc'],
            ['id' => 'highlightTitles', 'cat' => 'typography', 'kind' => 'toggle', 'icon' => 'heading',
                'labelkey' => 'opt_highlighttitles', 'desckey' => null],
            ['id' => 'highlightLinks', 'cat' => 'typography', 'kind' => 'toggle', 'icon' => 'link',
                'labelkey' => 'opt_highlightlinks', 'desckey' => null],
            ['id' => 'highlightButtons', 'cat' => 'typography', 'kind' => 'toggle', 'icon' => 'squareButton',
                'labelkey' => 'opt_highlightbuttons', 'desckey' => null],
            ['id' => 'textSize', 'cat' => 'typography', 'kind' => 'stepper', 'max' => 4, 'icon' => 'textSize',
                'labelkey' => 'opt_textsize', 'desckey' => null, 'levelprefix' => 'level_'],
            ['id' => 'lineHeight', 'cat' => 'typography', 'kind' => 'stepper', 'max' => 3, 'icon' => 'lineHeight',
                'labelkey' => 'opt_lineheight', 'desckey' => null, 'levelprefix' => 'lineheightlevel_'],
            ['id' => 'textSpacing', 'cat' => 'typography', 'kind' => 'stepper', 'max' => 3, 'icon' => 'textSpacing',
                'labelkey' => 'opt_textspacing', 'desckey' => null, 'levelprefix' => 'spacinglevel_'],
            ['id' => 'textAlign', 'cat' => 'typography', 'kind' => 'stepper', 'max' => 4, 'icon' => 'textAlign',
                'labelkey' => 'opt_textalign', 'desckey' => null, 'levelprefix' => 'alignlevel_'],

            // -- Color & contrast --
            ['id' => 'contrast', 'cat' => 'color', 'kind' => 'stepper', 'max' => 3, 'icon' => 'contrast',
                'labelkey' => 'opt_contrast', 'desckey' => null, 'levelprefix' => 'contrastlevel_'],
            ['id' => 'invertColors', 'cat' => 'color', 'kind' => 'toggle', 'icon' => 'invertColors',
                'labelkey' => 'opt_invertcolors', 'desckey' => null],
            ['id' => 'colorChange', 'cat' => 'color', 'kind' => 'stepper', 'max' => 3, 'icon' => 'pipette',
                'labelkey' => 'opt_colorchange', 'desckey' => 'opt_colorchange_desc', 'levelprefix' => 'colorchangelevel_'],
            ['id' => 'saturation', 'cat' => 'color', 'kind' => 'stepper', 'max' => 3, 'icon' => 'saturation',
                'labelkey' => 'opt_saturation', 'desckey' => null, 'levelprefix' => 'saturationlevel_'],

            // -- Media & motion --
            ['id' => 'hideImages', 'cat' => 'media', 'kind' => 'toggle', 'icon' => 'imageOff',
                'labelkey' => 'opt_hideimages', 'desckey' => null],
            ['id' => 'pauseAnimations', 'cat' => 'media', 'kind' => 'toggle', 'icon' => 'pause',
                'labelkey' => 'opt_pauseanimations', 'desckey' => null],
            ['id' => 'tooltips', 'cat' => 'media', 'kind' => 'toggle', 'icon' => 'tooltip',
                'labelkey' => 'opt_tooltips', 'desckey' => null],

            // -- Focus & navigation --
            ['id' => 'readingGuide', 'cat' => 'navigation', 'kind' => 'toggle', 'icon' => 'ruler',
                'labelkey' => 'opt_readingguide', 'desckey' => null],
            ['id' => 'readingMask', 'cat' => 'navigation', 'kind' => 'toggle', 'icon' => 'mask',
                'labelkey' => 'opt_readingmask', 'desckey' => null],
            ['id' => 'cursor', 'cat' => 'navigation', 'kind' => 'stepper', 'max' => 2, 'icon' => 'mousePointer',
                'labelkey' => 'opt_cursor', 'desckey' => null, 'levelprefix' => 'cursorlevel_'],
            ['id' => 'focusMode', 'cat' => 'navigation', 'kind' => 'toggle', 'icon' => 'focus',
                'labelkey' => 'opt_focusmode', 'desckey' => 'opt_focusmode_desc'],

            // -- Advanced --
            ['id' => 'screenReader', 'cat' => 'advanced', 'kind' => 'toggle', 'icon' => 'volume',
                'labelkey' => 'opt_screenreader', 'desckey' => 'opt_screenreader_desc'],
            ['id' => 'virtualKeyboard', 'cat' => 'advanced', 'kind' => 'toggle', 'icon' => 'keyboard',
                'labelkey' => 'opt_virtualkeyboard', 'desckey' => null],
            ['id' => 'voiceCommands', 'cat' => 'advanced', 'kind' => 'toggle', 'icon' => 'mic',
                'labelkey' => 'opt_voicecommands', 'desckey' => null, 'hashelp' => true],
            ['id' => 'faceNavigation', 'cat' => 'advanced', 'kind' => 'toggle', 'icon' => 'scanFace',
                'labelkey' => 'opt_facenavigation', 'desckey' => 'opt_facenavigation_desc', 'hashelp' => true],
        ];
    }

    /**
     * @return array<int, string> Category ids in display order, mirroring CATEGORIES in a11y-panel.jsx.
     */
    public static function category_order(): array {
        return ['typography', 'color', 'media', 'navigation', 'advanced'];
    }

    /**
     * Which categories are open by default (only 'typography', per the prototype).
     *
     * @return array<string, bool>
     */
    public static function category_default_open(): array {
        return [
            'typography' => true,
            'color' => false,
            'media' => false,
            'navigation' => false,
            'advanced' => false,
        ];
    }

}
