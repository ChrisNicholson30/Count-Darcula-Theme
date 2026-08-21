/**
 * power.js — display power estimation for the theme variants.
 *
 * WHAT THIS IS
 * On an OLED/AMOLED panel each subpixel emits its own light, so panel power is
 * a function of the image being shown. The standard model (Dong, Choi & Zhong,
 * "Power modeling of graphical user interfaces on OLED displays", DAC 2009) is
 * a per-channel sum that is linear in linear-light intensity:
 *
 *     P(pixel) = beta_R * R_lin + beta_G * G_lin + beta_B * B_lin
 *
 * with blue by far the least efficient emitter. We use beta = (1.00, 0.86,
 * 1.56) normalised so full white = 1.0. Numbers below are therefore a *model*,
 * not a measurement of your laptop — but the ranking and rough magnitudes hold
 * across every published OLED measurement study, and it is the model used to
 * justify the design decisions in this theme (no pure white, no fully
 * saturated blues, true-black variant).
 *
 * WHAT THIS IS NOT
 * On a conventional LCD the backlight is always on at the set brightness and
 * panel power is essentially independent of content. A dark theme saves ~0% on
 * an LCD directly. The indirect saving is real but user-mediated: a dimmer
 * image is comfortable at a lower brightness setting, and backlight power
 * scales steeply with brightness.
 */

'use strict';

const { hexToRgb, srgbToLinear } = require('./color.js');

const BETA = { r: 1.0, g: 0.86, b: 1.56 };
const NORM = BETA.r + BETA.g + BETA.b;

/** Relative OLED power for one solid colour, 0 (black) .. 1 (white). */
function pixelPower(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return (BETA.r * r + BETA.g * g + BETA.b * b) / NORM;
}

/**
 * A model VS Code window, as fractions of total screen area. Roughly matches a
 * maximised 16:10 window with the side bar open, an integrated terminal at the
 * bottom, and the minimap on.
 */
const LAYOUT = [
  { area: 0.6, surface: 'editor' },
  { area: 0.13, surface: 'surface' }, // side bar
  { area: 0.09, surface: 'surface' }, // panel / terminal
  { area: 0.05, surface: 'surface' }, // tab strip + breadcrumbs
  { area: 0.04, surface: 'chrome' }, // activity bar
  { area: 0.03, surface: 'chrome' }, // status bar
  { area: 0.06, surface: 'editor' }, // minimap
];

/** Share of the editor canvas actually covered by glyph ink at a typical
 *  14px/1.5 line height with average line length. Measured by rasterising a
 *  page of TypeScript: ~10%. */
const INK_COVERAGE = 0.1;

/** How that ink is distributed across token roles in real source files. */
const INK_MIX = [
  ['fg', 0.4],
  ['comment', 0.12],
  ['string', 0.1],
  ['keyword', 0.09],
  ['function', 0.08],
  ['property', 0.07],
  ['type', 0.05],
  ['number', 0.05],
  ['operator', 0.04],
];

/**
 * @param {object} frame surfaces + token colours, all opaque hex
 *        { editor, surface, chrome, fg, comment, string, keyword, function,
 *          property, type, number, operator }
 * @returns {number} relative full-screen OLED power, 0..1
 */
function screenPower(frame) {
  let total = 0;
  for (const { area, surface } of LAYOUT) {
    const bg = pixelPower(frame[surface]);
    if (surface === 'editor') {
      let ink = 0;
      for (const [role, share] of INK_MIX) ink += share * pixelPower(frame[role] || frame.fg);
      total += area * ((1 - INK_COVERAGE) * bg + INK_COVERAGE * ink);
    } else {
      // Chrome is mostly flat fill with sparse labels; model 4% ink at fg.
      total += area * (0.96 * bg + 0.04 * pixelPower(frame.fg));
    }
  }
  return total;
}

module.exports = { pixelPower, screenPower, BETA, LAYOUT, INK_COVERAGE, INK_MIX };
