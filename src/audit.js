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
const { buildPalette } = require('./palette.js');
const { screenPower, pixelPower } = require('./power.js');

const AA = 4.5;
const VARIANTS = ['dark', 'nocturne', 'daylight'];

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
const flagship = powers[0][1];
for (const [name, power, canvas] of powers) {
  const delta = ((power / flagship - 1) * 100);
  say(
    `  ${name.padEnd(30)} ${power.toFixed(4).padStart(9)}      ` +
    `${(delta >= 0 ? '+' : '') + delta.toFixed(1) + '%'}`.padStart(9) +
    `   ${canvas.toFixed(4).padStart(9)}`
  );
}

const nocturne = powers[1][1];
say('');
say(`  Nocturne draws ${((1 - nocturne / flagship) * 100).toFixed(1)}% less than the flagship,`);
say(`  ${((1 - nocturne / powers.find((r) => r[0] === 'Dracula')[1]) * 100).toFixed(1)}% less than Dracula, and`);
say(`  ${((1 - nocturne / powers.find((r) => r[0] === 'Default Light+')[1]) * 100).toFixed(1)}% less than a stock light theme, on the model in src/power.js.`);
say('  On an LCD, panel power is set by the backlight and is content-independent.');

/* ── verdict ────────────────────────────────────────────────────────────── */

say('');
say('  ' + '─'.repeat(74));
if (failures.length) {
  say(`  ${failures.length} colour(s) below WCAG AA:`);
  failures.forEach((f) => say(`    ✗ ${f}`));
} else {
  say(`  ✓ all ${rows.filter((r) => r.text).length} text colours meet WCAG AA (>= ${AA}:1) on their own surfaces.`);
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
