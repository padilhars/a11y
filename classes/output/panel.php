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
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
class panel implements renderable, templatable {
    /**
     * Category id => icon name. Static (no get_string() involved), unlike
     * the labels built in build_category() - kept as a class constant
     * instead of a local array rebuilt on every export_for_template() call.
     */
    private const CATEGORY_ICONS = [
        'typography' => 'typography',
        'color' => 'palette',
        'media' => 'media',
        'navigation' => 'navigation',
        'advanced' => 'tools',
    ];

    /**
     * Builds the full panel Mustache context: header/status text, profile
     * preset cards, and every enabled option grouped into its category.
     *
     * Quality/performance audit finding, fixed (audit/03-qualidade-desempenho.md
     * section 2.1): this method used to be 122 lines with cyclomatic
     * complexity 14/NPath 315 (limits: 100/10/200), building categories and
     * profile cards inline with two levels of nested loops. Split into
     * group_options_by_category()/build_categories()/build_category()/
     * build_profile_cards() below - each with its own single, low
     * complexity responsibility - so this method is now just orchestration:
     * call each piece, assemble the final template context.
     *
     * @param renderer_base $output The renderer requesting this export (unused - required by templatable).
     * @return array<string, mixed> Context for templates/panel.mustache.
     */
    public function export_for_template(renderer_base $output): array {
        $appearance = config::get_appearance();
        $settings = manager::get_current_user_settings();
        $activecount = manager::count_active($settings);

        $categories = $this->build_categories($settings);
        $profilecards = $appearance['showprofiles'] ? $this->build_profile_cards() : [];

        // The UN logo now themes via currentColor just like every other
        // icon (see pix/accessibility-un.svg), so the badge needs no
        // per-icon special-casing any more: same size, same background for
        // all 4 choices.
        $badgeicon = icons::fabicon_svg($appearance['fabicon'], 20);

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
            'keyboardhint' => get_string('keyboardhint', 'local_a11y'),
            'panelformatclass' => 'local-a11y-panel--' . $appearance['panelformat'],
            'positionclass' => 'local-a11y-panel--' . preg_replace('/[^a-z-]/', '', $appearance['fabposition']),
            'densityclass' => 'local-a11y-panel--density-' . $appearance['density'],
            'accent' => $appearance['accent'],
        ];
    }

    /**
     * Groups every enabled option definition by its 'cat' key, in the order
     * options::all() itself returns them (category display order is applied
     * separately, by build_categories() iterating options::category_order()).
     *
     * @return array<string, array<int, array<string, mixed>>> Category id => option definitions.
     */
    private function group_options_by_category(): array {
        $enabled = config::enabled_features();
        $bycategory = [];
        foreach (options::all() as $option) {
            if (!in_array($option['id'], $enabled, true)) {
                continue;
            }
            $bycategory[$option['cat']][] = $option;
        }
        return $bycategory;
    }

    /**
     * Builds every non-empty category's full Mustache context (label, icon,
     * open/closed state, and its option rows) in display order.
     *
     * @param array<string, bool|int> $settings Current, sanitized user settings.
     * @return array<int, array<string, mixed>> One entry per non-empty category, in display order.
     */
    private function build_categories(array $settings): array {
        $bycategory = $this->group_options_by_category();
        $categorylabels = [
            'typography' => get_string('cat_typography', 'local_a11y'),
            'color' => get_string('cat_color', 'local_a11y'),
            'media' => get_string('cat_media', 'local_a11y'),
            'navigation' => get_string('cat_navigation', 'local_a11y'),
            'advanced' => get_string('cat_advanced', 'local_a11y'),
        ];

        $categories = [];
        foreach (options::category_order() as $catid) {
            if (empty($bycategory[$catid])) {
                continue;
            }
            $categories[] = $this->build_category($catid, $categorylabels[$catid], $bycategory[$catid], $settings);
        }
        return $categories;
    }

    /**
     * Builds one category's Mustache context, including all of its option rows.
     *
     * @param string $catid Category id, e.g. "media".
     * @param string $label Already-resolved display label for this category.
     * @param array<int, array<string, mixed>> $options This category's enabled option definitions.
     * @param array<string, bool|int> $settings Current, sanitized user settings.
     * @return array<string, mixed> Context for one entry of templates/panel.mustache's "categories" loop.
     */
    private function build_category(string $catid, string $label, array $options, array $settings): array {
        $defaults = manager::get_default_settings();

        // D52: hideImages' switch must never render as "off" while
        // focusMode's level 3 ("Somente texto") is already hiding images
        // itself - computed once here (from the real current settings, not
        // just a client-side afterthought) so the *first* server-rendered
        // paint already gets this right, matching this plugin's usual
        // no-FOUC standard; amd/src/panel.js re-derives the same thing
        // client-side (main.js::isHideImagesForced()) for every render
        // after that.
        $hideimagesforced = (int) ($settings['focusMode'] ?? 0) === 3;

        $rows = [];
        $catactivecount = 0;
        foreach ($options as $option) {
            $forced = $option['id'] === 'hideImages' && $hideimagesforced;
            $row = $this->export_option($option, $settings[$option['id']], $defaults[$option['id']], $forced);
            if ($row['isactive']) {
                $catactivecount++;
            }
            $rows[] = $row;
        }

        $defaultopen = options::category_default_open();
        return [
            'id' => $catid,
            'label' => $label,
            'iconsvg' => icons::svg(self::CATEGORY_ICONS[$catid], 15),
            'isopen' => !empty($defaultopen[$catid]) || $catactivecount > 0,
            'options' => $rows,
            'activecount' => $catactivecount,
            'hasactivecount' => $catactivecount > 0,
        ];
    }

    /**
     * Builds every profile preset card's Mustache context. Caller
     * (export_for_template()) only calls this when appearance['showprofiles']
     * is on, so this method itself doesn't need to check that.
     *
     * @return array<int, array<string, mixed>> One entry per profile, in profiles::all()'s order.
     */
    private function build_profile_cards(): array {
        $profilecards = [];
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
        return $profilecards;
    }

    /**
     * Builds one option row's Mustache context (templates/option_toggle.mustache
     * or templates/option_stepper.mustache, chosen client-side via istoggle/isstepper).
     *
     * Quality/performance audit finding, fixed (audit/03-qualidade-desempenho.md
     * section 2.1): cyclomatic complexity 12 (limit 10), mostly from the
     * stepper-only branch (a for loop plus its own ternary) living inline.
     * Moved to export_stepper_fields() below, called only when relevant.
     *
     * @param array<string, mixed> $option Option definition, from options::all().
     * @param bool|int $value Current value for this option (already sanitized).
     * @param bool|int $defaultvalue This option's default value, used to compute isactive.
     * @param bool $forced (D52) True if another option is forcing this one's visible
     *     effect on regardless of its own value - see build_category()'s
     *     $hideimagesforced. Toggle-only; never true for a stepper row.
     * @return array<string, mixed> Row context, keyed by the option's id.
     */
    private function export_option(array $option, $value, $defaultvalue, bool $forced = false): array {
        $istoggle = $option['kind'] === 'toggle';
        $isactive = $forced || $value !== $defaultvalue;
        $hashelp = !empty($option['hashelp']);

        $row = [
            'id' => $option['id'],
            'datakey' => $option['id'],
            'iconsvg' => icons::svg($option['icon'], 16),
            'label' => get_string($option['labelkey'], 'local_a11y'),
            'desc' => $option['desckey'] ? get_string($option['desckey'], 'local_a11y') : null,
            'istoggle' => $istoggle,
            'isstepper' => !$istoggle,
            'isactive' => $isactive,
            'pressed' => $istoggle && ($forced || $value) ? 'true' : 'false',
            'forced' => $forced,
            'forcednote' => $this->forced_note_for($option['id']),
            'unsupportednote' => $this->unsupported_note_for($option['id']),
            'hashelp' => $hashelp,
            'helplabel' => $hashelp ? get_string('helpbtn', 'local_a11y') : null,
            'helphtml' => $hashelp ? $this->build_help_html($option['id']) : null,
        ];

        if (!$istoggle) {
            $row += $this->export_stepper_fields($option, $value);
        }

        return $row;
    }

    /**
     * The one option-specific "forced" note today (hideImages, forced on by
     * Focus Mode level 3 - see build_category()). A second option needing
     * this would add its own id => stringkey pair here, not a new parameter.
     *
     * @param string $optionid Option id.
     * @return string|null The note text, or null if this option has none.
     */
    private function forced_note_for(string $optionid): ?string {
        return $optionid === 'hideImages' ? get_string('hideimages_forcednote', 'local_a11y') : null;
    }

    /**
     * D90: the note shown when a browser-API-dependent option's switch gets
     * disabled by client-side feature detection (amd/src/panel.js::renderOption(),
     * amd/src/main.js). Always rendered (hidden by default) for options that
     * CAN be unsupported, so the DOM element exists for the client to reveal -
     * unlike forced_note_for(), whether it is actually shown is never known
     * server-side (it depends on the visiting browser's own APIs, not on
     * anything in $settings).
     *
     * @param string $optionid Option id.
     * @return string|null The note text, or null if this option can never be unsupported.
     */
    private function unsupported_note_for(string $optionid): ?string {
        return $optionid === 'voiceCommands' ? get_string('vc_unsupportednote', 'local_a11y') : null;
    }

    /**
     * The extra Mustache context fields a stepper row needs on top of what
     * export_option() already builds for every option (toggle or stepper).
     *
     * @param array<string, mixed> $option Option definition; must be kind => 'stepper'.
     * @param int $value Current level for this option (already sanitized/clamped).
     * @return array<string, mixed> Fields to merge onto export_option()'s row.
     */
    private function export_stepper_fields(array $option, $value): array {
        $levels = [];
        for ($i = 0; $i <= $option['max']; $i++) {
            $levels[] = ['index' => $i, 'active' => $i === (int) $value];
        }
        return [
            'max' => $option['max'],
            'levelprefix' => $option['levelprefix'],
            'currentlabel' => get_string($option['levelprefix'] . (int) $value, 'local_a11y'),
            'levels' => $levels,
            'currentvalue' => (int) $value,
        ];
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
            // D75: moved from an always-visible desckey to a help block -
            // the warning was too long to sit as a one-line description.
            'hideImages' => ['prefix' => 'help_hi_', 'count' => 2, 'tag' => 'ul'],
            'voiceCommands' => ['prefix' => 'help_vc_', 'count' => 14, 'tag' => 'ul'],
            'faceNavigation' => ['prefix' => 'help_fn_', 'count' => 5, 'tag' => 'ol'],
            'screenReader' => ['prefix' => 'help_sr_', 'count' => 4, 'tag' => 'ol'],
            'virtualKeyboard' => ['prefix' => 'help_vk_', 'count' => 4, 'tag' => 'ol'],
            'readingGuide' => ['prefix' => 'help_rg_', 'count' => 3, 'tag' => 'ul'],
            'readingMask' => ['prefix' => 'help_rm_', 'count' => 3, 'tag' => 'ul'],
            'silenceMedia' => ['prefix' => 'help_sm_', 'count' => 5, 'tag' => 'ul'],
            'tooltips' => ['prefix' => 'help_tt_', 'count' => 4, 'tag' => 'ul'],
            'magnifier' => ['prefix' => 'help_mag_', 'count' => 5, 'tag' => 'ul'],
            'pauseAnimations' => ['prefix' => 'help_pa_', 'count' => 4, 'tag' => 'ul'],
            'bionicReading' => ['prefix' => 'help_br_', 'count' => 4, 'tag' => 'ul'],
            'signLanguage' => ['prefix' => 'help_sl_', 'count' => 4, 'tag' => 'ul'],
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
