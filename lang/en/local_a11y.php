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
 * @package    local_a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */

defined('MOODLE_INTERNAL') || die();

$string['pluginname'] = 'Accessibility (A11y)';

// Capabilities.
$string['a11y:view'] = 'Use the accessibility panel';
$string['a11y:viewstats'] = 'View the aggregate accessibility usage-stats report';

// Privacy.
$string['privacy:metadata:preference:local_a11y_settings'] = 'The accessibility options the user has chosen (text size, contrast, font, colour filters, etc). Note: clicking one of the ready-made "profiles" (e.g. Dyslexia, Epilepsy) only applies its underlying option values here - which profile, if any, was clicked is never itself recorded.';
$string['privacy:metadata:speechrecognitionservice'] = 'When "Voice Commands" is active, some browsers (e.g. Chrome) send the microphone audio to their own remote speech-recognition service to transcribe it into text. This plugin has no control over that service, and never itself sends, receives or stores this audio or its transcription - see README.md.';
$string['privacy:metadata:speechrecognitionservice:audio'] = 'Microphone audio captured by the browser while "Voice Commands" is active, for as long as needed to recognise a command.';

// Panel chrome.
$string['fabopen'] = 'Open accessibility panel';
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
$string['savetitle'] = 'Made with ❤️ by <strong>UFPel</strong>, for you.';
$string['keyboardhint'] = 'Alt+A';

// Categories.
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
$string['wordspacinglevel_0'] = 'Default';
$string['wordspacinglevel_1'] = 'Light';
$string['wordspacinglevel_2'] = 'Medium';
$string['wordspacinglevel_3'] = 'Wide';
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
$string['bluelightlevel_0'] = 'Off';
$string['bluelightlevel_1'] = 'Subtle';
$string['bluelightlevel_2'] = 'Medium';
$string['bluelightlevel_3'] = 'Strong';
$string['focusmodelevel_0'] = 'Default';
$string['focusmodelevel_1'] = 'Distraction-free';
$string['focusmodelevel_2'] = 'Comfortable reading';
$string['focusmodelevel_3'] = 'Text only';
$string['dyslexicfontlevel_0'] = 'Off';
$string['dyslexicfontlevel_1'] = 'Lexend';
$string['dyslexicfontlevel_2'] = 'OpenDyslexic';

