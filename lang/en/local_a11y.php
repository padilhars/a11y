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
 * English strings for local_a11y (canonical language file).
 *
 * @description English strings for local_a11y (canonical language file).
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

defined('MOODLE_INTERNAL') || die();

$string['pluginname'] = 'Accessibility (A11y)';

// Capabilities.
$string['a11y:view'] = 'Use the accessibility panel';
$string['a11y:configure'] = 'Configure the accessibility plugin';

// Privacy.
$string['privacy:metadata:preference:local_a11y_settings'] = 'The accessibility options the user has chosen (text size, contrast, active profile, etc).';

// Panel chrome.
$string['panelname'] = 'Accessibility';
$string['fabopen'] = 'Open accessibility panel';
$string['fabclose'] = 'Close accessibility panel';
$string['paneltitle'] = 'Accessibility';
$string['panelsubtitle'] = 'Customize your experience';
$string['profilestitle'] = 'Accessibility Profiles';
$string['profilessubtitle'] = 'Enable optimized settings with one click';
$string['activecount'] = '{$a} options active';
$string['activecountone'] = '1 option active';
$string['noneactive'] = 'No options active';
$string['reset'] = 'Reset all';
$string['close'] = 'Close';
$string['search'] = 'Search option…';
$string['searchclear'] = 'Clear search';
$string['on'] = 'On';
$string['off'] = 'Off';
$string['savetitle'] = 'Made with ❤️ by <strong>CPTED</strong>, for you.';
$string['keyboardhint'] = 'Shortcut: Alt + A';

// Categories.
$string['cat_profiles'] = 'Profiles';
$string['cat_typography'] = 'Text & Typography';
$string['cat_color'] = 'Color & Contrast';
$string['cat_media'] = 'Media & Motion';
$string['cat_navigation'] = 'Focus & Navigation';
$string['cat_advanced'] = 'Advanced';

// Level labels (steppers).
$string['level_0'] = 'Default';
$string['level_1'] = 'Small';
$string['level_2'] = 'Medium';
$string['level_3'] = 'Large';
$string['level_4'] = 'Max';
$string['spacinglevel_0'] = 'Default';
$string['spacinglevel_1'] = 'Light';
$string['spacinglevel_2'] = 'Medium';
$string['spacinglevel_3'] = 'Wide';
$string['alignlevel_0'] = 'Default';
$string['alignlevel_1'] = 'Left';
$string['alignlevel_2'] = 'Center';
$string['alignlevel_3'] = 'Right';
$string['alignlevel_4'] = 'Justify';
$string['lineheightlevel_0'] = 'Default';
$string['lineheightlevel_1'] = '1.5×';
$string['lineheightlevel_2'] = '1.8×';
$string['lineheightlevel_3'] = '2.2×';
$string['cursorlevel_0'] = 'Default';
$string['cursorlevel_1'] = 'Big black';
$string['cursorlevel_2'] = 'Big white';
$string['contrastlevel_0'] = 'Default';
$string['contrastlevel_1'] = 'Dark';
$string['contrastlevel_2'] = 'Light';
$string['contrastlevel_3'] = 'High';
$string['colorchangelevel_0'] = 'Default';
$string['colorchangelevel_1'] = 'Protanopia';
$string['colorchangelevel_2'] = 'Deuteranopia';
$string['colorchangelevel_3'] = 'Tritanopia';
$string['saturationlevel_0'] = 'Normal';
$string['saturationlevel_1'] = 'High';
$string['saturationlevel_2'] = 'Low';
$string['saturationlevel_3'] = 'Mono';

