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
use local_a11y\options;
use local_a11y\profiles;
use local_a11y\tone_colors;
use renderable;
use templatable;
use renderer_base;

/**
 * The accessibility panel (profiles grid + collapsible option categories).
 *
 * Rendered once per page in its default (all-off) state; amd/src/panel.js
 * re-applies the user's actual saved settings on load (M3) without a second
 * server round-trip, so this export only needs to produce structurally
 * correct, accessible markup.
 *
 * @description The accessibility panel (profiles grid + collapsible option categories).
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */
class panel implements renderable, templatable {
    /**
     * Builds the full panel Mustache context: header/status text, profile
     * preset cards, and every enabled option grouped into its category.
     *
     * @param renderer_base $output The renderer requesting this export (unused - required by templatable).
     * @return array<string, mixed> Context for templates/panel.mustache.
     */
    public function export_for_template(renderer_base $output): array {
        $appearance = config::get_appearance();
        $enabled = config::enabled_features();
        $defaults = manager::get_default_settings();
        $settings = manager::get_current_user_settings();
        $activecount = manager::count_active($settings);

        $categorylabels = [
            'typography' => get_string('cat_typography', 'local_a11y'),
            'color' => get_string('cat_color', 'local_a11y'),
            'media' => get_string('cat_media', 'local_a11y'),
            'navigation' => get_string('cat_navigation', 'local_a11y'),
            'advanced' => get_string('cat_advanced', 'local_a11y'),
        ];
        $categoryicons = [
            'typography' => 'typography',
            'color' => 'palette',
            'media' => 'media',
            'navigation' => 'navigation',
            'advanced' => 'tools',
        ];
        $defaultopen = options::category_default_open();
        // The UN logo now themes via currentColor just like every other
        // icon (see pix/accessibility-un.svg), so the badge needs no
        // per-icon special-casing any more: same size, same background for
        // all 4 choices.
        $badgeicon = icons::fabicon_svg($appearance['fabicon'], 20);

        $bycategory = [];
        foreach (options::all() as $option) {
            if (!in_array($option['id'], $enabled, true)) {
                continue;
            }
            $bycategory[$option['cat']][] = $option;
        }

        // D52: hideImages' switch must never render as "off" while
        // focusMode's level 3 ("Somente texto") is already hiding images
        // itself - computed once here (from the real current settings, not
        // just a client-side afterthought) so the *first* server-rendered
        // paint already gets this right, matching this plugin's usual
        // no-FOUC standard; amd/src/panel.js re-derives the same thing
        // client-side (main.js::isHideImagesForced()) for every render
        // after that.
        $hideimagesforced = (int) ($settings['focusMode'] ?? 0) === 3;

        $categories = [];
        foreach (options::category_order() as $catid) {
            if (empty($bycategory[$catid])) {
                continue;
            }
            $rows = [];
            $catactivecount = 0;
            foreach ($bycategory[$catid] as $option) {
                $forced = $option['id'] === 'hideImages' && $hideimagesforced;
                $row = $this->export_option($option, $settings[$option['id']], $defaults[$option['id']], $forced);
                if ($row['isactive']) {
                    $catactivecount++;
                }
                $rows[] = $row;
            }
            $categories[] = [
                'id' => $catid,
                'label' => $categorylabels[$catid],
                'iconsvg' => icons::svg($categoryicons[$catid], 15),
                'isopen' => !empty($defaultopen[$catid]) || $catactivecount > 0,
                'options' => $rows,
                'activecount' => $catactivecount,
                'hasactivecount' => $catactivecount > 0,
            ];
        }

        $profilecards = [];
        if ($appearance['showprofiles']) {
            foreach (profiles::all() as $profile) {
                $tone = tone_colors::get($profile['tone']);
                $profilecards[] = [
                    'id' => $profile['id'],
                    'tone' => $profile['tone'],
                    'label' => get_string($profile['labelkey'], 'local_a11y'),
                    'desc' => get_string($profile['desckey'], 'local_a11y'),
                    'iconsvg' => icons::svg($profile['icon'], 17),
                    'bg' => $tone['bg'],
                    'text' => $tone['text'],
                    'iconcolor' => $tone['icon'],
                    'border' => $tone['border'],
                ];
            }
        }

        return [
            'paneltitle' => get_string('paneltitle', 'local_a11y'),
            'panelsubtitle' => get_string('panelsubtitle', 'local_a11y'),
            'noneactive' => get_string('noneactive', 'local_a11y'),
            'statustext' => $activecount > 0
                ? get_string($activecount === 1 ? 'activecountone' : 'activecount', 'local_a11y', $activecount)
                : get_string('noneactive', 'local_a11y'),
            'hasactive' => $activecount > 0,
            'activecount' => $activecount,
            'resetlabel' => get_string('reset', 'local_a11y'),
            'closelabel' => get_string('close', 'local_a11y'),
            'closeiconsvg' => icons::svg('close', 16),
            'refreshiconsvg' => icons::svg('refresh', 13),
            'accessibilityiconsvg' => $badgeicon['svg'],
            'searchplaceholder' => get_string('search', 'local_a11y'),
            'searchiconsvg' => icons::svg('search', 15),
            'searchclearlabel' => get_string('searchclear', 'local_a11y'),
            'showprofiles' => $appearance['showprofiles'] && !empty($profilecards),
            'profilestitle' => get_string('profilestitle', 'local_a11y'),
            'profilessubtitle' => get_string('profilessubtitle', 'local_a11y'),
            'sparklesiconsvg' => icons::svg('sparkles', 15),
            'checkiconsvg' => icons::svg('check', 9, 3),
            'profiles' => $profilecards,
            'categories' => $categories,
            'savetitle' => config::footer_text(),
            'panelformatclass' => 'local-a11y-panel--' . $appearance['panelformat'],
            'positionclass' => 'local-a11y-panel--' . preg_replace('/[^a-z-]/', '', $appearance['fabposition']),
            'densityclass' => 'local-a11y-panel--density-' . $appearance['density'],
            'accent' => $appearance['accent'],
        ];
    }

