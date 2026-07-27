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
 * The prototype's "Tweaks" panel (_design-reference/app.jsx,
 * _design-reference/tweaks-panel.jsx) is a design-tool-only harness, not
 * part of the product - see DECISIONS.md D4. The *values* it edits become
 * site-wide admin settings here instead (brief section 5.4): FAB
 * position/icon/shape, panel format/density, accent colour, whether to
 * show profiles, plus the plugin-wide enable switch, guest visibility,
 * per-option enable list and excluded-page patterns.
 *
 * @package    local_a11y
 * @copyright  2026 A11y for Moodle project
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_a11y', new lang_string('pluginname', 'local_a11y'));
    $ADMIN->add('localplugins', $settings);

    // -- General --------------------------------------------------------
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

    // -- FAB --------------------------------------------------------------
    $settings->add(new admin_setting_heading(
        'local_a11y/fabheading',
        new lang_string('settings_fab', 'local_a11y'),
        ''
    ));

    $settings->add(new admin_setting_configselect(
        'local_a11y/fabposition',
        new lang_string('settings_fabposition', 'local_a11y'),
        '',
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
        '',
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
        '',
        'circle',
        [
            'circle' => new lang_string('shape_circle', 'local_a11y'),
            'square' => new lang_string('shape_square', 'local_a11y'),
        ]
    ));

    // -- Panel ------------------------------------------------------------
    $settings->add(new admin_setting_heading(
        'local_a11y/panelheading',
        new lang_string('settings_panel', 'local_a11y'),
        ''
    ));

    $settings->add(new admin_setting_configselect(
        'local_a11y/panelformat',
        new lang_string('settings_panelformat', 'local_a11y'),
        '',
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
        '',
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

    // -- Appearance ---------------------------------------------------------
    $settings->add(new admin_setting_heading(
        'local_a11y/appearanceheading',
        new lang_string('settings_appearance', 'local_a11y'),
        ''
    ));

    $settings->add(new admin_setting_configcolourpicker(
        'local_a11y/accent',
        new lang_string('settings_accent', 'local_a11y'),
        '',
        '#3b82f6'
    ));
}
