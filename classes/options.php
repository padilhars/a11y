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
 * The 28 accessibility options — a PHP port of OPTIONS in
 * _design-reference/a11y-data.jsx (same ids, same grouping, same order),
 * plus five additions beyond the prototype: 'textAlign' (D30), 'silenceMedia',
 * 'wordSpacing' and 'blueLightFilter' (D40), and 'magnifier' (D42).
 * Labels/descriptions are resolved via get_string() instead of the
 * prototype's inline pt-BR/en literals.
 *
 * @description The 28 accessibility options (PHP port of OPTIONS).
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */
class options {
    /**
     * Returns the full list of accessibility option definitions.
     *
     * @return array<int, array<string, mixed>> Option definitions, in display order.
     */
    public static function all(): array {
        $options = [
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
            ['id' => 'wordSpacing', 'cat' => 'typography', 'kind' => 'stepper', 'max' => 3, 'icon' => 'moveHorizontal',
                'labelkey' => 'opt_wordspacing', 'desckey' => null, 'levelprefix' => 'wordspacinglevel_'],
            ['id' => 'textAlign', 'cat' => 'typography', 'kind' => 'stepper', 'max' => 4, 'icon' => 'textAlign',
                'labelkey' => 'opt_textalign', 'desckey' => null, 'levelprefix' => 'alignlevel_'],
            ['id' => 'bionicReading', 'cat' => 'typography', 'kind' => 'toggle', 'icon' => 'bold',
                // No desckey (unlike some other hashelp options) - the help
                // block (help_br_1) already covers the mechanism, and a
                // one-line desc here just duplicated it verbatim; matches
                // the majority of hashelp options in this file (readingGuide,
                // readingMask, magnifier, pauseAnimations, ...), which don't
                // carry a desc either.
                'labelkey' => 'opt_bionicreading', 'desckey' => null, 'hashelp' => true],

            // -- Color & contrast --
            ['id' => 'contrast', 'cat' => 'color', 'kind' => 'stepper', 'max' => 3, 'icon' => 'contrast',
                'labelkey' => 'opt_contrast', 'desckey' => null, 'levelprefix' => 'contrastlevel_'],
            ['id' => 'invertColors', 'cat' => 'color', 'kind' => 'toggle', 'icon' => 'invertColors',
                'labelkey' => 'opt_invertcolors', 'desckey' => null],
            ['id' => 'colorChange', 'cat' => 'color', 'kind' => 'stepper', 'max' => 3, 'icon' => 'pipette',
                'labelkey' => 'opt_colorchange', 'desckey' => 'opt_colorchange_desc', 'levelprefix' => 'colorchangelevel_'],
            ['id' => 'saturation', 'cat' => 'color', 'kind' => 'stepper', 'max' => 3, 'icon' => 'saturation',
                'labelkey' => 'opt_saturation', 'desckey' => null, 'levelprefix' => 'saturationlevel_'],
            ['id' => 'blueLightFilter', 'cat' => 'color', 'kind' => 'stepper', 'max' => 3, 'icon' => 'moon',
                'labelkey' => 'opt_bluelightfilter', 'desckey' => null, 'levelprefix' => 'bluelightlevel_'],

            // -- Media & motion --
            ['id' => 'hideImages', 'cat' => 'media', 'kind' => 'toggle', 'icon' => 'imageOff',
                'labelkey' => 'opt_hideimages', 'desckey' => null],
            ['id' => 'pauseAnimations', 'cat' => 'media', 'kind' => 'toggle', 'icon' => 'pause',
                'labelkey' => 'opt_pauseanimations', 'desckey' => null, 'hashelp' => true],
            ['id' => 'silenceMedia', 'cat' => 'media', 'kind' => 'toggle', 'icon' => 'volumeX',
                'labelkey' => 'opt_silencemedia', 'desckey' => 'opt_silencemedia_desc', 'hashelp' => true],
            ['id' => 'tooltips', 'cat' => 'media', 'kind' => 'toggle', 'icon' => 'tooltip',
                'labelkey' => 'opt_tooltips', 'desckey' => null],

            // -- Focus & navigation --
            ['id' => 'readingGuide', 'cat' => 'navigation', 'kind' => 'toggle', 'icon' => 'ruler',
                'labelkey' => 'opt_readingguide', 'desckey' => null, 'hashelp' => true],
            ['id' => 'readingMask', 'cat' => 'navigation', 'kind' => 'toggle', 'icon' => 'mask',
                'labelkey' => 'opt_readingmask', 'desckey' => null, 'hashelp' => true],
            ['id' => 'magnifier', 'cat' => 'navigation', 'kind' => 'toggle', 'icon' => 'zoomIn',
                'labelkey' => 'opt_magnifier', 'desckey' => null, 'hashelp' => true],
            ['id' => 'cursor', 'cat' => 'navigation', 'kind' => 'stepper', 'max' => 2, 'icon' => 'mousePointer',
                'labelkey' => 'opt_cursor', 'desckey' => null, 'levelprefix' => 'cursorlevel_'],
            ['id' => 'focusMode', 'cat' => 'navigation', 'kind' => 'stepper', 'max' => 3, 'icon' => 'focus',
                'labelkey' => 'opt_focusmode', 'desckey' => 'opt_focusmode_desc', 'levelprefix' => 'focusmodelevel_'],

            // -- Advanced --
            ['id' => 'screenReader', 'cat' => 'advanced', 'kind' => 'toggle', 'icon' => 'volume',
                'labelkey' => 'opt_screenreader', 'desckey' => 'opt_screenreader_desc', 'hashelp' => true],
            ['id' => 'virtualKeyboard', 'cat' => 'advanced', 'kind' => 'toggle', 'icon' => 'keyboard',
                'labelkey' => 'opt_virtualkeyboard', 'desckey' => null, 'hashelp' => true],
            ['id' => 'voiceCommands', 'cat' => 'advanced', 'kind' => 'toggle', 'icon' => 'mic',
                'labelkey' => 'opt_voicecommands', 'desckey' => null, 'hashelp' => true],
            ['id' => 'faceNavigation', 'cat' => 'advanced', 'kind' => 'toggle', 'icon' => 'scanFace',
                'labelkey' => 'opt_facenavigation', 'desckey' => 'opt_facenavigation_desc', 'hashelp' => true],
        ];

        // signLanguage (D54) only exists at all while the local_vlibras
        // integration is actually usable - see
        // classes/integration/vlibras.php::is_integrated(). This is the
        // one option in this array that isn't a fixed, always-present
        // entry; every caller of options::all() (panel rendering, the
        // "active options" admin setting, sanitize_settings() by way of
        // manager::get_default_settings() mirroring this same condition)
        // has to tolerate it appearing/disappearing between page loads.
        if (\local_a11y\integration\vlibras::is_integrated()) {
            $options[] = ['id' => 'signLanguage', 'cat' => 'media', 'kind' => 'toggle', 'icon' => 'hand',
                'labelkey' => 'opt_signlanguage', 'desckey' => null, 'hashelp' => true];
        }

        return $options;
    }

    /**
     * Returns the display order of option categories.
     *
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
