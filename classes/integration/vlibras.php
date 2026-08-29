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

namespace local_a11y\integration;

/**
 * Everything specific to the third-party `local_vlibras` plugin (Moodle
 * Marketplace, github.com/gfariasonline/moodle-local_vlibras) lives here and
 * only here - no other file in this plugin references its component name,
 * its config keys, or its DOM markup. The intent (per the project owner) is
 * that adding a *different* third-party integration later never means
 * touching this class or re-auditing every file that happens to know about
 * VLibras today - only adding a sibling class next to this one.
 *
 * What "integrated" means here, precisely (D54): local_vlibras is installed
 * (`core_plugin_manager`), its own widget is switched on via its own
 * `local_vlibras/enabled` setting, AND this plugin's own admin setting
 * (`local_a11y/integratevlibras`) is also on. All three, not just presence -
 * see is_integrated() below for why each one matters independently.
 *
 * @package    Moodle
 * @subpackage Plugin a11y
 * @author     Rodrigo Padilha Silveira <padilhars@gmail.com>
 * @author     Jerônimo Medina Madruga <jeronimo.madruga@gmail.com>
 * @copyright  Universidade Federal de Pelotas - UFPel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      0.1.0
 */
class vlibras {
    /** @var string The third-party plugin's frankenstyle component name. */
    const COMPONENT = 'local_vlibras';

    /**
     * The actual visible VLibras floating button's shadow-DOM host element.
     *
     * This was wrong once already (D56) - the original guess was `[vw]`,
     * local_vlibras's own hardcoded PHP shell (`<div vw class="enabled">`),
     * reasoned about only by reading local_vlibras's PHP source, never by
     * inspecting the live DOM after vlibras-plugin.js actually runs. Hiding
     * `[vw]` did nothing visible, because it isn't where the button lives:
     * the remote script builds the real, interactive button entirely
     * inside an **open shadow root** attached to a *separate* element,
     * `#vlibras-access-wrapper` (a direct child of `<body>`, unrelated to
     * `[vw]`) - confirmed live via `el.shadowRoot !== null` from ordinary
     * page script (only possible for an *open* shadow root; a closed one
     * would read back null from outside) and by reading its
     * `shadowRoot.innerHTML` directly: `<div id="vlibras-access">` wrapping
     * `<button id="vlibras-button">`, styled by a `<style>` tag that also
     * lives *inside* the shadow root, completely inaccessible to any
     * selector in this plugin's own stylesheet - shadow DOM is designed
     * precisely to be unreachable this way, by spec, not a Moodle or
     * VLibras quirk.
     *
     * The fix works anyway, for a structural reason: CSS in the light DOM
     * cannot select *into* an open shadow tree, but it can absolutely
     * hide the *host* element itself (`display: none` on
     * `#vlibras-access-wrapper`) - a hidden host element renders nothing
     * in its shadow tree either, the same way `display: none` on any
     * element hides its children. No need to reach inside at all.
     *
     * `[vw]` was not a wrong observation, just an irrelevant one for
     * hiding purposes - it's real, it's still emitted by local_vlibras's
     * own PHP, and the remote script probably still reads config off it
     * (D54's WIDGET_SELECTOR docblock reasoning about *that* element being
     * plugin-controlled and stable was correct) - it's just not the
     * button. Left below as VW_MARKER_SELECTOR, unused by any hiding rule
     * now, kept only as a documented "this exists, this is not what you
     * want" landmark for whoever debugs this next.
     *
     * Fragility this creates, worth being explicit about: unlike `[vw]`,
     * `#vlibras-access-wrapper` is *entirely* vlibras.gov.br's own choice
     * of id, not local_vlibras's - the exact scenario the original brief
     * asked to plan for (investigate first, degrade gracefully if the
     * remote script's markup changes, never break access to Libras
     * entirely). See amd/src/vlibras_integration.js's own runtime check
     * for the graceful-degradation half of that.
     *
     * @var string
     */
    const WIDGET_SELECTOR = '#vlibras-access-wrapper';

