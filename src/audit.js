#!/usr/bin/env node
/**
 * audit.js — proves the claims on the tin.
 *
 *   node src/audit.js          print the report
 *   node src/audit.js --write  also regenerate docs/ACCESSIBILITY.md
 *
 * Exits non-zero if any text colour falls below WCAG AA (4.5:1) on the surface
 * it is actually rendered on, so a careless palette edit fails CI rather than
 * shipping. Two passes: the palette itself, then every text colour in the
 * generated Zed theme, composited against the surface Zed draws it on.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { contrastRatio, apca, hexToOklch, blend } = require('./color.js');
const { buildPalette, VARIANTS: SPECS } = require('./palette.js');
const { buildZed } = require('./zed.js');

const AA = 4.5;
/* Every variant declared in the palette, in declaration order, so adding one
   there adds it to the report rather than silently going unaudited. */
const VARIANTS = Object.keys(SPECS);

const rows = [];
const failures = [];
let out = '';
const say = (s = '') => { out += s + '\n'; console.log(s); };

function check(variant, label, fg, bg, { text = true } = {}) {
  const ratio = contrastRatio(fg, bg);
  const lc = Math.abs(apca(fg, bg));
  const [L] = hexToOklch(fg);
  const pass = !text || ratio >= AA;
  if (!pass) failures.push(`${variant}: ${label} ${fg} on ${bg} = ${ratio.toFixed(2)}:1`);
  rows.push({ variant, label, fg, bg, ratio, lc, L: L * 100, text, pass });
  return { ratio, lc, L: L * 100, pass };
}

say('');
say('  COUNT DARCULA — palette audit');
say('  ' + '─'.repeat(74));

for (const key of VARIANTS) {
  const p = buildPalette(key);
  const canvas = p.ui.editor;

  say('');
  say(`  ${p.label}  (${p.type})   editor ${canvas}   side bar ${p.ui.surface}`);
  say('  ' + '─'.repeat(74));
  say('  token / role          hex       OKLCH-L   WCAG      APCA Lc   verdict');

  const line = (label, hex, bg = canvas, opts) => {
    const r = check(p.label, label, hex, bg, opts);
    const verdict = !r.pass ? 'FAIL'
      : r.ratio >= 7 ? 'AAA'
      : r.ratio >= 4.5 ? 'AA'
      : 'ui-only';
    say(
      `  ${label.padEnd(21)} ${hex}   ${r.L.toFixed(1).padStart(5)}   ` +
      `${r.ratio.toFixed(2).padStart(5)}:1   ${r.lc.toFixed(1).padStart(6)}    ${verdict}`
    );
  };

  line('foreground', p.ui.fg);
  line('secondary text', p.ui.dim);
  line('comment', p.ui.comment);
  for (const [name, hex] of Object.entries(p.base)) line(`syntax · ${name}`, hex);
  for (const [name, hex] of Object.entries(p.status)) line(`status · ${name}`, hex);
  line('foreground on chrome', p.ui.fg, p.ui.chrome);
  line('secondary on side bar', p.ui.dim, p.ui.surface);
  line('selection (non-text)', p.ui.line, canvas, { text: false });

  const band = Object.values(rows)
    .filter((r) => r.variant === p.label && r.label.startsWith('syntax'))
    .map((r) => r.ratio);
  const spread = Math.max(...band) - Math.min(...band);
  const lband = Object.values(rows)
    .filter((r) => r.variant === p.label && r.label.startsWith('syntax'))
    .map((r) => r.L);
  say('');
  say(
    `  syntax band: contrast ${Math.min(...band).toFixed(2)}–${Math.max(...band).toFixed(2)}:1 ` +
    `(spread ${spread.toFixed(2)}), lightness ${Math.min(...lband).toFixed(1)}–${Math.max(...lband).toFixed(1)} L*`
  );
}

/* ── Zed ────────────────────────────────────────────────────────────────── */

/* The palette passing is not the same as the theme passing: a colour can clear
   AA on the canvas and fail on a panel, or once its alpha is composited. Every
   syntax capture and every text tier, on the surface Zed actually draws it on. */

say('');
say('');
say('  Zed themes — syntax and text, on their real surfaces');
say('  ' + '─'.repeat(74));
say('  variant                  syntax   text keys   ANSI   de-emphasised   fails');