// Options — labels.
$string['opt_readablefont'] = 'Readable Font';
$string['opt_readablefont_desc'] = 'Applies Atkinson Hyperlegible';
$string['opt_dyslexicfont'] = 'Dyslexia-Friendly Font';
$string['opt_highlighttitles'] = 'Highlight Titles';
$string['opt_highlightlinks'] = 'Highlight Links';
$string['opt_highlightbuttons'] = 'Highlight Buttons';
$string['opt_textsize'] = 'Text Size';
$string['opt_lineheight'] = 'Line Height';
$string['opt_textspacing'] = 'Text Spacing';
$string['opt_wordspacing'] = 'Word Spacing';
$string['opt_textalign'] = 'Text Alignment';
$string['opt_bionicreading'] = 'Bionic Reading';
$string['opt_contrast'] = 'Contrast';
$string['opt_invertcolors'] = 'Invert Colors';
$string['opt_colorchange'] = 'Color Adjustment';
$string['opt_colorchange_desc'] = 'Color-blindness filters - affects every image on the page too, including ones that encode information by color (a chart legend, a heat map)';
$string['opt_saturation'] = 'Saturation';
$string['opt_bluelightfilter'] = 'Blue Light Filter';
$string['opt_hideimages'] = 'Hide Images';
$string['hideimages_forcednote'] = 'Automatically enabled by Focus Mode (level 3 — Text only)';
$string['opt_pauseanimations'] = 'Pause Animations';
$string['opt_silencemedia'] = 'Silence Media';
$string['opt_tooltips'] = 'Tooltips';
$string['opt_signlanguage'] = 'Sign Language (VLibras)';
$string['opt_readingguide'] = 'Reading Guide';
$string['opt_readingmask'] = 'Reading Mask';
$string['opt_magnifier'] = 'Magnifier';
$string['opt_cursor'] = 'Cursor';
$string['opt_focusmode'] = 'Focus Mode';
$string['opt_focusmode_desc'] = 'Simplifies the page in 3 progressive levels';
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
$string['help_sr_intro'] = 'How to use:';
$string['help_sr_1'] = 'Enable the option — an indicator appears in the corner of the screen';
$string['help_sr_2'] = 'Hover over any text on the page to highlight it';
$string['help_sr_3'] = 'Click the highlighted text to hear it read aloud';
$string['help_sr_4'] = 'Use the "Stop" button on the indicator to stop reading at any time';
$string['help_vk_intro'] = 'How to use:';
$string['help_vk_1'] = 'Enable the option — the keyboard appears fixed at the bottom of the screen';
$string['help_vk_2'] = 'Click a text field on the page to place the cursor in it';
$string['help_vk_3'] = 'Tap the on-screen keys to type into that field';
$string['help_vk_4'] = 'Tap ⇧ to switch between lowercase and uppercase; the accent row (á, é, í, ó, ú, ã, õ, ç, â, ê) is always available';
$string['help_rg_intro'] = 'How it works:';
$string['help_rg_1'] = 'A horizontal line follows the mouse cursor vertically across the screen';
$string['help_rg_2'] = 'Helps you keep your place while reading long paragraphs without losing the line';
$string['help_rg_3'] = 'The line colour can be customised by the site administrator, in Settings';
$string['help_rm_intro'] = 'How it works:';
$string['help_rm_1'] = 'A horizontal band around the mouse cursor stays visible; the rest of the screen dims';
$string['help_rm_2'] = 'Helps you focus on one line at a time, reducing distraction from the rest of the page';
$string['help_rm_3'] = 'Move the mouse vertically to shift the reading band';
$string['help_sm_intro'] = 'How it works:';
$string['help_sm_1'] = 'Audio with autoplay (or already playing) is muted and paused';
$string['help_sm_2'] = 'Video with autoplay (or already playing) is muted but keeps playing silently — turn on "Pause Animations" too if you also want it to stop';
$string['help_sm_3'] = 'Embedded YouTube and Vimeo videos are muted too, when the page allows controlling them';
$string['help_sm_4'] = 'Media added to the page later — including videos loaded on demand — is silenced too while this is on';
$string['help_sm_5'] = 'Turning this off does not bring sound back on its own: it only stops silencing new media from then on';
$string['help_mag_intro'] = 'How it works:';
$string['help_mag_1'] = 'A circular lens follows the mouse pointer and magnifies the content under it — text, images and tables';
$string['help_mag_2'] = 'Use the arrow keys to move the lens without a mouse';
$string['help_mag_3'] = 'Use + and - to zoom in or out (2x, 3x, 4x)';
$string['help_mag_4'] = 'Press Esc to turn the magnifier off at any time';
$string['help_br_intro'] = 'How it works:';
$string['help_br_1'] = 'Darkens the first letters of each word, proportional to its length - the rest keeps its normal weight';
$string['help_br_2'] = 'Does not change the page\'s text: screen readers still read every word whole, with no mid-word interruption';
$string['help_br_3'] = 'Never touches forms, quiz questions, the text editor, rendered MathJax, or the virtual keyboard';
$string['help_br_4'] = 'Bionic reading\'s effect on reading speed or comprehension is not consistently backed by evidence - this option only applies the visual effect';
$string['help_sl_intro'] = 'What you need to know:';
$string['help_sl_1'] = 'Shows (or hides) the access button for VLibras - a Brazilian Sign Language (Libras) translator maintained by the Brazilian federal government at vlibras.gov.br';
$string['help_sl_2'] = 'The VLibras script already loads on this page regardless of this option - what you control here is only the visibility of its button, not whether its content is loaded';
$string['help_sl_3'] = 'When you use the translation, the content is processed by the public VLibras service (vlibras.gov.br) - outside this institution\'s own infrastructure';
$string['help_sl_4'] = 'This option only exists because an administrator chose to integrate VLibras with this panel - without that integration on, VLibras\' button shows up on its own, without going through here';
$string['help_hi_intro'] = 'Before turning this on:';
$string['help_hi_1'] = 'Hides every image and video on the page, including embedded YouTube and Vimeo videos';
$string['help_hi_2'] = 'This applies to all of them, including ones that carry information (a diagram, a chart) - there is no way to keep just those visible';
$string['help_pa_intro'] = 'What gets paused:';
$string['help_pa_1'] = 'CSS animations and transitions on the page (banners, hover effects, carousels)';
$string['help_pa_2'] = 'Animated GIFs, frozen on their current frame';
$string['help_pa_3'] = 'Video with autoplay, or already playing';
$string['help_pa_4'] = 'Any video that tries to start playing on its own while this is on is paused too';
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
$string['face_privacynotice'] = 'Activating Face Navigation turns on your camera. The image is processed entirely in your own browser and is never sent to this site or anyone else - but doing that requires downloading a third-party component (MediaPipe) to run locally. Continue?';

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
$string['vk_none'] = 'Click a text field';
$string['vk_space'] = 'space';
$string['vk_textfield'] = 'text field';

// Voice commands.
$string['vc_listening'] = 'Listening…';
$string['vc_notsupported'] = 'Voice commands are not supported in this browser.';
$string['vc_privacynotice'] = 'In this browser, activating Voice Commands sends the audio captured by your microphone to a remote speech-recognition service (not operated by this site) to convert it into text. Continue?';

