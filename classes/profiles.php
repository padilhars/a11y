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
 * The 9 accessibility profiles — a verbatim PHP port of PROFILES in
 * _design-reference/a11y-data.jsx (same ids, same `apply` presets, same order).
 *
 * @description The 9 accessibility profiles (PHP port of PROFILES).
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */
class profiles {

    /**
     * Returns the full list of accessibility profile preset definitions.
     *
     * @return array<int, array<string, mixed>> Profile definitions, in display order.
     */
    public static function all(): array {
        return [
            [
                'id' => 'lowVision', 'icon' => 'eyeLow', 'tone' => 'blue',
                'labelkey' => 'profile_lowvision', 'desckey' => 'profile_lowvision_desc',
                'apply' => ['textSize' => 3, 'contrast' => 3, 'cursor' => 1, 'highlightLinks' => true, 'highlightButtons' => true],
            ],
            [
                'id' => 'colorBlind', 'icon' => 'droplets', 'tone' => 'amber',
                'labelkey' => 'profile_colorblind', 'desckey' => 'profile_colorblind_desc',
                'apply' => ['colorChange' => 2, 'highlightLinks' => true, 'saturation' => 1],
            ],
            [
                'id' => 'dyslexia', 'icon' => 'book', 'tone' => 'violet',
                'labelkey' => 'profile_dyslexia', 'desckey' => 'profile_dyslexia_desc',
                'apply' => ['dyslexicFont' => true, 'textSpacing' => 2, 'lineHeight' => 2, 'readingGuide' => true],
            ],
            [
                'id' => 'adhd', 'icon' => 'zap', 'tone' => 'pink',
                'labelkey' => 'profile_adhd', 'desckey' => 'profile_adhd_desc',
                'apply' => ['readingMask' => true, 'focusMode' => true, 'pauseAnimations' => true],
            ],
            [
                'id' => 'senior', 'icon' => 'user', 'tone' => 'green',
                'labelkey' => 'profile_senior', 'desckey' => 'profile_senior_desc',
                'apply' => ['readableFont' => true, 'textSize' => 2, 'highlightButtons' => true, 'cursor' => 1, 'lineHeight' => 1],
            ],
            [
                'id' => 'epilepsy', 'icon' => 'alertTriangle', 'tone' => 'red',
                'labelkey' => 'profile_epilepsy', 'desckey' => 'profile_epilepsy_desc',
                'apply' => ['pauseAnimations' => true, 'saturation' => 2, 'contrast' => 1],
            ],
            [
                'id' => 'motor', 'icon' => 'hand', 'tone' => 'cyan',
                'labelkey' => 'profile_motor', 'desckey' => 'profile_motor_desc',
                'apply' => ['cursor' => 1, 'highlightButtons' => true, 'tooltips' => true, 'focusMode' => false],
            ],
            [
                'id' => 'cognitive', 'icon' => 'brain', 'tone' => 'teal',
                'labelkey' => 'profile_cognitive', 'desckey' => 'profile_cognitive_desc',
                'apply' => ['focusMode' => true, 'pauseAnimations' => true, 'readableFont' => true, 'lineHeight' => 2, 'hideImages' => false],
            ],
            [
                'id' => 'night', 'icon' => 'moon', 'tone' => 'slate',
                'labelkey' => 'profile_night', 'desckey' => 'profile_night_desc',
                'apply' => ['contrast' => 1, 'saturation' => 2],
            ],
        ];
    }

}
