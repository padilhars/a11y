# Changelog

All notable changes to `local_a11y` are documented here.

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