    /**
     * Builds one option row's Mustache context (templates/option_toggle.mustache
     * or templates/option_stepper.mustache, chosen client-side via istoggle/isstepper).
     *
     * @param array<string, mixed> $option Option definition, from options::all().
     * @param bool|int $value Current value for this option (already sanitized).
     * @param bool|int $defaultvalue This option's default value, used to compute isactive.
     * @param bool $forced (D52) True if another option is forcing this one's visible
     *     effect on regardless of its own value - see export_for_template()'s
     *     $hideimagesforced. Toggle-only; never true for a stepper row.
     * @return array<string, mixed> Row context, keyed by the option's id.
     */
    private function export_option(array $option, $value, $defaultvalue, bool $forced = false): array {
        $isactive = $forced || $value !== $defaultvalue;
        $hashelp  = !empty($option['hashelp']);
        $forcednotekey = $option['id'] === 'hideImages' ? 'hideimages_forcednote' : null;
        $row = [
            'id' => $option['id'],
            'datakey' => $option['id'],
            'iconsvg' => icons::svg($option['icon'], 16),
            'label' => get_string($option['labelkey'], 'local_a11y'),
            'desc' => $option['desckey'] ? get_string($option['desckey'], 'local_a11y') : null,
            'istoggle' => $option['kind'] === 'toggle',
            'isstepper' => $option['kind'] === 'stepper',
            'isactive' => $isactive,
            'pressed' => $option['kind'] === 'toggle' && ($forced || $value) ? 'true' : 'false',
            'forced' => $forced,
            'forcednote' => $forcednotekey ? get_string($forcednotekey, 'local_a11y') : null,
            'hashelp' => $hashelp,
            'helplabel' => $hashelp ? get_string('helpbtn', 'local_a11y') : null,
            'helphtml' => $hashelp ? $this->build_help_html($option['id']) : null,
        ];

        if ($option['kind'] === 'stepper') {
            $levels = [];
            for ($i = 0; $i <= $option['max']; $i++) {
                $levels[] = ['index' => $i, 'active' => $i === (int) $value];
            }
            $row['max'] = $option['max'];
            $row['levelprefix'] = $option['levelprefix'];
            $row['currentlabel'] = get_string($option['levelprefix'] . (int) $value, 'local_a11y');
            $row['levels'] = $levels;
            $row['currentvalue'] = (int) $value;
        }

        return $row;
    }

    /**
     * Build the help block HTML for options that declare hashelp. Content is
     * composed from lang strings (one '<prefix>intro' string plus a
     * '<prefix>N' string per list item) so it stays translatable; 'ol' is
     * used for options that describe a sequence of steps to follow,
     * 'ul' for options that just describe what happens/what the levels mean.
     *
     * @param string $optionid Option id; any id not in $specs produces no content.
     * @return string Safe HTML, or '' for any option id without a help spec.
     */
    private function build_help_html(string $optionid): string {
        $specs = [
            'voiceCommands' => ['prefix' => 'help_vc_', 'count' => 12, 'tag' => 'ul'],
            'faceNavigation' => ['prefix' => 'help_fn_', 'count' => 5, 'tag' => 'ol'],
            'screenReader' => ['prefix' => 'help_sr_', 'count' => 4, 'tag' => 'ol'],
            'virtualKeyboard' => ['prefix' => 'help_vk_', 'count' => 4, 'tag' => 'ol'],
            'readingGuide' => ['prefix' => 'help_rg_', 'count' => 3, 'tag' => 'ul'],
            'readingMask' => ['prefix' => 'help_rm_', 'count' => 3, 'tag' => 'ul'],
            'silenceMedia' => ['prefix' => 'help_sm_', 'count' => 5, 'tag' => 'ul'],
            'magnifier' => ['prefix' => 'help_mag_', 'count' => 4, 'tag' => 'ul'],
            'pauseAnimations' => ['prefix' => 'help_pa_', 'count' => 4, 'tag' => 'ul'],
        ];
        if (!isset($specs[$optionid])) {
            return '';
        }

        $spec = $specs[$optionid];
        $intro = get_string($spec['prefix'] . 'intro', 'local_a11y');
        $items = [];
        for ($i = 1; $i <= $spec['count']; $i++) {
            $items[] = '<li>' . get_string($spec['prefix'] . $i, 'local_a11y') . '</li>';
        }
        $tag = $spec['tag'];
        return '<p class="local-a11y-help-intro">' . $intro . '</p>'
            . '<' . $tag . ' class="local-a11y-help-list">' . implode('', $items) . '</' . $tag . '>';
    }
}
