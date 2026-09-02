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
 * local_a11y bootstrap. Called once per page via $PAGE->requires->js_call_amd()
 * from classes/hook_callbacks.php. Owns the settings state object; Panel
 * owns the DOM and reports user interaction back via callbacks; Effects
 * translates settings into body classes; Storage persists them.
 *
 * @module     local_a11y/main
 * @description local_a11y bootstrap: owns settings state, wires Panel/Effects/Storage together.
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @version    0.1.0
 * @since      0.1.0
 */

import Panel from 'local_a11y/panel';
import Effects from 'local_a11y/effects';
import Storage from 'local_a11y/storage';
import Profiles from 'local_a11y/profiles';
import FabLift from 'local_a11y/fab_lift';
import VlibrasIntegration from 'local_a11y/vlibras_integration';
import Stats from 'local_a11y/stats';

/**
 * Quality/performance audit finding, fixed: the 11 modules below used to be
 * static top-level imports too, exactly like the ones above - which meant
 * RequireJS fetched, parsed and executed every one of them (define()'s
 * factory function runs immediately once its dependencies resolve, whether
 * or not the exported sync()/start() is ever actually called) on every
 * single page, for every single user, regardless of whether that user ever
 * touches Navegação por Face, Comandos por Voz, Teclado Virtual, Lupa, etc.
 * Measured (audit/03-qualidade-desempenho.md, section 1.7): ~60KB of
 * minified JS processed by default for the common case of a user who
 * enables none of these.
 *
 * lazy(moduleId) wraps a module id in a function with the exact same
 * (active, ...args) signature its own real sync() already has, so every
 * call site below (syncAdvancedFeatures()) is unchanged in shape - only the
 * import moved from module-load time to first-activation time. The module
 * is only ever import()-ed (a real network fetch + parse + execute, via
 * RequireJS's own dynamic require() - see the babel `import()` transform
 * this project's build already relies on) the first time it is actually
 * switched on for the current user; turning an already-off option off
 * again, or one that was never turned on this page load, never fetches
 * anything.
 *
 * `wantActive` guards a real race: if the user switches an option off again
 * before its very first import() has resolved (a human can double-click
 * faster than a small JS file fetches+parses on a slow connection), the
 * module must not start anyway once it finally loads - it would otherwise
 * silently override the user's own more recent "off" click. The module is
 * still cached once loaded either way, so a later re-activation is instant.
 *
 * @param {String} moduleId The local_a11y/xxx AMD module id to lazy-load.
 * @return {Function} sync(active, ...args), matching the wrapped module's own sync().
 */
const lazy = (moduleId) => {
    let cached = null;
    let wantActive = false;
    return (active, ...args) => {
        wantActive = active;
        if (cached) {
            cached.sync(active, ...args);
            return;
        }
        if (!active) {
            // Never loaded, and now told to turn off - nothing to stop.
            return;
        }
        import(moduleId).then((mod) => {
            cached = mod;
            if (wantActive) {
                mod.sync(true, ...args);
            }
        });
    };
};

const ReadingGuide = lazy('local_a11y/reading_guide');
const ReadingMask = lazy('local_a11y/reading_mask');
const Magnifier = lazy('local_a11y/magnifier');
const ScreenReader = lazy('local_a11y/screen_reader');
const VirtualKeyboard = lazy('local_a11y/virtual_keyboard');
const VoiceCommands = lazy('local_a11y/voice_commands');
const Tooltips = lazy('local_a11y/tooltips');
const FaceNavigation = lazy('local_a11y/face_navigation');
const PauseMedia = lazy('local_a11y/pause_media');
const SilenceMedia = lazy('local_a11y/silence_media');
const BionicReading = lazy('local_a11y/bionic_reading');

let settings = {...Storage.DEFAULT_SETTINGS};
let isLoggedIn = false;
// Whether aggregate usage-stat collection is on (classes/config.php::
// collect_stats_enabled(), passed in via init() below) - checked before
// ever calling Stats.recordActivation(), purely to skip a pointless
// network request on the (default) common case where it's off; the
// server re-checks this itself regardless (see D47), so this flag is
// never a security boundary, only an optimisation.
let statsEnabled = false;
// Which profile preset (if any) is currently applied. Ephemeral (not
// persisted) - matches the prototype's own local component state, which
// also resets on reload; only the resulting `settings` values persist.
let activeProfileId = null;
// Built from the server-rendered DOM itself (data-kind/data-max/category),
// so option metadata never has to be duplicated a third time in JS.
let optionMeta = {};