    /**
     * local_vlibras's own hardcoded PHP shell (`<div vw class="enabled">`).
     * Real, plugin-controlled, stable - but not where the visible button
     * lives (see WIDGET_SELECTOR's docblock for the full story of finding
     * that out the hard way). Not used by any hiding rule; kept only as a
     * documented landmark.
     *
     * @var string
     */
    const VW_MARKER_SELECTOR = '[vw]';

    /**
     * The id of the actual clickable button inside WIDGET_SELECTOR's shadow
     * root (`hostElement.shadowRoot.getElementById(OPEN_BUTTON_ID)`) - what a
     * real user clicks to open VLibras' own avatar/interpreter interface.
     *
     * D57: revealing WIDGET_SELECTOR via CSS alone (the original D54/D56
     * design) only ever showed the *idle* button - it never actually opened
     * the avatar the way a real click does, because CSS can change display
     * but cannot dispatch a click event. Confirmed live (Puppeteer) that
     * calling .click() on this exact button element triggers VLibras' own
     * click handler and opens the same avatar a manual click would. This is
     * not a DOM mutation, just a synthetic interaction on an element VLibras
     * itself built and wired up to be clicked, so it does not conflict with
     * this class's "never touch their DOM" hiding constraint - that
     * constraint is about how the button is hidden, not about whether their
     * own public click handlers can ever be invoked programmatically.
     *
     * Only reachable from JS (amd/src/vlibras_integration.js) - PHP has no
     * way to interact with a client-side shadow root - kept here anyway so
     * this class stays the single documented source of truth for every
     * VLibras DOM detail this plugin depends on.
     *
     * @var string
     */
    const OPEN_BUTTON_ID = 'vlibras-button';

    /**
     * The shadow-DOM host VLibras itself creates (as a direct <body> child,
     * separate from WIDGET_SELECTOR) the first time OPEN_BUTTON_ID is
     * clicked - it holds the actual avatar/interpreter UI in its own open
     * shadow root. Does not exist in the DOM at all until the first
     * successful open click on a given page load.
     *
     * @var string
     */
    const APP_ROOT_SELECTOR = '#vlibras-app-root';

    /**
     * The `aria-label` (matched case-insensitively) of the button inside
     * APP_ROOT_SELECTOR's shadow root that closes the avatar interface -
     * confirmed live to be "Fechar" (Portuguese for "Close"). VLibras does
     * not appear to expose a stable id or class for it, only this label, in
     * whichever language its own UI happens to be rendered in at the time -
     * see amd/src/vlibras_integration.js for what happens if this label
     * ever stops matching anything (never an error, never leaves the user
     * stuck: styles.css also force-hides APP_ROOT_SELECTOR by CSS whenever
     * the integration is on but signLanguage is off, as a backstop that
     * does not depend on this label at all).
     *
     * @var string
     */
    const CLOSE_BUTTON_ARIA_LABEL = 'fechar';

    /**
     * Whether local_vlibras is installed on this site, regardless of
     * whether its own widget is currently switched on. Deliberately uses
     * `core_plugin_manager` rather than a file_exists()/directory check -
     * see DECISIONS.md D54 for why a path check would be wrong here (an
     * installed-but-not-upgraded plugin, or one present on disk but never
     * actually installed into the DB, both need to read as "not usable"
     * here, and only the plugin manager actually knows the difference).
     *
     * Used to decide whether *this plugin's own* admin setting for the
     * integration should even be shown - the setting only makes sense to
     * offer once local_vlibras exists to integrate with.
     *
     * @return bool
     */
    public static function is_installed(): bool {
        return \core_plugin_manager::instance()->get_plugin_info(self::COMPONENT) !== null;
    }

