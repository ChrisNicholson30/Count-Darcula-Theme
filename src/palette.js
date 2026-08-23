/**
 * palette.js — the single source of truth for Count Darcula.
 *
 * Nothing here is a hand-picked hex value. Every colour is declared as an OKLCH
 * coordinate (lightness, chroma, hue) and rendered to sRGB at build time. Change
 * a number here and all three variants stay internally consistent.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE HYBRID, IN ONE PARAGRAPH
 *
 * One Dark is restrained: low chroma, low luminance spread, easy to sit in for
 * hours, but its reds and purples fall below WCAG AA and its foreground is dim.
 * Dracula is characterful: unmistakable hues (pink keywords, violet, acid
 * green), but its palette spans L 68 -> 96, so a line of code flickers between
 * near-white yellow and mid-tone red, and its near-white #f8f8f2 foreground is
 * glary in a dark room.
 *
 * Count Darcula keeps Dracula's HUES and One Dark's DISCIPLINE:
 *
 *   • The background is the literal perceptual midpoint of #282c34 (One Dark)
 *     and #282a36 (Dracula) -> #282b35.
 *   • Every syntax colour is pinned to L = 76 with per-hue chroma tuned so no
 *     token outshines another. Result: all eight accents land in a 6.2–6.9:1
 *     contrast band. Meaning is carried by hue, never by brightness.
 *   • Nothing is pure white and nothing is fully saturated, which is what makes
 *     a 10-hour session survivable and what keeps emitted luminance (and OLED
 *     power) down.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { oklch, alpha, mix } = require('./color.js');

/** Hue of the neutral ramp: midway between One Dark's 264° and Dracula's 277°. */
const NEUTRAL_HUE = 272;

/**
 * Accent hues. Each is a deliberate blend of the two parents, so the family
 * reads as Dracula at a glance and behaves like One Dark under the eyes.
 *
 *   role      One Dark        Dracula          Count Darcula
 *   coral     #e06c75  17°    #ff5555   24°    20°  properties, tags, errors
 *   amber     #d19a66  64°    #ffb86c   67°    64°  numbers, constants, params
 *   gold      #e5c07b  82°    #f1fa8c  113°    85°  classes, types
 *   green     #98c379 133°    #50fa7b  148°   142°  strings
 *   teal      #56b6c2 206°    #8be9fd  213°   200°  operators, regex, escapes
 *   azure     #61afef 245°    (—)             240°  functions, methods
 *   violet    #c678dd 318°    #bd93f9  302°   300°  control flow, decorators
 *   rose      (—)             #ff79c6  347°   332°  keywords, storage
 */
const HUE = {
  coral: 20,
  amber: 64,
  gold: 85,
  green: 142,
  teal: 200,
  azure: 240,
  violet: 300,
  rose: 332,
};

/** Per-hue chroma weighting. Equal OKLCH chroma does not look equally saturated;
 *  reds and violets carry more before they read as "loud", yellows and teals
 *  carry less. These multipliers even that out by eye. */
const CHROMA = {
  coral: 1.17,
  amber: 1.0,
  gold: 1.0,
  green: 1.0,
  teal: 0.91,
  azure: 1.09,
  violet: 1.13,
  rose: 1.22,
};