// Options — labels.
$string['opt_readablefont'] = 'Readable Font';
$string['opt_readablefont_desc'] = 'Applies Atkinson Hyperlegible';
$string['opt_dyslexicfont'] = 'Dyslexia-Friendly Font';
$string['opt_dyslexicfont_desc'] = 'Lexend optimized font';
$string['opt_highlighttitles'] = 'Highlight Titles';
$string['opt_highlightlinks'] = 'Highlight Links';
$string['opt_highlightbuttons'] = 'Highlight Buttons';
$string['opt_textsize'] = 'Text Size';
$string['opt_lineheight'] = 'Line Height';
$string['opt_textspacing'] = 'Text Spacing';
$string['opt_textalign'] = 'Text Alignment';
$string['opt_contrast'] = 'Contrast';
$string['opt_invertcolors'] = 'Invert Colors';
$string['opt_colorchange'] = 'Color Adjustment';
$string['opt_colorchange_desc'] = 'Color-blindness filters';
$string['opt_saturation'] = 'Saturation';
$string['opt_hideimages'] = 'Hide Images';
$string['hideimages_placeholder'] = 'Image hidden';
$string['opt_pauseanimations'] = 'Pause Animations';
$string['opt_tooltips'] = 'Tooltips';
$string['opt_readingguide'] = 'Reading Guide';
$string['opt_readingmask'] = 'Reading Mask';
$string['opt_cursor'] = 'Cursor';
$string['opt_focusmode'] = 'Focus Mode';
$string['opt_focusmode_desc'] = 'Hide non-essential UI';
$string['opt_screenreader'] = 'Screen Reader';
$string['opt_screenreader_desc'] = 'Text-to-speech';
$string['opt_virtualkeyboard'] = 'Virtual Keyboard';
$string['opt_voicecommands'] = 'Voice Commands';
$string['helpbtn'] = 'Help';
$string['help_vc_intro'] = 'Say one of the following commands:';
$string['help_vc_1'] = '"increase text" — Increases text size';
$string['help_vc_2'] = '"decrease text" — Decreases text size';
$string['help_vc_3'] = '"high contrast" — Activates high contrast';
$string['help_vc_4'] = '"dark mode" — Activates dark mode';
$string['help_vc_5'] = '"reset" — Restores all defaults';
$string['help_vc_6'] = '"close panel" — Closes the panel';
$string['help_vc_7'] = '"open panel" — Opens the panel';
$string['help_vc_8'] = '"scroll down" — Scrolls down';
$string['help_vc_9'] = '"scroll up" — Scrolls up';
$string['help_vc_10'] = '"scroll to top" — Goes to page top';
$string['help_vc_11'] = '"scroll to bottom" — Goes to page bottom';
$string['help_vc_12'] = '"screen reader" — Toggles screen reader';
$string['help_fn_intro'] = 'How to use:';
$string['help_fn_1'] = 'Enable the option';
$string['help_fn_2'] = 'Look at the center of the screen and click <strong>Calibrate</strong>';
$string['help_fn_3'] = 'Move your head to move the virtual cursor';
$string['help_fn_4'] = 'Open your mouth (~1 s) or blink both eyes (~1 s) to click — when the ring around the cursor fills up, the click is performed';
$string['help_fn_5'] = 'To scroll the page, move the cursor to the top or bottom edge of the screen';
$string['opt_facenavigation'] = 'Face Navigation';
$string['opt_facenavigation_desc'] = 'Control cursor with head movements';
$string['face_loading'] = 'Loading model…';
$string['face_camhint'] = 'Look at the camera in a neutral position, then click Calibrate.';
$string['face_calibrate'] = 'Calibrate';
$string['face_active'] = 'Camera active';
$string['face_stop'] = 'Stop';
$string['face_sens'] = 'Virtual Cursor Speed';
$string['face_error'] = 'Failed to start';
$string['face_click'] = 'Click: Open your mouth or blink both eyes';
$string['face_scroll'] = 'Scroll page: Move the virtual cursor to the top or bottom edge of the page';

// Profiles.
$string['profile_lowvision'] = 'Low Vision';
$string['profile_lowvision_desc'] = 'Larger text, high contrast, big cursor';
$string['profile_colorblind'] = 'Color Blind';
$string['profile_colorblind_desc'] = 'Color filter and highlighted links';
$string['profile_dyslexia'] = 'Dyslexia';
$string['profile_dyslexia_desc'] = 'Friendly font, spacing, reading guide';
$string['profile_adhd'] = 'ADHD / Focus';
$string['profile_adhd_desc'] = 'Reading mask, focus mode, no motion';
$string['profile_senior'] = 'Senior';
$string['profile_senior_desc'] = 'Readable font, large text, highlighted buttons';
$string['profile_epilepsy'] = 'Epilepsy';
$string['profile_epilepsy_desc'] = 'No motion, low saturation, calm environment';
$string['profile_motor'] = 'Motor Impairment';
$string['profile_motor_desc'] = 'Big cursor, highlighted buttons, tooltips';
$string['profile_cognitive'] = 'Cognitive';
$string['profile_cognitive_desc'] = 'Focus mode, readable font, no distractions';
$string['profile_night'] = 'Night Mode';
$string['profile_night_desc'] = 'Dark contrast and low saturation';

