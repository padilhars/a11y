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

/**
 * Admin settings for local_a11y.
 *
 * Organised in 4 sections, in the order an admin is likely to want to
 * configure them: Geral (whether/where the plugin runs at all, and which
 * of the 24 options users get), Botão Flutuante (FAB) (the entry point),
 * Painel (the settings surface itself), Cores (every colour the plugin
 * lets an admin customise, grouped together instead of split across a
 * generic "Appearance" section). Every setting has a real description -
 * none are left blank.
 *
 * @description Admin settings for local_a11y.
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_a11y', new lang_string('pluginname', 'local_a11y'));
    $ADMIN->add('localplugins', $settings);

    // ── Geral ────────────────────────────────────────────────────────────
    // Whether/where the plugin runs, and which of the 24 options are
    // available to users at all (independent of any one user's own choices).
    $settings->add(new admin_setting_heading(
        'local_a11y/general',
        new lang_string('settings_general', 'local_a11y'),
        ''
    ));

    $settings->add(new admin_setting_configcheckbox(
        'local_a11y/enabled',
        new lang_string('settings_enabled', 'local_a11y'),
        new lang_string('settings_enabled_desc', 'local_a11y'),
        1
    ));

    $settings->add(new admin_setting_configcheckbox(
        'local_a11y/showforguests',
        new lang_string('settings_showforguests', 'local_a11y'),
        new lang_string('settings_showforguests_desc', 'local_a11y'),
        1
    ));

    $settings->add(new admin_setting_configtextarea(
        'local_a11y/excludedpages',
        new lang_string('settings_excludedpages', 'local_a11y'),
        new lang_string('settings_excludedpages_desc', 'local_a11y'),
        ''
    ));

    $featurechoices = [];
    foreach (\local_a11y\options::all() as $option) {
        $featurechoices[$option['id']] = new lang_string($option['labelkey'], 'local_a11y');
    }
    $settings->add(new admin_setting_configmulticheckbox(
        'local_a11y/enabledfeatures',
        new lang_string('settings_enabledfeatures', 'local_a11y'),
        new lang_string('settings_enabledfeatures_desc', 'local_a11y'),
        array_fill_keys(array_keys($featurechoices), 1),
        $featurechoices
    ));

    // ── Botão Flutuante (FAB) ───────────────────────────────────────────
    // The entry point rendered on every page: where it sits, what it
    // looks like.
    $settings->add(new admin_setting_heading(
        'local_a11y/fabheading',
        new lang_string('settings_fab', 'local_a11y'),
        ''
    ));

    $settings->add(new admin_setting_configselect(
        'local_a11y/fabposition',
        new lang_string('settings_fabposition', 'local_a11y'),
        new lang_string('settings_fabposition_desc', 'local_a11y'),
        'bottom-right',
        [
            'bottom-right' => new lang_string('position_bottomright', 'local_a11y'),
            'bottom-left' => new lang_string('position_bottomleft', 'local_a11y'),
            'middle-right' => new lang_string('position_middleright', 'local_a11y'),
            'middle-left' => new lang_string('position_middleleft', 'local_a11y'),
        ]
    ));

    $settings->add(new admin_setting_configselect(
        'local_a11y/fabicon',
        new lang_string('settings_fabicon', 'local_a11y'),
        new lang_string('settings_fabicon_desc', 'local_a11y'),
        'un',
        [
            'un' => new lang_string('icon_un', 'local_a11y'),
            'accessibility' => new lang_string('icon_accessibility', 'local_a11y'),
            'sparkles' => new lang_string('icon_sparkles', 'local_a11y'),
            'user' => new lang_string('icon_user', 'local_a11y'),
        ]
    ));

    $settings->add(new admin_setting_configselect(
        'local_a11y/fabshape',
        new lang_string('settings_fabshape', 'local_a11y'),
        new lang_string('settings_fabshape_desc', 'local_a11y'),
        'circle',
        [
            'circle' => new lang_string('shape_circle', 'local_a11y'),
            'square' => new lang_string('shape_square', 'local_a11y'),
        ]
    ));

    // ── Painel ───────────────────────────────────────────────────────────
    // The settings surface itself: how it's presented and what it contains
    // beyond the option list.
    $settings->add(new admin_setting_heading(
        'local_a11y/panelheading',
        new lang_string('settings_panel', 'local_a11y'),
        ''
    ));

    $settings->add(new admin_setting_configselect(
        'local_a11y/panelformat',
        new lang_string('settings_panelformat', 'local_a11y'),
        new lang_string('settings_panelformat_desc', 'local_a11y'),
        'popover',
        [
            'popover' => new lang_string('format_popover', 'local_a11y'),
            'drawer' => new lang_string('format_drawer', 'local_a11y'),
            'modal' => new lang_string('format_modal', 'local_a11y'),
        ]
    ));

    $settings->add(new admin_setting_configselect(
        'local_a11y/density',
        new lang_string('settings_density', 'local_a11y'),
        new lang_string('settings_density_desc', 'local_a11y'),
        'regular',
        [
            'compact' => new lang_string('density_compact', 'local_a11y'),
            'regular' => new lang_string('density_regular', 'local_a11y'),
            'comfortable' => new lang_string('density_comfortable', 'local_a11y'),
        ]
    ));

    $settings->add(new admin_setting_configcheckbox(
        'local_a11y/showprofiles',
        new lang_string('settings_showprofiles', 'local_a11y'),
        new lang_string('settings_showprofiles_desc', 'local_a11y'),
        1
    ));

    $settings->add(new admin_setting_confightmleditor(
        'local_a11y/footertext',
        new lang_string('settings_footertext', 'local_a11y'),
        new lang_string('settings_footertext_desc', 'local_a11y'),
        '',
        PARAM_RAW
    ));

    // ── Cores ────────────────────────────────────────────────────────────
    // Every colour the plugin lets an admin customise, grouped in one
    // place: the FAB/panel's own accent, plus the 4 page-effect colours
    // used by "Destacar Títulos", "Destacar Links", "Destacar Botões" and
    // "Guia de Leitura" (each independent, so an admin can match their
    // own branding for each effect instead of one colour doing double
    // duty everywhere).
    $settings->add(new admin_setting_heading(
        'local_a11y/colorsheading',
        new lang_string('settings_colors', 'local_a11y'),
        ''
    ));

    $settings->add(new admin_setting_configcolourpicker(
        'local_a11y/accent',
        new lang_string('settings_accent', 'local_a11y'),
        new lang_string('settings_accent_desc', 'local_a11y'),
        '#3b82f6'
    ));

    $settings->add(new admin_setting_configcolourpicker(
        'local_a11y/highlighttitlescolor',
        new lang_string('settings_highlighttitlescolor', 'local_a11y'),
        new lang_string('settings_highlighttitlescolor_desc', 'local_a11y'),
        '#eab308'
    ));

    $settings->add(new admin_setting_configcolourpicker(
        'local_a11y/highlightlinkscolor',
        new lang_string('settings_highlightlinkscolor', 'local_a11y'),
        new lang_string('settings_highlightlinkscolor_desc', 'local_a11y'),
        '#3b82f6'
    ));

    $settings->add(new admin_setting_configcolourpicker(
        'local_a11y/highlightbuttonscolor',
        new lang_string('settings_highlightbuttonscolor', 'local_a11y'),
        new lang_string('settings_highlightbuttonscolor_desc', 'local_a11y'),
        '#f97316'
    ));

    $settings->add(new admin_setting_configcolourpicker(
        'local_a11y/readingguidecolor',
        new lang_string('settings_readingguidecolor', 'local_a11y'),
        new lang_string('settings_readingguidecolor_desc', 'local_a11y'),
        '#3b82f6'
    ));

    // ── Estatísticas ─────────────────────────────────────────────────────
    // Contadores de uso agregados e anônimos (D47) - desligado por padrão;
    // o admin precisa optar explicitamente. Ver classes/stats.php e
    // admin/stats.php (relatório, protegido por local/a11y:viewstats).
    $settings->add(new admin_setting_heading(
        'local_a11y/statsheading',
        new lang_string('settings_stats', 'local_a11y'),
        ''
    ));

    $settings->add(new admin_setting_configcheckbox(
        'local_a11y/collectstats',
        new lang_string('settings_collectstats', 'local_a11y'),
        new lang_string('settings_collectstats_desc', 'local_a11y'),
        0
    ));

    $ADMIN->add('localplugins', new admin_externalpage(
        'local_a11y_stats',
        new lang_string('statstitle', 'local_a11y'),
        new moodle_url('/local/a11y/admin/stats.php'),
        'local/a11y:viewstats'
    ));
}