    /**
     * Whether local_vlibras is installed AND its own widget is currently
     * switched on (its own `local_vlibras/enabled` setting).
     *
     * `\core\plugininfo\base::is_enabled()` is deliberately NOT used here,
     * even though the brief asks for a `core_plugin_manager`-based check:
     * Moodle's generic plugin-enable mechanism only exists for plugin
     * types that support being disabled as a *type* (mod, block, enrol,
     * ...) - `core\plugininfo\local` never overrides it, so
     * `plugin_manager::get_enabled_plugins('local')` always returns null
     * for every local plugin, and the inherited `is_enabled()` always
     * returns null for one too (confirmed by reading
     * lib/classes/plugininfo/{base,local}.php directly, not assumed) -
     * `null` is falsy, so a naive `if ($info->is_enabled())` would always
     * evaluate false and permanently disable this integration even with
     * local_vlibras fully installed and its widget on. `core_plugin_manager`
     * is still the right tool for the *installed* half of the question
     * (is_installed() above); "enabled" for a plugin with no native
     * disable mechanism can only mean what that specific plugin's own
     * config says, so that's what this reads instead.
     *
     * @return bool
     */
    public static function is_available(): bool {
        if (!self::is_installed()) {
            return false;
        }
        return (bool) get_config(self::COMPONENT, 'enabled');
    }

    /**
     * Whether this plugin's own admin setting to integrate with VLibras
     * (hide their floating button, offer access through our own panel
     * instead) is switched on. Independent of is_available() - an admin
     * can leave this off even with local_vlibras fully active, in which
     * case VLibras' own button just shows on its own, untouched, exactly
     * as it would with local_a11y not installed at all.
     *
     * @return bool
     */
    public static function integration_enabled(): bool {
        return (bool) get_config('local_a11y', 'integratevlibras');
    }

    /**
     * Whether the `signLanguage` option should exist at all right now -
     * both that there is something to integrate with (is_available()) and
     * that the admin actually wants the integration (integration_enabled()).
     * If either is false, the option has nothing to do (there's no VLibras
     * button to reveal/hide, or the admin chose to leave VLibras' own
     * button alone) so it shouldn't be offered in the panel - see
     * classes/options.php.
     *
     * @return bool
     */
    public static function is_integrated(): bool {
        return self::is_available() && self::integration_enabled();
    }

    /**
     * Detects a likely corner collision between our own FAB
     * (`local_a11y/fabposition`, one of 4 corners/edges) and VLibras' own
     * widget position (`local_vlibras/position`, one of 8 compass points).
     * Approximate by design (see DECISIONS.md D54): this compares admin
     * *settings*, not measured on-screen pixels - VLibras' actual footprint
     * varies by avatar and browser, and nothing here tries to model that.
     * A false negative (misses a real visual overlap) is possible; a false
     * positive (warns when there'd have been enough room in practice) is
     * the safer direction to err in for a warning, so the corner buckets
     * below are intentionally coarse rather than exact.
     *
     * Only meaningful when is_available() is true and integration_enabled()
     * is false - if the integration is on, VLibras' button is hidden by
     * CSS and there is nothing to collide with; see settings.php for where
     * this is actually surfaced.
     *
     * @return bool True if VLibras' configured position maps to the same corner/edge as ours.
     */
    public static function has_position_collision(): bool {
        if (!self::is_available()) {
            return false;
        }
        $ourposition = (string) (get_config('local_a11y', 'fabposition') ?: 'bottom-right');
        $theirposition = (string) (get_config(self::COMPONENT, 'position') ?: 'R');

        // VLibras' 8-way compass position mapped onto the nearest of our 4
        // corner/edge buckets. 'T'/'B' (plain top/bottom centre) have no
        // left/right side at all, so they never match any of ours.
        $map = [
            'TL' => null, 'T' => null, 'TR' => null,
            'R' => 'middle-right',
            'BR' => 'bottom-right',
            'B' => null,
            'BL' => 'bottom-left',
            'L' => 'middle-left',
        ];
        $theirbucket = $map[$theirposition] ?? null;

        return $theirbucket !== null && $theirbucket === $ourposition;
    }
}
