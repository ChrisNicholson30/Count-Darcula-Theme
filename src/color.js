/**
 * color.js — dependency-free colour science used to derive the Count Darcula palette.
 *
 * Everything in this theme is generated from OKLCH coordinates rather than being
 * hand-picked in hex. OKLCH is perceptually uniform, which is what lets us make
 * two guarantees that hex-picking cannot:
 *
 *   1. Every syntax colour sits at the *same* perceptual lightness (L), so no
 *      token visually "shouts" louder than its neighbours. Hue carries meaning;
 *      brightness does not. That is the single biggest contributor to comfort
 *      over a long session.
 *   2. Contrast is measured, not guessed. Every generated colour is audited
 *      against WCAG 2.1 and APCA (see src/audit.js).
 *
 * Implements: sRGB <-> linear, sRGB <-> OKLab <-> OKLCH (Bjorn Ottosson, 2020),
 * WCAG 2.1 relative luminance/contrast, and APCA 0.1.9 lightness contrast (Lc).
 */

'use strict';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** sRGB 8-bit channel -> linear-light 0..1 */
function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** linear-light 0..1 -> sRGB 8-bit channel (gamut-clipped) */
function linearToSrgb(c) {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return clamp(Math.round(v * 255), 0, 255);
}

function hexToRgb(hex) {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0')).join('');
}

function oklabToHex(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return rgbToHex(
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  );
}

function hexToOklab(hex) {
  const [r8, g8, b8] = hexToRgb(hex);
  const r = srgbToLinear(r8);
  const g = srgbToLinear(g8);
  const b = srgbToLinear(b8);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/**
 * OKLCH -> hex.
 * @param {number} L lightness 0..1
 * @param {number} C chroma (0 = grey, ~0.37 = most saturated sRGB can hold)
 * @param {number} H hue in degrees
 */
function oklch(L, C, H) {
  const rad = (H * Math.PI) / 180;
  return oklabToHex(L, C * Math.cos(rad), C * Math.sin(rad));
}

function hexToOklch(hex) {
  const [L, a, b] = hexToOklab(hex);
  return [L, Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360];
}

/** WCAG 2.1 relative luminance */
function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast ratio, 1..21 */
function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * APCA 0.1.9 lightness contrast (Lc). Better than WCAG 2.x for light-on-dark
 * text, which is exactly what a dark theme is made of. Negative values mean
 * reverse polarity (light text on a dark background); we report magnitudes.
 * Rough guidance: |Lc| >= 90 body text, >= 75 preferred body, >= 60 large/
 * secondary text, >= 45 non-text elements.
 */
function apca(textHex, bgHex) {
  const Ys = (hex) => {
    const [r, g, b] = hexToRgb(hex).map((c) => Math.pow(c / 255, 2.4));
    return 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  };
  const blkThrs = 0.022;
  const blkClmp = 1.414;
  let txt = Ys(textHex);
  let bg = Ys(bgHex);
  if (txt < blkThrs) txt += Math.pow(blkThrs - txt, blkClmp);
  if (bg < blkThrs) bg += Math.pow(blkThrs - bg, blkClmp);
  if (Math.abs(bg - txt) < 0.0005) return 0;
  let out;
  if (bg > txt) {
    const S = (Math.pow(bg, 0.56) - Math.pow(txt, 0.57)) * 1.14;
    out = S < 0.1 ? 0 : S - 0.027;
  } else {
    const S = (Math.pow(bg, 0.65) - Math.pow(txt, 0.62)) * 1.14;
    out = S > -0.1 ? 0 : S + 0.027;
  }
  return out * 100;
}

/** Composite `fg` at `alpha` over opaque `bg` — used to preview 8-digit hexes. */
function blend(fg, bg, alpha) {
  const f = hexToRgb(fg);
  const b = hexToRgb(bg);
  return rgbToHex(
    f[0] * alpha + b[0] * (1 - alpha),
    f[1] * alpha + b[1] * (1 - alpha),
    f[2] * alpha + b[2] * (1 - alpha)
  );
}

/** Append an alpha byte to a hex colour: alpha('#ff0000', 0.5) -> '#ff000080' */
function alpha(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r, g, b) + clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, '0');
}

/** Interpolate two colours through OKLCH along the shortest hue arc. */
function mix(a, b, t = 0.5) {
  const [L1, C1, H1] = hexToOklch(a);
  const [L2, C2, H2] = hexToOklch(b);
  let dH = H2 - H1;
  while (dH > 180) dH -= 360;
  while (dH < -180) dH += 360;
  return oklch(L1 + (L2 - L1) * t, C1 + (C2 - C1) * t, (H1 + dH * t + 360) % 360);
}

module.exports = {
  oklch,
  hexToOklch,
  hexToRgb,
  rgbToHex,
  relativeLuminance,
  contrastRatio,
  apca,
  blend,
  alpha,
  mix,
  srgbToLinear,
};
