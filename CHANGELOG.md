# Changelog

All notable changes to `local_a11y` are documented here.

## [Unreleased]

### Added

- Text Alignment (D30) and Face Navigation (head-tracking virtual cursor) shipped after 0.1.0 but were never logged here: 22 → 24 options. Face Navigation is part of the original prototype's option set (`_design-reference/a11y-data.jsx` has always had 23 entries) but wasn't implemented yet at the 0.1.0 cut; Text Alignment has no prototype equivalent at all - the first fully-new option beyond the prototype's 23.
- 4 more new accessibility options this round: Silence Media, Word Spacing, Blue Light Filter, Magnifier (24 → 28 options total).
- Optional, off-by-default aggregate usage-statistics counters (`local_a11y_stats` table - one row per option, no user/session/course/IP data ever recorded), a new admin setting ("Collect usage statistics") and a report page (`admin/stats.php`) protected by the new `local/a11y:viewstats` capability (manager archetype by default). See DECISIONS.md D47.

### Changed

- Hide Images now hides fully (`display: none`), no reserved-space placeholder badge.
- Silence Media no longer pauses `<video>` (only mutes it) - Pause Animations already does that; the two no longer duplicate each other.
- Privacy: the plugin now has one database table (see "Added" above) - it is 100% aggregate/anonymous, so the Privacy API declaration is unaffected (nothing personal to declare).

### Fixed

- Toggle-option rows now show a pointer cursor across their whole clickable area, not just the switch.
- Magnifier: fixed a pointer/content misalignment caused by removing (instead of same-size-placeholding) `<iframe>`/`<video>`/`<audio>` elements from its internal clone.
- Magnifier: fixed the *actual* root cause of a pointer/content misalignment that the previous fix only partly addressed - `#page`'s own padding (varies per page/layout) wasn't being copied onto the internal clone, so every magnified point was off by exactly that padding, horizontally or vertically depending on the page. See DECISIONS.md D49.
- `tests/behat/local_a11y.feature`: fixed two bugs found the first time this scenario was actually executed against a real browser (it never had been before) - a stray click that closed the already-open Typography category before trying to click an option inside it, and an assertion hardcoded to a Portuguese string ("Médio") against a test site whose default language is English ("Medium"). Both scenarios now pass for real.

### Testing / docs

- Full suite run: PHPUnit (20/20), Behat (`@local_a11y`, 2/2, first successful real-browser run - the Selenium/chromedriver environment from initial development was never completed), `moodlehq/moodle-cs` phpcs (`moodle` standard - 20 auto-fixable whitespace/brace errors fixed; pervasive `@description`/`@version` docblock tags and the lang files' by-section string ordering are known, deliberate deviations from the Moodle standard, left as-is), and an axe-core scan (0 violations with the panel open and every category expanded; combined-effects scan with Magnifier/Silence Media/Blue Light Filter/Word Spacing/Contrast level 3 active found one pre-existing serious color-contrast finding on Moodle core's own dashboard "course overview" block under Contrast level 3 - not part of this plugin's own UI, not fixed here, same class of issue as D35/D36).
- Regenerated phpDocumentor/JSDoc/KSS docs under `docs/`.
- Corrected a long-standing option-count inconsistency: this file said 22 for 0.1.0 while README/panel/lang already said 24 - see the "Added" entries above for the full 22 → 24 → 28 trail, and DECISIONS.md D30's correction (it had mis-stated the prototype's own option count).

## [0.1.0] - 2026-07-24

Initial release.

### Added

- Floating accessibility button (FAB) and panel, rendered on every page via the Hooks API.
- 22 accessibility options across 5 collapsible categories (Text & Typography, Color & Contrast, Media & Motion, Focus & Navigation, Advanced).
- 9 one-click accessibility profiles (Low Vision, Color Blind, Dyslexia, ADHD/Focus, Senior, Epilepsy, Motor Impairment, Cognitive, Night Mode).
- Live search across options, active-option counter, reset-all, `Alt+A` global keyboard shortcut, WCAG 2.2 focus trap.
- Persistence via Moodle user preferences for logged-in users, `localStorage` for guests with automatic migration on first login, no-FOUC bootstrap.
- Advanced features: text-to-speech screen reader overlay, on-screen virtual keyboard (pt-BR accents), voice commands (Web Speech API with graceful fallback), reading guide and reading mask.
- Locally-packaged Atkinson Hyperlegible and Lexend web fonts (no external CDN dependency).
- SVG colour-blindness simulation filters (protanopia/deuteranopia/tritanopia).
- Site administration settings: enable switch, guest visibility, excluded-page patterns, per-option enable list, FAB position/icon/shape, panel format/density, accent colour.
- Capability `local/a11y:view`.
- Privacy API provider (user preference only, no database tables).
- PHPUnit tests for the settings manager and privacy provider; Behat feature file; axe-core accessibility regression scan (0 critical/serious violations).

### Notes

- Requires Moodle 5.0+.
- No external runtime dependencies.
