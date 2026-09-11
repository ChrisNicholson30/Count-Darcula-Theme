#!/usr/bin/env node
/**
 * audit.js — proves the claims on the tin.
 *
 *   node src/audit.js          print the report
 *   node src/audit.js --write  also regenerate docs/ACCESSIBILITY.md
 *
 * Exits non-zero if any text colour falls below WCAG AA (4.5:1) on the surface
 * it is actually rendered on, so a careless palette edit fails CI rather than
 * shipping.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { contrastRatio, apca, hexToOklch, blend } = require('./color.js');
const { buildPalette, VARIANTS: SPECS } = require('./palette.js');
const { buildTheme } = require('./build.js');
const { auditTheme } = require('./coverage.js');
const { buildZed } = require('./zed.js');
const { screenPower, pixelPower } = require('./power.js');

const AA = 4.5;
/* Every variant declared in the palette, in declaration order, so adding one
   there adds it to the report rather than silently going unaudited. */
const VARIANTS = Object.keys(SPECS);

const REFERENCE = {
  'One Dark Pro': {
    editor: '#282c34', surface: '#21252b', chrome: '#21252b', fg: '#abb2bf',
    comment: '#5c6370', string: '#98c379', keyword: '#c678dd', function: '#61afef',
    property: '#e06c75', type: '#e5c07b', number: '#d19a66', operator: '#56b6c2',
  },
  Dracula: {
    editor: '#282a36', surface: '#21222c', chrome: '#191a21', fg: '#f8f8f2',
    comment: '#6272a4', string: '#f1fa8c', keyword: '#ff79c6', function: '#50fa7b',
    property: '#f8f8f2', type: '#8be9fd', number: '#bd93f9', operator: '#ff79c6',
  },
  'Default Dark+': {
    editor: '#1f1f1f', surface: '#181818', chrome: '#181818', fg: '#cccccc',
    comment: '#6a9955', string: '#ce9178', keyword: '#569cd6', function: '#dcdcaa',
    property: '#9cdcfe', type: '#4ec9b0', number: '#b5cea8', operator: '#d4d4d4',
  },
  'Default Light+': {
    editor: '#ffffff', surface: '#f8f8f8', chrome: '#f8f8f8', fg: '#3b3b3b',
    comment: '#008000', string: '#a31515', keyword: '#0000ff', function: '#795e26',
    property: '#001080', type: '#267f99', number: '#098658', operator: '#000000',
  },
};

function frameOf(p) {
  return {
    editor: p.ui.editor, surface: p.ui.surface, chrome: p.ui.chrome,
    fg: p.ui.fg, comment: p.ui.comment, string: p.base.green, keyword: p.base.rose,
    function: p.base.azure, property: p.base.coral, type: p.base.gold,
    number: p.base.amber, operator: p.base.teal,
  };
}

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

/* ── generated-theme coverage ───────────────────────────────────────────── */

/* The block above measures the palette. This one measures what actually shipped:
   every foreground key in the built JSON, composited against the surface it
   really renders on. A swatch that passes on the canvas can still fail inside a
   widget or on a filled badge, and only this pass would catch it. */

say('');
say('');
say('  Generated theme — every foreground, on its real surface');
say('  ' + '─'.repeat(74));
say('  variant                  measured   body text   ui/icons   de-emphasised   fails');

const deemphasised = [];
for (const key of VARIANTS) {
  const { theme } = buildTheme(key);
  const { rows, failures: bad, counts } = auditTheme(theme);
  const measured = rows.filter((r) => !r.skipped).length;
  say(
    `  ${theme.name.padEnd(24)} ${String(measured).padStart(6)}   ` +
    `${String(counts.text).padStart(9)}   ${String(counts.nonText).padStart(8)}   ` +
    `${String(counts.deemphasised).padStart(13)}   ${String(bad.length).padStart(5)}`
  );
  bad.forEach((f) =>
    failures.push(
      `${theme.name}: ${f.key} ${f.raw} on ${f.bgKey} = ${f.ratio.toFixed(2)}:1 (needs ${f.required}:1)`
    )
  );
  if (key === 'dark') {
    rows
      .filter((r) => r.tier === 'deemphasised')
      .sort((a, b) => a.ratio - b.ratio)
      .forEach((r) => deemphasised.push(r));
  }
}

say('');
say('  Body text is held to WCAG AA (4.5:1), icons and controls to 1.4.11 (3:1).');
say('  Scrollbar marks, guides and rules are not text and are not measured.');
say('');
say('  Deliberately below AA — disabled and inactive states, which WCAG 1.4.3');
say('  exempts, plus inline suggestions that are meant to read as not-yet-yours:');
for (const r of deemphasised) {
  say(`    ${r.key.padEnd(44)} ${r.ratio.toFixed(2).padStart(5)}:1`);
}

/* ── Zed ────────────────────────────────────────────────────────────────── */

/* Zed's vocabulary is its own, so coverage.js does not apply — but the standard
   does. Every syntax capture and every text tier, on the surface Zed draws it on. */

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

/* ── power model ────────────────────────────────────────────────────────── */

say('');
say('');
say('  Estimated OLED panel power (relative; full white = 1.00)');
say('  ' + '─'.repeat(74));
say('  theme                          screen power   vs. flagship   canvas pixel');

const powers = [];
for (const key of VARIANTS) {
  const p = buildPalette(key);
  powers.push([p.label, screenPower(frameOf(p)), pixelPower(p.ui.editor)]);
}
for (const [name, frame] of Object.entries(REFERENCE)) {
  powers.push([name, screenPower(frame), pixelPower(frame.editor)]);
}
const byName = (name) => powers.find((r) => r[0] === name)[1];
const flagship = byName(buildPalette('dark').label);
for (const [name, power, canvas] of powers) {
  const delta = ((power / flagship - 1) * 100);
  say(
    `  ${name.padEnd(30)} ${power.toFixed(4).padStart(9)}      ` +
    `${(delta >= 0 ? '+' : '') + delta.toFixed(1) + '%'}`.padStart(9) +
    `   ${canvas.toFixed(4).padStart(9)}`
  );
}

const nocturne = byName(buildPalette('nocturne').label);
say('');
say(`  Nocturne draws ${((1 - nocturne / flagship) * 100).toFixed(1)}% less than the flagship,`);
say(`  ${((1 - nocturne / byName('Dracula')) * 100).toFixed(1)}% less than Dracula, and`);
say(`  ${((1 - nocturne / byName('Default Light+')) * 100).toFixed(1)}% less than a stock light theme, on the model in src/power.js.`);
say('  On an LCD, panel power is set by the backlight and is content-independent.');

/* ── verdict ────────────────────────────────────────────────────────────── */

say('');
say('  ' + '─'.repeat(74));
if (failures.length) {
  say(`  ${failures.length} colour(s) below WCAG AA:`);
  failures.forEach((f) => say(`    ✗ ${f}`));
} else {
  say(`  ✓ ${rows.filter((r) => r.text).length} palette colours and every body-text key in all ${VARIANTS.length}`);
  say(`    generated themes meet WCAG AA (>= ${AA}:1) on the surface they render on.`);
}
say('');

if (process.argv.includes('--write')) {
  const md = [
    '# Accessibility & power report',
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
