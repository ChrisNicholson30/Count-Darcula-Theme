# Changelog

All notable changes to Count Darcula are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-08-21

First release.

### Added

- **Count Darcula** — the flagship dark variant. Canvas `#282b35`, the perceptual midpoint of
  One Dark's `#282c34` and Dracula's `#282a36`.
- **Count Darcula Nocturne** — true-black variant for OLED panels. Every large surface is
  `#000000` and the foreground steps down ~8 L\*; ~48.5% less modelled panel power than the
  flagship.
- **Count Darcula Daylight** — light variant on the same eight hues, at `#f5f7fb` rather than
  pure white.
- 690 workbench colours per variant, covering the full editor, terminal (all 16 ANSI slots),
  diffs, merge editor, notebooks, testing, debug, peek views, inlay hints, ghost text, bracket
  pair colourisation and the command centre.
- 124 TextMate rules and 47 semantic token colours, built from a single role table so colour
  means the same thing in every language.
- Generated entirely from OKLCH coordinates in `src/palette.js`: every syntax colour sits at one
  perceptual lightness (L\* 76 in the flagship, spread 0.1), landing all eight accents in a
  6.19–6.87:1 contrast band.
- `npm test` — builds, validates structure, and audits contrast; fails if any of the 51 text
  colours drops below WCAG AA on the surface it renders on.
- `preview.html` — self-contained showcase with a live variant switcher, six language samples,
  measured palette, lightness-spread comparison against both parents, and install instructions.