const VARIANTS = {
  /* ── Count Darcula ─────────────────────────────────────────── the flagship */
  dark: {
    id: 'count-darcula',
    label: 'Count Darcula',
    type: 'dark',
    // Neutral ramp. `editor` is the anchor: the midpoint of both parent themes.
    ramp: {
      deep: [0.155, 0.016], // drop shadows, deepest wells
      chrome: [0.205, 0.017], // activity bar, title bar, status bar
      surface: [0.245, 0.017], // side bar, panel, tab strip
      editor: [0.29, 0.019], // #282b35 — the editor canvas
      raised: [0.325, 0.02], // current line, hover, inactive tab
      overlay: [0.37, 0.022], // widgets, inputs, dropdowns
      line: [0.43, 0.024], // borders, selection, scrollbar
      subtle: [0.5, 0.022], // indent guides, disabled chrome
      comment: [0.665, 0.05, 268], // ── AA-compliant, still recessive
      dim: [0.76, 0.016], // secondary text
      fg: [0.88, 0.013], // #d4d7e0 — primary text (9.8:1)
      bright: [0.95, 0.008], // headings, maximum emphasis
    },
    // Syntax band: one lightness for every hue.
    accent: { L: 0.76, C: 0.115 },
    accentMuted: { L: 0.69, C: 0.1 },
    accentBright: { L: 0.855, C: 0.109 },
    accentStrong: { L: 0.68, C: 0.14 }, // squiggles, badges, ANSI
    status: {
      error: [0.7, 0.155, 22],
      warning: [0.78, 0.135, 72],
      info: [0.74, 0.12, 240],
      success: [0.74, 0.13, 145],
    },
    // Opacity of overlays; tuned per variant so they read the same over any base.
    veil: { faint: 0.06, soft: 0.1, medium: 0.16, strong: 0.26, heavy: 0.4 },
  },

  /* ── Count Darcula Nocturne ─────────────────────── true black, for OLED */
  nocturne: {
    id: 'count-darcula-nocturne',
    label: 'Count Darcula Nocturne',
    type: 'dark',
    // Every large surface is #000000 so those pixels draw no current at all.
    // Only small elements (line highlight, popups) lift off black, and the
    // whole foreground is stepped down ~8 L* versus the flagship: less emitted
    // light per glyph, less halation at night, measurably less panel power.
    ramp: {
      deep: [0, 0],
      chrome: [0, 0],
      surface: [0, 0],
      editor: [0, 0],
      raised: [0.12, 0.014],
      overlay: [0.175, 0.016],
      line: [0.245, 0.02],
      subtle: [0.38, 0.02],
      comment: [0.615, 0.05, 268],
      dim: [0.7, 0.014],
      fg: [0.8, 0.012],
      bright: [0.88, 0.008],
    },
    accent: { L: 0.7, C: 0.11 },
    accentMuted: { L: 0.635, C: 0.096 },
    accentBright: { L: 0.79, C: 0.104 },
    accentStrong: { L: 0.63, C: 0.135 },
    status: {
      error: [0.65, 0.15, 22],
      warning: [0.72, 0.13, 72],
      info: [0.68, 0.115, 240],
      success: [0.68, 0.125, 145],
    },
    veil: { faint: 0.07, soft: 0.12, medium: 0.18, strong: 0.28, heavy: 0.44 },
  },

  /* ── Count Darcula Daylight ────────────────── same hues, sunlight legible */
  daylight: {
    id: 'count-darcula-daylight',
    label: 'Count Darcula Daylight',
    type: 'light',
    // Paper, not paper-white: L 97.5 instead of 100 takes the glare edge off
    // without losing contrast, the light-mode equivalent of not using #f8f8f2.
    ramp: {
      deep: [0.9, 0.012], // title bar, activity bar
      chrome: [0.93, 0.01],
      surface: [0.955, 0.008], // side bar, panel
      editor: [0.975, 0.006], // the canvas
      raised: [0.945, 0.009], // current line, hover
      overlay: [1.0, 0.0], // popups float above the page
      line: [0.86, 0.014], // borders, selection
      subtle: [0.74, 0.018],
      comment: [0.53, 0.055, 268],
      dim: [0.46, 0.02],
      fg: [0.32, 0.022],
      bright: [0.2, 0.024],
    },
    accent: { L: 0.5, C: 0.14 },
    accentMuted: { L: 0.54, C: 0.09 },
    accentBright: { L: 0.41, C: 0.145 },
    accentStrong: { L: 0.54, C: 0.165 },
    status: {
      error: [0.52, 0.185, 25],
      warning: [0.54, 0.15, 62],
      info: [0.52, 0.15, 245],
      success: [0.51, 0.145, 148],
    },
    veil: { faint: 0.05, soft: 0.08, medium: 0.13, strong: 0.2, heavy: 0.32 },
  },
};

/** Render a ramp entry: [L, C] uses the neutral hue, [L, C, H] overrides it. */
const neutral = ([L, C, H]) => oklch(L, C, H === undefined ? NEUTRAL_HUE : H);

function buildPalette(variantKey) {
  const spec = VARIANTS[variantKey];
  if (!spec) throw new Error(`Unknown variant: ${variantKey}`);

  const ui = {};
  for (const [key, value] of Object.entries(spec.ramp)) ui[key] = neutral(value);

  const tier = ({ L, C }) => {
    const out = {};
    for (const [name, h] of Object.entries(HUE)) out[name] = oklch(L, C * CHROMA[name], h);
    return out;
  };

  const base = tier(spec.accent);
  const muted = tier(spec.accentMuted);
  const bright = tier(spec.accentBright);
  const strong = tier(spec.accentStrong);

  const status = {};
  for (const [key, value] of Object.entries(spec.status)) status[key] = oklch(...value);

  return {
    id: spec.id,
    label: spec.label,
    type: spec.type,
    variant: variantKey,
    isLight: spec.type === 'light',
    ui,
    base,
    muted,
    bright,
    strong,
    status,
    veil: spec.veil,
    /** `a(color, 'medium')` or `a(color, 0.24)` -> 8-digit hex */
    a: (hex, amount) => alpha(hex, typeof amount === 'string' ? spec.veil[amount] : amount),
    mix,
    spec,
  };
}

module.exports = { buildPalette, VARIANTS, HUE, CHROMA, NEUTRAL_HUE };