// Admin settings.
$string['settings_general'] = 'General';
$string['settings_enabled'] = 'Enable plugin';
$string['settings_enabled_desc'] = 'Turns the accessibility FAB and panel on or off site-wide.';
$string['settings_showforguests'] = 'Show for guests';
$string['settings_showforguests_desc'] = 'Show the accessibility button to users who are not logged in.';
$string['settings_excludedpages'] = 'Excluded pages';
$string['settings_excludedpages_desc'] = 'One URL pattern per line (supports * as wildcard). The plugin will not load on matching pages.';
$string['settings_enabledfeatures'] = 'Enabled options';
$string['settings_enabledfeatures_desc'] = 'Choose which of the accessibility options below are available to users. This list can vary: the Sign Language option, for example, only appears here while the VLibras integration is active.';
$string['settings_fab'] = 'Floating button (FAB)';
$string['settings_integrations'] = 'Integrations';
$string['settings_integratevlibras'] = 'Integrate with VLibras';
$string['settings_integratevlibras_desc'] = 'When on, VLibras\' own floating button is hidden (visually only - its script keeps loading normally) and access to it moves to the "Sign Language (VLibras)" option in this plugin\'s own panel.';
$string['settings_vlibrascollision_warning'] = 'VLibras is installed and active, but the integration above is off - in that case, its own floating button shows up on its own, without going through this plugin. Its configured position (Site administration > Plugins > Local plugins > VLibras) matches the position configured for this plugin\'s own button (below, under "Floating button"). The two are likely to end up stacked on top of each other. Adjust either one\'s position, or turn the integration above on.';
$string['settings_fabposition'] = 'Position';
$string['settings_fabposition_desc'] = 'Which corner of the screen the floating button is fixed to.';
$string['settings_fabicon'] = 'Icon';
$string['settings_fabicon_desc'] = 'Icon shown inside the floating button.';
$string['settings_fabshape'] = 'Shape';
$string['settings_fabshape_desc'] = 'Outline of the floating button.';
$string['settings_panel'] = 'Panel';
$string['settings_panelformat'] = 'Format';
$string['settings_panelformat_desc'] = 'How the panel opens on desktop screens: a small popover anchored to the button, a full-height side drawer, or a centred modal dialog. On phones and small tablets the panel always opens in drawer style, regardless of this setting.';
$string['settings_density'] = 'Density';
$string['settings_density_desc'] = 'How much space each option row takes up in the panel. Compact fits more options on screen and hides their descriptions; Comfortable spreads options out with larger icons and more spacing; Regular is the default in between.';
$string['settings_showprofiles'] = 'Show profiles';
$string['settings_showprofiles_desc'] = 'Show the accessibility profile presets section in the panel.';
$string['settings_footertext'] = 'Panel footer text';
$string['settings_footertext_desc'] = 'Custom message shown at the bottom of the panel, below the option categories. Leave empty to use the default message ("Made with ❤️ by UFPel, for you.").';
$string['settings_colors'] = 'Colors';
$string['settings_accent'] = 'Accent color';
$string['settings_accent_desc'] = 'Main color of the floating button, the panel, and active-option indicators.';
$string['settings_highlighttitlescolor'] = 'Highlight titles color';
$string['settings_highlighttitlescolor_desc'] = 'Color used by the "Highlight Titles" option.';
$string['settings_highlightlinkscolor'] = 'Highlight links color';
$string['settings_highlightlinkscolor_desc'] = 'Color used by the "Highlight Links" option.';
$string['settings_highlightbuttonscolor'] = 'Highlight buttons color';
$string['settings_highlightbuttonscolor_desc'] = 'Color used by the "Highlight Buttons" option.';
$string['settings_readingguidecolor'] = 'Reading guide color';
$string['settings_readingguidecolor_desc'] = 'Color of the "Reading Guide" line that follows the mouse.';
$string['position_bottomright'] = 'Bottom right';
$string['position_bottomleft'] = 'Bottom left';
$string['position_middleright'] = 'Middle right';
$string['position_middleleft'] = 'Middle left';
$string['icon_default'] = 'Accessibility (default)';
$string['icon_un'] = 'UN accessibility logo';
$string['shape_circle'] = 'Circle';
$string['shape_square'] = 'Square';
$string['format_popover'] = 'Popover';
$string['format_drawer'] = 'Drawer';
$string['format_modal'] = 'Modal';
$string['density_compact'] = 'Compact';
$string['density_regular'] = 'Regular';
$string['density_comfortable'] = 'Comfortable';

// Statistics (D47 - aggregate, anonymous usage counters).
$string['settings_stats'] = 'Statistics';
$string['settings_collectstats'] = 'Collect usage statistics';
$string['settings_collectstats_desc'] = 'When enabled, every time any user (including guests) turns an accessibility option on, an aggregate, site-wide counter for that specific option is incremented. Only three things are ever stored per option: its id, a running total count, and when it was last updated - nothing else. No user, session, course or IP identifier is ever recorded, and no per-event timestamp is kept, so it is not possible to reconstruct any individual\'s behaviour from this data. Disabled by default. See the report at Site administration → Plugins → Local plugins → Accessibility (A11y) → Usage statistics.';
$string['statstitle'] = 'Usage statistics';
$string['statsintro'] = 'Aggregate, anonymous activation counts per accessibility option - one running total per option, site-wide. No user, session, course or IP data is ever collected.';
$string['statsdisabled'] = 'Usage-statistics collection is currently disabled ("Collect usage statistics" in the plugin settings) - the numbers below, if any, are from when it was previously enabled.';
$string['statsempty'] = 'No usage statistics recorded yet.';
$string['statscol_feature'] = 'Option';
$string['statscol_counter'] = 'Activations';
$string['statscol_lastupdated'] = 'Last updated';

// Errors.