/**
 * Look up an option's default value.
 *
 * @param {String} id The option id.
 * @return {Boolean|Number} The option's default value.
 */
const defaultOf = (id) => Storage.DEFAULT_SETTINGS[id];

/**
 * Report one aggregate activation (D47) for every option that just
 * transitioned from inactive (default) to active (non-default), by
 * comparing old vs new settings - covers a single toggle/stepper change
 * as well as a whole profile preset turning several options on at once.
 * No-ops entirely when statsEnabled is off, without even building the
 * comparison. Fire-and-forget: never awaited, never blocks the UI.
 *
 * @param {Object} oldSettings Settings before the change.
 * @param {Object} newSettings Settings after the change.
 * @return {void}
 */
const recordNewActivations = (oldSettings, newSettings) => {
    if (!statsEnabled) {
        return;
    }
    Object.keys(newSettings).forEach((id) => {
        const wasActive = oldSettings[id] !== defaultOf(id);
        const isActive = newSettings[id] !== defaultOf(id);
        if (!wasActive && isActive) {
            Stats.recordActivation(id);
        }
    });
};

/**
 * Recompute and render every category's active-option badge.
 *
 * @return {void}
 */
const renderCategoryCounts = () => {
    const byCategory = {};
    Object.keys(optionMeta).forEach((id) => {
        const cat = optionMeta[id].categoryId;
        const isActive = settings[id] !== defaultOf(id);
        byCategory[cat] = (byCategory[cat] || 0) + (isActive ? 1 : 0);
    });
    Object.keys(byCategory).forEach((cat) => Panel.renderCategoryCount(cat, byCategory[cat]));
};

/**
 * Recompute the total active-option count and render the header/badge.
 *
 * Iterates optionMeta (DOM-derived), not Storage.DEFAULT_SETTINGS, matching
 * renderCategoryCounts() above - the two used to be interchangeable sources
 * of "every option id that exists" since every option was always rendered,
 * but that stopped being true the moment signLanguage became conditional
 * (D54): Storage.DEFAULT_SETTINGS always has a signLanguage key regardless
 * of whether the integration is on (see its own comment for why), but
 * optionMeta only has one when the server actually rendered that row. Using
 * DEFAULT_SETTINGS here would have counted a settings.signLanguage value
 * that differs from its default even when there is no row for it to show
 * as active in the panel.
 *
 * @return {void}
 */
const renderHeaderCount = () => {
    const count = Object.keys(optionMeta)
        .filter((id) => settings[id] !== defaultOf(id)).length;
    Panel.renderHeader(count);
};

/**
 * Voice command action -> settings mutation, passed to VoiceCommands.start().
 * Defined once init() has bound onToggle/onReset (see below).
 */
let voiceCallbacks = {};

/**
 * Callbacks passed to FaceNavigation.sync()/start() - today only
 * `declineActivation`, called if the user declines the one-time privacy
 * notice shown before requesting camera access (compliance audit,
 * audit/04-conformidade.md item A5). Defined as a plain constant (unlike
 * voiceCallbacks above) because, unlike Comandos por Voz, it never needs
 * access to the full voice-command action table - just this one callback.
 */
const faceCallbacks = {
    declineActivation: () => onToggle('faceNavigation', false),
};

/**
 * Navigate to a Moodle page by path. Uses M.cfg.wwwroot when available so
 * this works regardless of whether Moodle is installed at the domain root.
 *
 * @param {String} path The Moodle-relative path to navigate to, e.g. "/my".
 * @return {void}
 */
const navigateTo = (path) => {
    const root = (window.M && window.M.cfg && window.M.cfg.wwwroot) || '';
    window.location.href = root + path;
};

/**
 * Start/stop the "advanced" features that need a live JS overlay/listener
 * on top of (or, for pauseAnimations, in addition to) their body CSS class -
 * see classes/manager.php's get_boolean_class_map() docblock - to match the
 * current settings.
 *
 * @return {void}
 */
