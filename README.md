<div align="center">

<img src="assets/logo.png" width="220" alt="Count Darcula">

# Count Darcula

**A VS Code theme that takes Dracula's hues and One Dark's discipline.**

Every syntax colour sits at one perceptual lightness, every text colour passes WCAG AA,
and the true-black *Nocturne* variant cuts modelled OLED panel power by ~48%.

[Look at it](#the-three-variants) · [Install](#installation) · [Why](#why-another-dark-theme) · [Interactive preview](#preview-page)

<img src="assets/screenshot-dark.png" alt="Count Darcula in VS Code" width="900">

</div>

---

## Why another dark theme

Because both parents get one thing right and one thing wrong.

**One Dark** is calm. Low chroma, restrained, easy to sit in for hours. But its foreground
(`#abb2bf`, 6.6:1) is dim, and its red and purple land at 4.38:1 and 4.75:1 — under or barely
at WCAG AA.

**Dracula** has character. Nobody mistakes that pink for anything else. But its palette spans
**L\* 68 → 96**, so a single line of code flickers between near-white yellow and mid-tone red,
and `#f8f8f2` foreground at 13.4:1 blooms in a dark room.

Count Darcula keeps Dracula's *hues* and One Dark's *restraint*, then does the thing neither
does: it **pins every syntax colour to one perceptual lightness**.

| | canvas | lightness spread | lowest contrast | below AA |
|---|---|---|---|---|
| One Dark Pro | `#282c34` | 15.4 L\* | 4.38:1 | 1 |
| Dracula | `#282a36` | 23.5 L\* | 5.90:1 | 0 |
| **Count Darcula** | **`#282b35`** | **0.1 L\*** | **6.19:1** | **0** |

Meaning is carried by hue. Never by brightness. Nothing outshouts its neighbour, the eye stops
re-adapting every few characters, and hour nine feels like hour two.

The background is not a compromise either — `#282b35` is the literal perceptual midpoint of
`#282c34` and `#282a36`.

## The three variants

### Count Darcula

The everyday. Canvas `#282b35`, foreground `#d4d7e0` at 9.8:1 — bright enough to read, dim
enough not to glare.

<img src="assets/screenshot-dark.png" alt="Count Darcula" width="900">

### Count Darcula Nocturne

Every large surface is `#000000`, so on an OLED panel those pixels draw no current at all. The
whole foreground steps down ~8 L\* as well: less emitted light per glyph, less halation at
night, and the biggest single power saving a theme can offer.

<img src="assets/screenshot-nocturne.png" alt="Count Darcula Nocturne" width="900">

### Count Darcula Daylight

Same eight hues, re-derived for paper. `#f5f7fb` rather than pure white, because the light-mode
equivalent of not using `#f8f8f2` is not using `#ffffff`.

<img src="assets/screenshot-daylight.png" alt="Count Darcula Daylight" width="900">

## The palette

Eight hues, each a deliberate blend of the two parents, all generated at **L\* 76** with per-hue
chroma tuned so none looks louder than the others.

| | hex | role | One Dark | Dracula | contrast |
|---|---|---|---|---|---|
| 🌹 rose | `#e58ed9` | keywords, storage | `#c678dd` 318° | `#ff79c6` 347° | 6.19:1 |
| 🔮 violet | `#be9df7` | control flow, decorators | — | `#bd93f9` 302° | 6.29:1 |
| 💧 azure | `#5dbbf8` | functions, methods | `#61afef` 245° | — | 6.68:1 |
| 🕯 gold | `#d3ab54` | types, classes | `#e5c07b` 82° | `#f1fa8c` 113° | 6.54:1 |
| 🩸 coral | `#fb8c8d` | properties, tags | `#e06c75` 17° | `#ff5555` 24° | 6.21:1 |
| 🌿 green | `#86c47f` | strings | `#98c379` 133° | `#50fa7b` 148° | 6.87:1 |
| 🔥 amber | `#e4a15f` | numbers, parameters | `#d19a66` 64° | `#ffb86c` 67° | 6.43:1 |
| ⚗️ teal | `#4fc5cb` | operators, built-ins | `#56b6c2` 206° | `#8be9fd` 213° | 6.85:1 |

Plus a twelve-step neutral ramp on a single hue (272°, midway between One Dark's 264° and
Dracula's 277°) — `#14171f` activity bar, `#1d2029` side bar, `#282b35` canvas, `#8693b3`
comments, `#d4d7e0` foreground, `#eceef4` emphasis.

### Colour means one thing everywhere

Learn it once and every file reads the same way — TypeScript, Rust, Python, YAML, CSS:

```
rose    keywords & storage        the shape of the program (if, class, fn)
violet  flow & metaprogramming    return, await, decorators, macros
azure   things you call           functions, methods, ids
gold    things you instantiate    classes, types, interfaces, components
coral   things you address        properties, keys, tags, selectors
green   literal text              strings
amber   literal values            numbers, constants, parameters
teal    machinery                 operators, escapes, regex, built-ins
fg      your own variables        the default, and deliberately the quietest
```

Italics are used only where slant carries information colour cannot: comments, parameters,
`this`/`self`, type parameters, HTML attributes, markdown emphasis. **Not** on keywords — at
13px, slanted keywords on every other line are exactly the kind of low-grade friction that adds
up over a day. There's a snippet below if you disagree.

## Installation

### From the Marketplace

1. <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> (<kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> on macOS)
2. Search **Count Darcula**, hit **Install**
3. <kbd>Ctrl</kbd>+<kbd>K</kbd> <kbd>Ctrl</kbd>+<kbd>T</kbd> and pick a variant

### From source

```bash
git clone https://github.com/ChrisNicholson30/Count-Darcula-Theme.git
cd Count-Darcula-Theme
npm test    # build + validate + audit — no dependencies, nothing to install

# macOS / Linux
ln -s "$PWD" ~/.vscode/extensions/count-darcula

# Windows (PowerShell)
# New-Item -ItemType SymbolicLink -Path "$HOME\.vscode\extensions\count-darcula" -Target $PWD
```

Then **Developer: Reload Window**, and pick the theme.

### As a VSIX

```bash
npm run package
```

Then **Extensions ▸ ⋯ ▸ Install from VSIX…**

(Publishing it to the Marketplace yourself: [docs/PUBLISHING.md](docs/PUBLISHING.md).)

### Settings worth having

Follow the system, dark by night and light by day:

```jsonc
{
  "workbench.preferredDarkColorTheme": "Count Darcula",
  "workbench.preferredLightColorTheme": "Count Darcula Daylight",
  "window.autoDetectColorScheme": true
}
```

The rest of the setup this theme was designed against:

```jsonc
{
  "editor.fontFamily": "JetBrains Mono, SF Mono, Menlo, Consolas, monospace",
  "editor.fontSize": 13.5,
  "editor.lineHeight": 1.6,
  "editor.semanticHighlighting.enabled": true,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",

  // the terminal ANSI set is already >= 4.5:1, so let it through untouched
  "terminal.integrated.minimumContrastRatio": 1
}
```

Want italic keywords after all:

```jsonc
{
  "editor.tokenColorCustomizations": {
    "[Count Darcula*]": {
      "textMateRules": [
        { "scope": ["keyword", "storage"], "settings": { "fontStyle": "italic" } }
      ]
    }
  }
}
```

## Accessibility

Every text colour is measured against **WCAG 2.1** contrast and **APCA Lc** — which models
light-on-dark text far better than WCAG 2.x does, and a dark theme is nothing but light-on-dark
text. `npm run audit` fails the build if any colour drops below AA on the surface it actually
renders on.

```
✓ all 51 text colours meet WCAG AA (>= 4.5:1) on their own surfaces
  syntax band: contrast 6.19–6.87:1 (spread 0.68), lightness 75.9–76.1 L*
```

Comments are held above AA too, at 4.60:1. A comment is still text, and a comment nobody can
read is a comment nobody maintains — the recession comes from lower chroma and italics, not
from making it dim.

Full per-colour numbers for all three variants: **[docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)**.

## Battery

On an OLED/AMOLED panel each subpixel emits its own light, so panel power follows the image.
Using the standard per-channel model (Dong, Choi & Zhong, DAC 2009 — blue weighted 1.56× green,
because blue emitters are the least efficient) applied to a modelled full-screen VS Code window:

| theme | modelled panel power |
|---|---|
| **Count Darcula Nocturne** | **51.5%** |
| Default Dark+ | 77.4% |
| One Dark Pro | 83.7% |
| **Count Darcula** | **100%** (baseline) |
| Dracula | 121% |
| A stock light theme | 1347% |

Nocturne draws **48.5% less than the flagship** and **57.4% less than Dracula** on that model.
The flagship itself sits 21% below Dracula but 16% *above* One Dark — that is the honest cost of
a foreground bright enough to read at 9.8:1, and it is why Nocturne exists.

**What this will not do:** on a conventional LCD the backlight is on at the set brightness
regardless of content, so a dark theme saves essentially nothing directly. The real win there is
indirect — a dimmer image is comfortable at a lower brightness setting, and backlight power
scales steeply with brightness.

These are modelled figures, not measurements of your laptop. The model lives in
[`src/power.js`](src/power.js); read it and disagree with it.

## Preview page

[`preview.html`](preview.html) is a self-contained showcase: a live VS Code mockup in six
languages, a variant switcher that re-themes the whole page, the palette with measured contrast,
the lightness-spread comparison against both parents, the power chart, and install instructions.
No build step, no network requests, no dependencies.

- **Locally:** `open preview.html` (or just double-click it)
- **Rendered from GitHub:** [htmlpreview.github.io](https://htmlpreview.github.io/?https://raw.githubusercontent.com/ChrisNicholson30/Count-Darcula-Theme/main/preview.html)
- **GitHub Pages:** enable Pages for this repo (Settings ▸ Pages ▸ deploy from `main`), then
  `https://chrisnicholson30.github.io/Count-Darcula-Theme/preview.html`

## How it's built

No colour in this repository is hand-picked. Every value is declared as an OKLCH coordinate —
perceptually uniform, so "same lightness" actually means same *apparent* lightness — and
rendered to sRGB at build time.

```
src/palette.js     the single source of truth: OKLCH coordinates for all three variants
src/color.js       sRGB ⇄ OKLab ⇄ OKLCH, WCAG 2.1 contrast, APCA 0.1.9 Lc  (no dependencies)
src/workbench.js   690 UI colours per variant, derived from the palette
src/terminal.js    the terminal, including the 16 ANSI slots
src/syntax.js      124 TextMate rules + 47 semantic tokens, built from a role table
src/power.js       the OLED power model
src/build.js       renders themes/*.json
src/validate.js    malformed values, illegal fontStyle, shadowed scopes, src ⇄ themes drift
src/audit.js       contrast + power report; non-zero exit if anything drops below AA
src/preview.js     regenerates the data baked into preview.html
```

```bash
npm run build      # regenerate themes/*.json
npm test           # build + validate + audit
npm run audit      # write docs/ACCESSIBILITY.md
npm run preview    # refresh preview.html from the palette
```

Change one number in `src/palette.js` and all three variants stay consistent, the audit
re-measures itself, and the preview page cannot drift from the theme it is advertising.

The generated `themes/*.json` are committed, so the extension works with no build step.
If you change `src/`, run `npm run build` and commit the result — `npm test` fails otherwise.

## Credits

Standing on two very good themes:

- [**One Dark Pro**](https://binaryify.github.io/OneDark-Pro/) by Binaryify, itself after Atom's One Dark
- [**Dracula**](https://draculatheme.com/visual-studio-code) by Zeno Rocha and contributors

Count Darcula is an independent work — not affiliated with or endorsed by either project. Their
palettes are quoted here only for comparison.

## Licence

[MIT](LICENSE).