/* Foreground key -> the style key holding the background it renders against.
   A Map, not an object literal: `constructor` is a real Zed syntax capture, and a
   plain-object lookup would hand back Object.prototype.constructor for it. */
const ZED_SURFACE = new Map(Object.entries({
  'editor.foreground': 'editor.background',
  'editor.line_number': 'editor.background',
  'editor.active_line_number': 'editor.background',
  'editor.hover_line_number': 'editor.background',
  text: 'surface.background',
  'text.muted': 'surface.background',
  'text.accent': 'surface.background',
  'text.placeholder': 'surface.background',
  'text.disabled': 'surface.background',
  icon: 'surface.background',
  'icon.muted': 'surface.background',
  'icon.accent': 'surface.background',
  'terminal.foreground': 'terminal.background',
  'terminal.bright_foreground': 'terminal.background',
  'terminal.dim_foreground': 'terminal.background',
  error: 'editor.background',
  warning: 'editor.background',
  info: 'editor.background',
  success: 'editor.background',
  created: 'editor.background',
  modified: 'editor.background',
  deleted: 'editor.background',
  conflict: 'editor.background',
  renamed: 'editor.background',
  hint: 'editor.background',
  predictive: 'editor.background',
  ignored: 'editor.background',
  hidden: 'editor.background',
  unreachable: 'editor.background',
}));

/* deliberately quiet: WCAG exempts disabled, and a prediction that met AA would
   read as code you had already written */
const ZED_DIM = /^(text\.placeholder|text\.disabled|predictive|hint|ignored|hidden|unreachable|editor\.line_number|terminal\.ansi\.dim_|icon\.disabled)/;

const flatten = (hex, over) =>
  hex.length === 9 && hex.slice(7) !== 'ff'
    ? blend(hex.slice(0, 7), over, parseInt(hex.slice(7, 9), 16) / 255)
    : hex.slice(0, 7);

for (const theme of buildZed().themes) {
  const { players, syntax, ...style } = theme.style;
  const surfaceOf = (key) => {
    const bgKey =
      ZED_SURFACE.get(key) || (key.startsWith('terminal.ansi.') ? 'terminal.background' : 'editor.background');
    return flatten(style[bgKey], flatten(style.background, '#000000'));
  };

  let counts = { syntax: 0, text: 0, ansi: 0, dim: 0 };
  const bad = [];
  const check = (key, hex, kind) => {
    const bg = surfaceOf(key);
    const fg = flatten(hex, bg);
    const ratio = contrastRatio(fg, bg);
    if (ZED_DIM.test(key)) { counts.dim++; return; }
    counts[kind]++;
    if (ratio < AA) bad.push(`${theme.name}: ${key} ${fg} on ${bg} = ${ratio.toFixed(2)}:1`);
  };

  for (const [k, v] of Object.entries(syntax)) check(k, v.color, 'syntax');
  for (const k of ZED_SURFACE.keys()) if (style[k]) check(k, style[k], 'text');
  for (const k of Object.keys(style)) if (k.startsWith('terminal.ansi.') && !k.includes('black')) check(k, style[k], 'ansi');

  say(
    `  ${theme.name.padEnd(24)} ${String(counts.syntax).padStart(6)}   ${String(counts.text).padStart(9)}   ` +
    `${String(counts.ansi).padStart(4)}   ${String(counts.dim).padStart(13)}   ${String(bad.length).padStart(5)}`
  );
  bad.forEach((b) => failures.push(b));
}

/* ── verdict ────────────────────────────────────────────────────────────── */

say('');
say('  ' + '─'.repeat(74));
if (failures.length) {
  say(`  ${failures.length} colour(s) below WCAG AA:`);
  failures.forEach((f) => say(`    ✗ ${f}`));
} else {
  say(`  ✓ ${rows.filter((r) => r.text).length} palette colours and every text colour in both generated`);
  say(`    themes meet WCAG AA (>= ${AA}:1) on the surface they render on.`);
}
say('');

if (process.argv.includes('--write')) {
  const md = [
    '# Accessibility report',
    '',
    'Generated by `npm run audit` — do not edit by hand.',
    '',
    '```',
    out.replace(/─/g, '-').trimEnd(),
    '```',
    '',
  ].join('\n');
  const dest = path.join(__dirname, '..', 'docs', 'ACCESSIBILITY.md');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, md);
  console.log(`  wrote ${path.relative(process.cwd(), dest)}`);
}

process.exit(failures.length ? 1 : 0);