// Screen reader overlay.
$string['sr_hint'] = 'Screen reader active — click any text to hear it';
$string['sr_reading'] = 'Reading…';
$string['sr_stop'] = 'Stop';

// Virtual keyboard.
$string['vk_typinginto'] = 'Typing into';
$string['vk_none'] = 'Click a text field';
$string['vk_space'] = 'space';
$string['vk_textfield'] = 'text field';

// Voice commands.
$string['vc_listening'] = 'Listening…';
$string['vc_notsupported'] = 'Voice commands are not supported in this browser.';
$string['vc_hint'] = 'Say a command, e.g. "increase text", "high contrast", "close panel"';

// Admin settings.
$string['settings_general'] = 'General';
$string['settings_enabled'] = 'Enable plugin';
$string['settings_enabled_desc'] = 'Turns the accessibility FAB and panel on or off site-wide.';
$string['settings_showforguests'] = 'Show for guests';
$string['settings_showforguests_desc'] = 'Show the accessibility button to users who are not logged in.';
$string['settings_excludedpages'] = 'Excluded pages';
$string['settings_excludedpages_desc'] = 'One URL pattern per line (supports * as wildcard). The plugin will not load on matching pages.';
$string['settings_enabledfeatures'] = 'Enabled options';
$string['settings_enabledfeatures_desc'] = 'Choose which of the 22 accessibility options are available to users.';
$string['settings_fab'] = 'Floating button (FAB)';
$string['settings_fabposition'] = 'Position';
$string['settings_fabicon'] = 'Icon';
$string['settings_fabshape'] = 'Shape';
$string['settings_panel'] = 'Panel';
$string['settings_panelformat'] = 'Format';
$string['settings_density'] = 'Density';
$string['settings_showprofiles'] = 'Show profiles';
$string['settings_showprofiles_desc'] = 'Show the accessibility profile presets section in the panel.';
$string['settings_footertext'] = 'Panel footer text';
$string['settings_footertext_desc'] = 'Custom message shown at the bottom of the panel, below the option categories. Leave empty to use the default message ("Made with ❤️ by CPTED, for you.").';
$string['settings_appearance'] = 'Appearance';
$string['settings_accent'] = 'Accent color';
$string['settings_highlightcolor'] = 'Highlight color';
$string['settings_highlightcolor_desc'] = 'Color used by the "Highlight titles/links/buttons" options.';
$string['settings_readingguidecolor'] = 'Reading guide color';
$string['settings_readingguidecolor_desc'] = 'Color of the "Reading guide" line that follows the mouse.';
$string['position_bottomright'] = 'Bottom right';
$string['position_bottomleft'] = 'Bottom left';
$string['position_middleright'] = 'Middle right';
$string['position_middleleft'] = 'Middle left';
$string['icon_un'] = 'UN accessibility logo';
$string['icon_accessibility'] = 'Accessibility';
$string['icon_sparkles'] = 'Sparkles';
$string['icon_user'] = 'User';
$string['shape_circle'] = 'Circle';
$string['shape_square'] = 'Square';
$string['format_popover'] = 'Popover';
$string['format_drawer'] = 'Drawer';
$string['format_modal'] = 'Modal';
$string['density_compact'] = 'Compact';
$string['density_regular'] = 'Regular';
$string['density_comfortable'] = 'Comfortable';

// Errors.
$string['error_invalidsettings'] = 'Invalid accessibility settings payload.';
$string['error_invalidkey'] = 'Unknown accessibility setting: {$a}';
$string['error_invalidvalue'] = 'Invalid value for accessibility setting {$a}.';