const syncAdvancedFeatures = () => {
    ReadingGuide(Boolean(settings.readingGuide));
    ReadingMask(Boolean(settings.readingMask));
    Magnifier(Boolean(settings.magnifier));
    ScreenReader(Boolean(settings.screenReader));
    VirtualKeyboard(Boolean(settings.virtualKeyboard));
    VoiceCommands(Boolean(settings.voiceCommands), voiceCallbacks);
    Tooltips(Boolean(settings.tooltips));
    FaceNavigation(Boolean(settings.faceNavigation), faceCallbacks);
    PauseMedia(Boolean(settings.pauseAnimations));
    SilenceMedia(Boolean(settings.silenceMedia));
    BionicReading(Boolean(settings.bionicReading));
    // hideImages needs no JS module (D44) - display:none on a body-class
    // rule alone hides images/video fully, no reserved space to paint.
    // signLanguage's own reveal/hide is CSS-only (styles.css), same as
    // hideImages - but D57 added an actual open/close *action* on top of
    // that (a real click, not just a display toggle), which is why this
    // one still needs a module call here unlike hideImages.
    VlibrasIntegration.sync(Boolean(settings.signLanguage));
};

/**
 * Whether hideImages' own value is currently moot because focusMode's level
 * 3 ("Somente texto") already hides images itself (D52). The panel must
 * never show hideImages as off while images are still visibly hidden by
 * focusMode - see DECISIONS.md D52 for the full precedence rationale
 * (focusMode level 3 always wins; hideImages' own switch is disabled and
 * shown active while this is true).
 *
 * @return {Boolean}
 */
const isHideImagesForced = () => Number(settings.focusMode) === 3;

/**
 * Render one option row, resolving the D52 hideImages/focusMode "forced"
 * state for it along the way.
 *
 * @param {String} id The option id.
 * @return {Promise<void>}
 */
const renderOptionRow = (id) => Panel.renderOption(
    id, settings[id], defaultOf(id), id === 'hideImages' && isHideImagesForced()
);

/**
 * Apply the in-memory `settings` object everywhere: page effects, DOM
 * (single option, or all of them), counts, and persist it.
 *
 * @param {String|null} onlyId Re-render just this option row, or null for all.
 * @return {Promise<void>}
 */
const commit = async(onlyId = null) => {
    Effects.apply(settings);
    syncAdvancedFeatures();
    if (onlyId) {
        // hideImages' displayed "forced" state depends on focusMode (D52),
        // so whenever either one changes, both rows need a re-render - not
        // just whichever one was actually acted on - or the other one's row
        // would show a stale forced/active state until something else
        // happened to touch it.
        const ids = (onlyId === 'focusMode' || onlyId === 'hideImages')
            ? ['focusMode', 'hideImages']
            : [onlyId];
        await Promise.all(ids.filter((id) => id in optionMeta).map(renderOptionRow));
    } else {
        await Promise.all(Object.keys(optionMeta).map(renderOptionRow));
    }
    renderCategoryCounts();
    await renderHeaderCount();
    await Storage.saveSettings(settings, isLoggedIn);
};

/**
 * Toggle a boolean option and commit the new settings.
 *
 * @param {String} id The option id.
 * @param {Boolean} value The new value.
 * @return {void}
 */
const onToggle = (id, value) => {
    if (!(id in optionMeta)) {
        return;
    }
    const oldSettings = settings;
    settings = {...settings, [id]: value};
    recordNewActivations(oldSettings, settings);
    activeProfileId = null;
    Panel.renderActiveProfile(null);
    commit(id);
};

/**
 * Set a stepper option to a specific (clamped) value.
 *
 * @param {String} id The stepper option id.
 * @param {Number} value The requested value (clamped to [0, meta.max]).
 * @return {void}
 */
const setStepperValue = (id, value) => {
    const meta = optionMeta[id];
    if (!meta) {
        return;
    }
    const oldSettings = settings;
    settings = {...settings, [id]: Math.max(0, Math.min(meta.max, value))};
    recordNewActivations(oldSettings, settings);
    activeProfileId = null;
    Panel.renderActiveProfile(null);
    commit(id);
};

/**
 * Cycle a stepper option to its next value, wrapping back to 0 after max.
 *
 * @param {String} id The stepper option id.
 * @return {void}
 */
const onStepperCycle = (id) => {
    const meta = optionMeta[id];
    if (!meta) {
        return;
    }
    const current = Number(settings[id]) || 0;
    setStepperValue(id, (current + 1) % (meta.max + 1));
};

