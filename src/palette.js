/**
 * palette.js — the single source of truth for Count Darcula.
 *
 * Nothing here is a hand-picked hex value. Every colour is declared as an OKLCH
 * coordinate (lightness, chroma, hue) and rendered to sRGB at build time. Change
 * a number here and both variants stay internally consistent.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE IDENTITY, IN ONE PARAGRAPH
 *
 * A midnight canvas with a wine undertone, lit by eight saturated accents and
 * led by one electric colour, Volt. Three rules make it comfortable as well as
 * vivid:
 *
 *   • One lightness for every syntax colour. Each accent sits at the same OKLCH
 *     L, so a line of code never flickers between loud and quiet tokens —
 *     meaning is carried by hue, never by brightness.
 *   • Chroma is spent, not rationed. Each accent is pushed to the edge of the
 *     sRGB gamut at that lightness (see `oklch()` in color.js), which is where
 *     the vibrancy comes from without anything getting brighter.
 *   • Nothing is pure white and nothing is pure black. The foreground stops at
 *     L 90, the canvas at L 23, and every text colour still clears WCAG AA.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { oklch, alpha, mix } = require('./color.js');

/**
 * The eight accents, one per slice of the wheel, and the role each plays.
 * The names are the palette's own; they are what the README and the website use.
 *
 *   name       hue   syntax role                        also
 *   ember       35°  operators, escapes, built-ins      ANSI red
 *   tangerine   68°  types, classes, namespaces         search matches
 *   citrine    110°  functions, methods                 ANSI yellow, modified
 *   mint       162°  strings                            ANSI green
 *   volt       205°  keywords — the signature colour    ANSI cyan, focus, accents
 *   cobalt     258°  properties, tags, links            ANSI blue
 *   iris       295°  booleans, preprocessor, pseudo     selection
 *   orchid     345°  numbers, constants, parameters     ANSI magenta
 */
const HUE = {
  ember: 35,
  tangerine: 68,
  citrine: 110,
  mint: 162,
  volt: 205,
  cobalt: 258,
  iris: 295,
  orchid: 345,
};

/** Per-hue chroma weighting. Equal OKLCH chroma does not look equally saturated:
 *  yellow and cyan read loud early, blue and violet late. Anything asked for
 *  beyond the gamut is trimmed back to its edge by `oklch()`. */
const CHROMA = {
  ember: 1.0,
  tangerine: 0.95,
  citrine: 1.0,
  mint: 0.9,
  volt: 0.9,
  cobalt: 1.1,
  iris: 1.1,
  orchid: 1.0,
};

const VARIANTS = {
  /* ── Count Darcula Dark ─────────────────────────────────────────────── */
  dark: {
    id: 'count-darcula-dark',
    label: 'Count Darcula Dark',
    type: 'dark',
    // Midnight with a wine undertone: hue 335, chroma just high enough to warm
    // the greys without reading as red.
    neutralHue: 335,
    ramp: {
      deep: [0.15, 0.014], // drop shadows, deepest wells
      chrome: [0.19, 0.016], // title bar, status bar
      surface: [0.21, 0.017], // panels, tab strip, terminal
      editor: [0.235, 0.018], // the editor canvas
      raised: [0.275, 0.02], // current line, hover
      overlay: [0.305, 0.022], // popovers, inputs
      line: [0.38, 0.024], // borders, selection
      subtle: [0.47, 0.022], // guides, disabled chrome
      comment: [0.66, 0.045, 320], // AA-compliant, still recessive
      dim: [0.76, 0.014], // secondary text
      fg: [0.9, 0.012], // primary text
      bright: [0.96, 0.006], // headings, maximum emphasis
    },
    // Syntax band: one lightness for every hue.
    accent: { L: 0.78, C: 0.16 },
    accentMuted: { L: 0.68, C: 0.13 },
    accentBright: { L: 0.86, C: 0.14 },
    status: {
      error: [0.7, 0.19, 22],
      warning: [0.8, 0.16, 82],
      info: [0.76, 0.13, 240],
      success: [0.78, 0.17, 150],
    },
    // Opacity of overlays; tuned per variant so they read the same over any base.
    veil: { faint: 0.06, soft: 0.1, medium: 0.16, strong: 0.26, heavy: 0.4 },
  },

  /* ── Count Darcula Light ────────────────────────────────────────────── */
  light: {
    id: 'count-darcula-light',
    label: 'Count Darcula Light',
    type: 'light',
    // Warm porcelain, not paper-white: L 97.5 takes the glare edge off without
    // costing contrast. The accents drop to one darker band of the same hues.
    neutralHue: 60,
    ramp: {
      deep: [0.9, 0.01], // title bar, status bar
      chrome: [0.93, 0.009],
      surface: [0.955, 0.008], // panels
      editor: [0.975, 0.006], // the canvas
      raised: [0.945, 0.01], // current line, hover
      overlay: [1.0, 0.0], // popovers float above the page
      line: [0.86, 0.014], // borders, selection
      subtle: [0.74, 0.016],
      comment: [0.53, 0.05, 320],
      dim: [0.45, 0.016],
      fg: [0.29, 0.02],
      bright: [0.18, 0.022],
    },
    accent: { L: 0.5, C: 0.2 },
    accentMuted: { L: 0.56, C: 0.13 },
    accentBright: { L: 0.42, C: 0.19 },
    status: {
      error: [0.52, 0.2, 25],
      warning: [0.53, 0.14, 65],
      info: [0.5, 0.16, 250],
      success: [0.5, 0.15, 150],
    },
    veil: { faint: 0.05, soft: 0.08, medium: 0.13, strong: 0.2, heavy: 0.32 },
  },
};

function buildPalette(variantKey) {
  const spec = VARIANTS[variantKey];
  if (!spec) throw new Error(`Unknown variant: ${variantKey}`);

  /** Render a ramp entry: [L, C] uses the neutral hue, [L, C, H] overrides it. */
  const neutral = ([L, C, H]) => oklch(L, C, H === undefined ? spec.neutralHue : H);

  const ui = {};
  for (const [key, value] of Object.entries(spec.ramp)) ui[key] = neutral(value);

  const tier = ({ L, C }) => {
    const out = {};
    for (const [name, h] of Object.entries(HUE)) out[name] = oklch(L, C * CHROMA[name], h);
    return out;
  };

  const status = {};
  for (const [key, value] of Object.entries(spec.status)) status[key] = oklch(...value);

  return {
    id: spec.id,
    label: spec.label,
    type: spec.type,
    variant: variantKey,
    isLight: spec.type === 'light',
    ui,
    base: tier(spec.accent),
    muted: tier(spec.accentMuted),
    bright: tier(spec.accentBright),
    status,
    veil: spec.veil,
    /** `a(color, 'medium')` or `a(color, 0.24)` -> 8-digit hex */
    a: (hex, amount) => alpha(hex, typeof amount === 'string' ? spec.veil[amount] : amount),
    mix,
    spec,
  };
}

module.exports = { buildPalette, VARIANTS, HUE, CHROMA };
