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

namespace local_a11y\output;

use local_a11y\config;
use local_a11y\icons;
use local_a11y\manager;
use renderable;
use templatable;
use renderer_base;

/**
 * The floating action button (FAB).
 *
 * @package    local_a11y
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class fab implements renderable, templatable {

    /**
     * @param renderer_base $output
     * @return array<string, mixed>
     */
    public function export_for_template(renderer_base $output): array {
        $appearance = config::get_appearance();

        $iconnames = [
            'un' => 'un',
            'accessibility' => 'accessibility',
            'sparkles' => 'sparkles',
            'user' => 'user',
        ];
        $iconname = $iconnames[$appearance['fabicon']] ?? 'un';
        $activecount = manager::count_active(manager::get_current_user_settings());

        // The UN accessibility logo is a fixed two-colour asset (see
        // icons::un_accessibility_svg()), not a themable currentColor stroke
        // icon like the rest of icons::PATHS, so it needs its own branch and
        // its own modifier class (styles.css gives it a white circular
        // backing for legibility against any configured accent colour).
        $isunicon = $iconname === 'un';

        return [
            'position' => $appearance['fabposition'],
            'positionclass' => 'local-a11y-fab--' . preg_replace('/[^a-z-]/', '', $appearance['fabposition']),
            'shapeclass' => $appearance['fabshape'] === 'square' ? 'local-a11y-fab--square' : 'local-a11y-fab--circle',
            'iconclass' => $isunicon ? 'local-a11y-fab__icon--un' : '',
            'iconsvg' => $isunicon ? icons::un_accessibility_svg(26) : icons::svg($iconname, 26, 2),
            'ariaopenlabel' => get_string('fabopen', 'local_a11y'),
            'accent' => $appearance['accent'],
            'activecount' => $activecount,
            'hasactive' => $activecount > 0,
        ];
    }
}