/**
 * Restore every option to its default value.
 *
 * @return {void}
 */
const onReset = () => {
    settings = {...Storage.DEFAULT_SETTINGS};
    activeProfileId = null;
    Panel.renderActiveProfile(null);
    commit();
};

/**
 * Apply a profile preset (or clear it, if the same profile is clicked
 * again - matching the prototype's toggle-off behaviour).
 *
 * @param {String} id The profile id to apply (or clear, if already active).
 * @return {void}
 */
const onProfileSelect = (id) => {
    if (activeProfileId === id) {
        onReset();
        return;
    }
    const applied = Profiles.applyProfile(id, Storage.DEFAULT_SETTINGS);
    if (!applied) {
        return;
    }
    const oldSettings = settings;
    settings = applied;
    recordNewActivations(oldSettings, settings);
    activeProfileId = id;
    Panel.renderActiveProfile(id);
    commit();
};

voiceCallbacks = {
    // Called by amd/src/voice_commands.js::start() if the user declines its
    // one-time privacy notice (security/privacy audit finding) - turns the
    // panel's own toggle back off, exactly as if the user had clicked it,
    // so the switch never shows "on" for a feature that didn't actually
    // start. Safe to call even if voiceCommands is already false somehow -
    // onToggle()/commit() are idempotent for a value that doesn't change.
    declineActivation: () => onToggle('voiceCommands', false),

    // Panel
    openPanel: () => Panel.open(),
    closePanel: () => Panel.close(),

    // Text size
    increaseTextSize: () => setStepperValue('textSize', (Number(settings.textSize) || 0) + 1),
    decreaseTextSize: () => setStepperValue('textSize', (Number(settings.textSize) || 0) - 1),

    // Line height
    increaseLineHeight: () => setStepperValue('lineHeight', (Number(settings.lineHeight) || 0) + 1),
    decreaseLineHeight: () => setStepperValue('lineHeight', (Number(settings.lineHeight) || 0) - 1),

    // Text spacing
    increaseTextSpacing: () => setStepperValue('textSpacing', (Number(settings.textSpacing) || 0) + 1),
    decreaseTextSpacing: () => setStepperValue('textSpacing', (Number(settings.textSpacing) || 0) - 1),

    // Text alignment
    alignLeft: () => setStepperValue('textAlign', 1),
    alignCenter: () => setStepperValue('textAlign', 2),
    alignRight: () => setStepperValue('textAlign', 3),
    alignJustify: () => setStepperValue('textAlign', 4),
    alignDefault: () => setStepperValue('textAlign', 0),

    // Contrast
    highContrast: () => setStepperValue('contrast', 3),
    darkMode: () => setStepperValue('contrast', 1),
    lightContrast: () => setStepperValue('contrast', 2),
    noContrast: () => setStepperValue('contrast', 0),

    // Colors
    toggleInvertColors: () => onToggle('invertColors', !settings.invertColors),
    colorProtanopia: () => setStepperValue('colorChange', 1),
    colorDeuteranopia: () => setStepperValue('colorChange', 2),
    colorTritanopia: () => setStepperValue('colorChange', 3),
    colorDefault: () => setStepperValue('colorChange', 0),

    // Saturation
    saturationHigh: () => setStepperValue('saturation', 1),
    saturationLow: () => setStepperValue('saturation', 2),
    saturationMono: () => setStepperValue('saturation', 3),
    saturationNormal: () => setStepperValue('saturation', 0),

    // Cursor
    cursorBigBlack: () => setStepperValue('cursor', 1),
    cursorBigWhite: () => setStepperValue('cursor', 2),
    cursorDefault: () => setStepperValue('cursor', 0),

    // Font
    toggleReadableFont: () => onToggle('readableFont', !settings.readableFont),
    toggleDyslexicFont: () => onToggle('dyslexicFont', !settings.dyslexicFont),

    // Highlights
    toggleHighlightTitles: () => onToggle('highlightTitles', !settings.highlightTitles),
    toggleHighlightLinks: () => onToggle('highlightLinks', !settings.highlightLinks),
    toggleHighlightButtons: () => onToggle('highlightButtons', !settings.highlightButtons),

    // Media & motion
    toggleHideImages: () => onToggle('hideImages', !settings.hideImages),
    togglePauseAnimations: () => onToggle('pauseAnimations', !settings.pauseAnimations),
    toggleTooltips: () => onToggle('tooltips', !settings.tooltips),

    // Focus & navigation tools
    toggleReadingGuide: () => onToggle('readingGuide', !settings.readingGuide),
    toggleReadingMask: () => onToggle('readingMask', !settings.readingMask),
    // focusMode is a stepper since D52 (was a plain toggle) - onToggle()
    // would write a raw JS boolean into a settings key everything else
    // expects to be an integer level, breaking the row's own re-render and
    // Effects.apply()'s parseInt(). The voice phrase itself ("modo foco")
    // is still an on/off toggle by design, so keep it one: off -> level 1
    // (the level that preserves this option's original toggle-only
    // behaviour), anything already on -> off.
    toggleFocusMode: () => setStepperValue('focusMode', settings.focusMode > 0 ? 0 : 1),
    toggleScreenReader: () => onToggle('screenReader', !settings.screenReader),
    toggleVirtualKeyboard: () => onToggle('virtualKeyboard', !settings.virtualKeyboard),

    // Reset
    reset: () => onReset(),

    // Moodle navigation
    goToDashboard: () => navigateTo('/my'),
    goToCourses: () => navigateTo('/my/courses.php'),
    goToCalendar: () => navigateTo('/calendar/view.php'),
    goToMessages: () => navigateTo('/message/index.php'),
    goToProfile: () => navigateTo('/user/profile.php'),
    goBack: () => window.history.back(),
    goForward: () => window.history.forward(),

    // Page scroll
    scrollDown: () => window.scrollBy({top: 400, behavior: 'smooth'}),
    scrollUp: () => window.scrollBy({top: -400, behavior: 'smooth'}),
    scrollTop: () => window.scrollTo({top: 0, behavior: 'smooth'}),
    scrollBottom: () => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'}),
};

