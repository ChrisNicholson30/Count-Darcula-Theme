# Changelog

All notable changes to Count Darcula are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [1.1.0] — 2026-08-23

### Added

- **Zed support.** The same OKLCH palette in Zed's vocabulary: 139 style keys, 46 tree-sitter
  syntax captures and 8 collaborator cursors, with all three variants in one theme family.
  `zed/` is a valid Zed extension, so **Install Dev Extension** works as well as dropping the
  JSON in `~/.config/zed/themes/`.
- `src/zed-schema.js` snapshots Zed's key vocabulary from the built-in One theme. Zed ignores
  keys it doesn't recognise instead of erroring, so a typo would cost a colour and say nothing;
  the validator now checks every emitted key and reports anything left to defaults.
- The audit covers Zed too: 44 syntax captures, 21 text keys and 14 ANSI slots per variant,
  measured against the surfaces Zed actually draws them on.

### Changed

- **Repository split by editor.** `vscode/` is a self-contained, packageable extension;
  `zed/` is a Zed extension; `src/` is the shared generator both come out of. The licence and
  icon are copied into `vscode/` at build time, since `vsce` cannot reach outside the manifest
  directory — they are generated, not maintained twice.

### Fixed

- Terminal ANSI colours were never audited in either editor: the keys don't end in
  "Foreground", so the coverage pass walked straight past all sixteen. Now measured — which
  caught the light variant's bright ANSI set, where "bright" meant *more saturated* rather than
  darker and three slots sat at 3.8–4.5:1.
- `tokenColors` and `semanticTokenColors` were unaudited too. The palette pass only ever measured
  the eight base accents, so the muted tier used for doc tags, fence markers and string
  punctuation went unchecked — and on the light variant "muted" meant lighter, i.e. worse. The
  muted tier is now derived by dropping chroma rather than contrast, and passes AA on all three.
- A prototype leak in the Zed audit: `constructor` is a real tree-sitter capture, and a
  plain-object surface lookup returned `Object.prototype.constructor` for it. The same class of
  lookup in `src/coverage.js` is hardened with `Object.hasOwn`.

## [1.0.1] — 2026-08-22

### Fixed

- **31 contrast failures that the palette audit could not see.** Filled accent chips (buttons,
  activity-bar badges) carried light text on a mid-lightness fill and topped out at 2.7:1; inlay
  hints, the suggest-widget status line and code lens sat on surfaces lighter than the canvas;
  breadcrumbs, invalid list items and the status bar's error and warning chips fell short on one
  or more variants. All now meet WCAG AA on the surface they actually render on.
- Inactive line numbers were 1.90:1, nearer invisible than de-emphasised; now 3.31:1, with the
  active line number unchanged at 9.8:1.
- The fold chevron met neither text nor non-text contrast; now 4.60:1.
- Removed the background wash behind diagnostics — it lifted the canvas just enough to push the
  error and warning colours under AA, and the squiggle already carries the meaning.

### Changed

- **`npm test` no longer builds first.** Building overwrote the committed themes before
  `validate.js` could compare them, so the staleness check could never fire — it was dead in CI
  from the first commit. The order is now validate → audit, and CI re-proves it with
  `npm run build && git diff --exit-code themes/`.
- **New `src/coverage.js`.** The audit measured 51 palette swatches; the built theme has 244
  foreground keys, 40 of them alpha-composited. Coverage resolves every foreground to the surface
  it really renders on, composites alpha on both sides, and holds body text to 4.5:1, icons and
  controls to 3:1, and reports — rather than hides — the 22 deliberately de-emphasised states.
- Pinned `@vscode/vsce` to 3.9.2 in the package script instead of tracking latest, and added
  packaging to CI so a broken manifest fails the build rather than the release.

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
- 687 workbench colours per variant, covering the full editor, terminal (all 16 ANSI slots),
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
