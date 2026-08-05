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
 * Split into 4 separate pages under one admin_category (local_a11y),
 * instead of one long admin_settingpage - Moodle has no built-in in-page
 * tab widget for admin_settingpage (confirmed: admin/settings.php's
 * renderer never uses tabtree/tabobject), so this is the native way to
 * avoid a single very long settings page: each becomes its own item in
 * the Site Administration tree (same pattern core uses for e.g. logging -
 * see admin/tool/log/settings.php). The category node itself is named
 * 'local_a11y' (matching the component, as is conventional); each page
 * underneath has its own distinct name (local_a11y_general/_fab/_panel/
 * _colors) since every part_of_admin_tree node needs a globally unique
 * name and a page can't share the category's own name.
 *
 * @description Admin settings for local_a11y.
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $ADMIN->add('localplugins', new admin_category(
        'local_a11y',
        new lang_string('pluginname', 'local_a11y')
    ));

    // ── Geral ────────────────────────────────────────────────────────────
    // Whether/where the plugin runs, and which of the 24 options are
    // available to users at all (independent of any one user's own choices).
    $generalsettings = new admin_settingpage(
        'local_a11y_general',
        new lang_string('settings_general', 'local_a11y')
    );

    $generalsettings->add(new admin_setting_configcheckbox(
        'local_a11y/enabled',
        new lang_string('settings_enabled', 'local_a11y'),
        new lang_string('settings_enabled_desc', 'local_a11y'),
        1
    ));

    $generalsettings->add(new admin_setting_configcheckbox(
        'local_a11y/showforguests',
        new lang_string('settings_showforguests', 'local_a11y'),
        new lang_string('settings_showforguests_desc', 'local_a11y'),
        1
    ));

    $generalsettings->add(new admin_setting_configtextarea(
        'local_a11y/excludedpages',
        new lang_string('settings_excludedpages', 'local_a11y'),
        new lang_string('settings_excludedpages_desc', 'local_a11y'),
        ''
    ));

    $featurechoices = [];
    foreach (\local_a11y\options::all() as $option) {
        $featurechoices[$option['id']] = new lang_string($option['labelkey'], 'local_a11y');
    }
    $generalsettings->add(new admin_setting_configmulticheckbox(
        'local_a11y/enabledfeatures',
        new lang_string('settings_enabledfeatures', 'local_a11y'),
        new lang_string('settings_enabledfeatures_desc', 'local_a11y'),
        array_fill_keys(array_keys($featurechoices), 1),
        $featurechoices
    ));

    $ADMIN->add('local_a11y', $generalsettings);

    // ── Botão Flutuante (FAB) ───────────────────────────────────────────
    // The entry point rendered on every page: where it sits, what it
    // looks like.
    $fabsettings = new admin_settingpage(
        'local_a11y_fab',
        new lang_string('settings_fab', 'local_a11y')
    );

    $fabsettings->add(new admin_setting_configselect(
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

    $fabsettings->add(new admin_setting_configselect(
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

    $fabsettings->add(new admin_setting_configselect(
        'local_a11y/fabshape',
        new lang_string('settings_fabshape', 'local_a11y'),
        new lang_string('settings_fabshape_desc', 'local_a11y'),
        'circle',
        [
            'circle' => new lang_string('shape_circle', 'local_a11y'),
            'square' => new lang_string('shape_square', 'local_a11y'),
        ]
    ));

    $ADMIN->add('local_a11y', $fabsettings);

    // ── Painel ───────────────────────────────────────────────────────────
    // The settings surface itself: how it's presented and what it contains
    // beyond the option list.
    $panelsettings = new admin_settingpage(
        'local_a11y_panel',
        new lang_string('settings_panel', 'local_a11y')
    );

    $panelsettings->add(new admin_setting_configselect(
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

    $panelsettings->add(new admin_setting_configselect(
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

    $panelsettings->add(new admin_setting_configcheckbox(
        'local_a11y/showprofiles',
        new lang_string('settings_showprofiles', 'local_a11y'),
        new lang_string('settings_showprofiles_desc', 'local_a11y'),
        1
    ));

    $panelsettings->add(new admin_setting_confightmleditor(
        'local_a11y/footertext',
        new lang_string('settings_footertext', 'local_a11y'),
        new lang_string('settings_footertext_desc', 'local_a11y'),
        '',
        PARAM_RAW
    ));

    $ADMIN->add('local_a11y', $panelsettings);

    // ── Cores ────────────────────────────────────────────────────────────
    // Every colour the plugin lets an admin customise, grouped in one
    // place: the FAB/panel's own accent, plus the 4 page-effect colours
    // used by "Destacar Títulos", "Destacar Links", "Destacar Botões" and
    // "Guia de Leitura" (each independent, so an admin can match their
    // own branding for each effect instead of one colour doing double
    // duty everywhere).
    $colorsettings = new admin_settingpage(
        'local_a11y_colors',
        new lang_string('settings_colors', 'local_a11y')
    );

    $colorsettings->add(new admin_setting_configcolourpicker(
        'local_a11y/accent',
        new lang_string('settings_accent', 'local_a11y'),
        new lang_string('settings_accent_desc', 'local_a11y'),
        '#3b82f6'
    ));

    $colorsettings->add(new admin_setting_configcolourpicker(
        'local_a11y/highlighttitlescolor',
        new lang_string('settings_highlighttitlescolor', 'local_a11y'),
        new lang_string('settings_highlighttitlescolor_desc', 'local_a11y'),
        '#eab308'
    ));

    $colorsettings->add(new admin_setting_configcolourpicker(
        'local_a11y/highlightlinkscolor',
        new lang_string('settings_highlightlinkscolor', 'local_a11y'),
        new lang_string('settings_highlightlinkscolor_desc', 'local_a11y'),
        '#3b82f6'
    ));

    $colorsettings->add(new admin_setting_configcolourpicker(
        'local_a11y/highlightbuttonscolor',
        new lang_string('settings_highlightbuttonscolor', 'local_a11y'),
        new lang_string('settings_highlightbuttonscolor_desc', 'local_a11y'),
        '#f97316'
    ));

    $colorsettings->add(new admin_setting_configcolourpicker(
        'local_a11y/readingguidecolor',
        new lang_string('settings_readingguidecolor', 'local_a11y'),
        new lang_string('settings_readingguidecolor_desc', 'local_a11y'),
        '#3b82f6'
    ));

    $ADMIN->add('local_a11y', $colorsettings);
}