/**
 * Scan the server-rendered option rows to build the id -> {kind, max,
 * categoryId} metadata map, without duplicating that data a third time.
 *
 * @param {HTMLElement} panelEl The root panel element to scan for `[data-region="option"]` rows.
 * @return {Object} Map of option id -> {kind, max, categoryId}.
 */
const buildOptionMeta = (panelEl) => {
    const meta = {};
    panelEl.querySelectorAll('[data-region="option"]').forEach((row) => {
        const category = row.closest('[data-region="category"]');
        meta[row.dataset.optionId] = {
            kind: row.dataset.kind,
            max: row.dataset.max ? parseInt(row.dataset.max, 10) : 0,
            categoryId: category ? category.dataset.categoryId : null,
        };
    });
    return meta;
};

/**
 * Entry point.
 *
 * @param {Boolean} loggedIn True for a real (non-guest) logged-in user.
 * @param {Boolean} collectStatsEnabled classes/config.php::collect_stats_enabled() -
 *        whether to ever call the usage-stats external function at all (D47).
 * @return {Promise<void>}
 */
export const init = async(loggedIn, collectStatsEnabled) => {
    const fab = document.getElementById('local-a11y-fab');
    const panelEl = document.getElementById('local-a11y-panel');
    if (!fab || !panelEl) {
        return;
    }
    const overlay = document.querySelector('.local-a11y-panel-overlay');

    // classes/output/renderer.php::render_footer_html() is injected by the
    // before_footer_html_generation hook deep inside #region-main (despite
    // the name), which sits inside #page - one of the elements the colour
    // filters (styles.css, D31) apply `filter` to directly. `filter` makes
    // its element the containing block for position:fixed descendants, so
    // if the FAB/panel stayed there, activating Inverter Cores/Mudar
    // Cores/Saturação would silently break their (and the reset button's,
    // etc.) fixed positioning - they'd scroll away with the page instead of
    // staying put, exactly like Moodle's own navbar/drawers did before D31.
    // Relocating them to be direct children of <body> - never inside
    // anything this plugin (or, so far, Moodle core) ever applies a filter
    // to - decouples them from that permanently, regardless of which page
    // regions future effects end up touching.
    document.body.appendChild(fab);
    if (overlay) {
        document.body.appendChild(overlay);
    }
    document.body.appendChild(panelEl);

    // Moodle's own "sticky footer" pattern (theme_boost/sticky-footer,
    // core/sticky-footer; used e.g. by the course content bulk-edit
    // toolbar) parks a position:fixed element just below the viewport via
    // a negative `bottom` offset until activated - the exact same "relies
    // on staying *viewport*-fixed while parked off-screen" pattern that
    // broke for Moodle's message-drawer before D31 stopped filtering
    // #page-wrapper as a whole. Unlike the navbar/drawers, a .stickyfooter
    // element renders *inside* #page's own content (course format
    // templates), so activating Inverter Cores/Mudar Cores/Saturação
    // (which puts `filter` on #page - still needed there, for real page
    // content) recomputes its "parked" bottom:-Npx against #page's own
    // (much taller) box instead of the viewport, dropping it at some
    // arbitrary point down the page instead of just off the bottom of the
    // screen.
    //
    // An earlier version of this fix relocated .stickyfooter to be a
    // direct <body> child *unconditionally*, on load, regardless of
    // whether any filter was ever active - on the theory that it's
    // already in the DOM before any 'core/stickyfooter_state_changed'
    // event could fire, so waiting for that event to relocate reactively
    // would be too late. That traded the (real, but narrow - only while a
    // colour filter is active) positioning bug for a much bigger one:
    // core_courseformat/local/content's whole click-handling model
    // (amd/src/local/content/actions.js::stateReady()) delegates clicks
    // via a single listener on '#page' itself (component.init('#page',
    // ...), templates/local/content.mustache) and matches on
    // [data-action] - exactly what the bulk-edit toolbar's own
    // Disponibilidade/Duplicar/Mover/Excluir buttons are. Pulling
    // .stickyfooter permanently out of #page meant clicks on those
    // buttons could never bubble up to that delegated listener again -
    // they'd still take native focus (hence the focus ring reported) but
    // never actually fire, on *every* page with a sticky footer, with or
    // without any a11y option active at all (confirmed by QA testing with
    // literally nothing enabled). A real, worse bug traded for a narrower
    // one.
    //
    // Fixed by only relocating while it's actually needed - a colour
    // filter (Inverter Cores/Mudar Cores/Saturação/daltonismo) is active -
    // and restoring .stickyfooter to its original DOM position (tracked
    // per-element, since it's the *position*, not just "is it in #page",
    // that #page's delegated listener needs) the moment none of those are
    // active any more. In the common case (no colour filter running,
    // which is most of the time - these aren't on-by-default) the sticky
    // footer never moves at all, so #page's delegation is never broken in
    // the first place.
    const FILTER_CLASSES = [
        'a11y-invert', 'a11y-saturation-1', 'a11y-saturation-2', 'a11y-saturation-3',
        'a11y-color-1', 'a11y-color-2', 'a11y-color-3',
    ];
    /**
     * @return {Boolean} True if any colour-filter body class (invert/saturation/colour-blind) is active.
     */
    const isColourFilterActive = () => FILTER_CLASSES.some((cls) => document.body.classList.contains(cls));
    const stickyFooterOriginalPosition = new WeakMap();

    /**
     * Move every `.stickyfooter` to be a direct <body> child, recording its
     * original parent/sibling first so restoreStickyFooters() can undo it.
     *
     * @return {void}
     */
    const relocateStickyFooters = () => {
        document.querySelectorAll('.stickyfooter').forEach((el) => {
            if (el.parentElement !== document.body) {
                stickyFooterOriginalPosition.set(el, {parent: el.parentElement, nextSibling: el.nextSibling});
                document.body.appendChild(el);
            }
        });
    };
    /**
     * Undo relocateStickyFooters(): move every previously-relocated
     * `.stickyfooter` back to its original position, if recorded.
     *
     * @return {void}
     */
    const restoreStickyFooters = () => {
        document.querySelectorAll('.stickyfooter').forEach((el) => {
            const original = stickyFooterOriginalPosition.get(el);
            if (el.parentElement === document.body && original && document.body.contains(original.parent)) {
                original.parent.insertBefore(el, original.nextSibling);
                stickyFooterOriginalPosition.delete(el);
            }
        });
    };
    /**
     * Relocate or restore `.stickyfooter` depending on whether a colour
     * filter is currently active.
     *
     * @return {void}
     */
    const syncStickyFooterPosition = () => (isColourFilterActive() ? relocateStickyFooters() : restoreStickyFooters());

    // The FAB sits bottom:24px/right:24px by default - directly over
    // .stickyfooter's own bottom:0, right-aligned action buttons (it spans
    // the full viewport width) once Moodle shows one (theme_boost/
    // sticky-footer.js adds body.hasstickyfooter). At z-index 99990 the FAB
    // was intercepting clicks meant for those buttons - lift the FAB clear
    // of it via fab_lift.js (shared with Virtual Keyboard, so neither
    // feature clobbers the other's lift). Measured from the element
    // itself rather than theme's $stickyfooter-height so it stays correct
    // if a theme/page ever changes that height. Runs regardless of
    // .stickyfooter's current DOM position (offsetHeight doesn't care).
    /**
     * @return {void}
     */
    const updateStickyFooterLift = () => {
        const footer = document.querySelector('.stickyfooter');
        const active = Boolean(footer) && document.body.classList.contains('hasstickyfooter');
        FabLift.setLift('stickyfooter', active ? footer.offsetHeight : 0);
    };

    /**
     * Re-sync both the sticky footer's DOM position and the FAB's lift
     * amount to the current body classes. Safe to call any time.
     *
     * @return {void}
     */
    const syncStickyFooter = () => {
        syncStickyFooterPosition();
        updateStickyFooterLift();
    };
    syncStickyFooter();
    document.addEventListener('core/stickyfooter_state_changed', syncStickyFooter);
    // Belt-and-braces for the case (unobserved so far, but see the comment
    // above for why this codebase treats that possibility seriously)
    // where hasstickyfooter or an a11y-* filter class is toggled without
    // the event firing - e.g. a future core change - so position/lift
    // never get stuck out of sync with the actual classes.
    new MutationObserver(syncStickyFooter).observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
    });

    isLoggedIn = Boolean(loggedIn);
    statsEnabled = Boolean(collectStatsEnabled);
    // One-shot, not tied to whether signLanguage ends up in optionMeta or
    // to its toggle state - see amd/src/vlibras_integration.js's own
    // docblock for why this runs unconditionally here but only ever does
    // anything when the admin-level integration is actually on.
    VlibrasIntegration.checkAvailability();
    optionMeta = buildOptionMeta(panelEl);
    settings = await Storage.getSettings(isLoggedIn);

    Panel.init(fab, panelEl, overlay, {
        onToggle,
        onStepperCycle,
        onReset,
        onProfileSelect,
    });

    // Re-apply/re-render once the real settings are loaded: the inline
    // no-FOUC script (classes/output/renderer.php::render_nofouc_script())
    // already applied its best guess synchronously to avoid a flash, but
    // this is the authoritative value (e.g. after a guest->login migration)
    // and keeps the option rows' own state in sync with it.
    Effects.apply(settings);
    syncAdvancedFeatures();
    await Promise.all(Object.keys(optionMeta).map(
        (id) => Panel.renderOption(id, settings[id], defaultOf(id))
    ));
    renderCategoryCounts();
    await renderHeaderCount();

    // Alt+A global shortcut (documented in the panel footer).
    document.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'a' || e.key === 'A')) {
            e.preventDefault();
            Panel.toggle();
        }
    });

    // The Face Navigation HUD's "Stop" button asks to turn the whole option
    // off: route it through onToggle so the panel switch, saved preference
    // and the feature's own teardown all stay in sync.
    document.addEventListener('local_a11y/face-disable', () => {
        if (settings.faceNavigation) {
            onToggle('faceNavigation', false);
        }
    });

    // Esc turns the magnifier off (amd/src/magnifier.js dispatches this
    // instead of mutating settings directly, so the panel switch/storage
    // stay in sync too) - same self-disable pattern as face-disable above.
    document.addEventListener('local_a11y/magnifier-disable', () => {
        if (settings.magnifier) {
            onToggle('magnifier', false);
        }
    });

    // Closing VLibras' avatar through its own UI (not through this plugin)
    // dispatches this instead of mutating settings directly (amd/src/
    // vlibras_integration.js) - same self-disable pattern as magnifier/
    // face-disable above, added in D58 after the panel switch was found to
    // stay on indefinitely once the user closed VLibras' own window.
    document.addEventListener('local_a11y/vlibras-disable', () => {
        if (settings.signLanguage) {
            onToggle('signLanguage', false);
        }
    });
};

export default {
    init,
};
