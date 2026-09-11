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
 * Library callbacks for local_a11y.
 *
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */

/**
 * Registers the local_a11y_settings user preference so it can be read/written
 * through the core_user preferences REST route (core_user/repository AMD
 * module). This is the replacement for the removed
 * user_preference_allow_ajax_update() whitelist - see DECISIONS.md.
 *
 * @return array<string, array<string, mixed>> Preference definitions keyed by preference name.
 */
function local_a11y_user_preferences() {
    return [
        \local_a11y\manager::PREFERENCE_NAME => [
            'null' => NULL_ALLOWED,
            'default' => null,
            'type' => PARAM_RAW,
        ],
    ];
}

/**
 * admin_setting_configcolourpicker::set_updatedcallback() targets for each
 * of the 5 admin-customisable colours (settings.php) - see
 * \local_a11y\config::warn_if_low_contrast() for what each of these does
 * and why (AUDIT-V2 finding WCAG-002). One small named function per colour
 * rather than a single generic one parsing get_full_name(): Moodle's
 * updatedcallback receives 's_local_a11y_<name>', not the plain config key,
 * and re-deriving the key from that string is more fragile than just
 * naming the key explicitly here, once, next to its own setting.
 */

/**
 * Warns the admin if 'accent' has insufficient contrast against white.
 *
 * @return void
 */
function local_a11y_check_accent_contrast() {
    \local_a11y\config::warn_if_low_contrast('accent', get_string('settings_accent', 'local_a11y'));
}

/**
 * Warns the admin if 'highlighttitlescolor' has insufficient contrast against white.
 *
 * @return void
 */
function local_a11y_check_highlighttitlescolor_contrast() {
    \local_a11y\config::warn_if_low_contrast('highlighttitlescolor', get_string('settings_highlighttitlescolor', 'local_a11y'));
}

/**
 * Warns the admin if 'highlightlinkscolor' has insufficient contrast against white.
 *
 * @return void
 */
function local_a11y_check_highlightlinkscolor_contrast() {
    \local_a11y\config::warn_if_low_contrast('highlightlinkscolor', get_string('settings_highlightlinkscolor', 'local_a11y'));
}

/**
 * Warns the admin if 'highlightbuttonscolor' has insufficient contrast against white.
 *
 * @return void
 */
function local_a11y_check_highlightbuttonscolor_contrast() {
    \local_a11y\config::warn_if_low_contrast('highlightbuttonscolor', get_string('settings_highlightbuttonscolor', 'local_a11y'));
}

/**
 * Warns the admin if 'readingguidecolor' has insufficient contrast against white.
 *
 * @return void
 */
function local_a11y_check_readingguidecolor_contrast() {
    \local_a11y\config::warn_if_low_contrast('readingguidecolor', get_string('settings_readingguidecolor', 'local_a11y'));
}
