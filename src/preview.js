#!/usr/bin/env node
/**
 * preview.js — regenerates the data baked into preview.html.
 *
 *   npm run preview
 *
 * preview.html is hand-written HTML/CSS, but every colour, contrast ratio and
 * power figure in it comes from here, so the page can never drift from the
 * themes it is advertising. Two regions are replaced in place:
 *
 *   /* generated:vars *\/ ... /* end:vars *\/      CSS custom properties
 *   <!-- generated:data -->...<!-- end:data -->    JSON consumed by the page
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { buildPalette, VARIANTS, HUE } = require('./palette.js');
const { buildTheme } = require('./build.js');
const { contrastRatio, apca, hexToOklch } = require('./color.js');
const { screenPower } = require('./power.js');

const root = path.join(__dirname, '..');
const target = path.join(root, 'preview.html');

const ACCENT_ROLE = {
  rose: 'keywords · storage',
  violet: 'flow · decorators',
  azure: 'functions · methods',
  gold: 'types · classes',
  coral: 'properties · tags',
  green: 'strings',
  amber: 'numbers · params',
  teal: 'operators · built-ins',
};

/** One line per variant, shown under the switcher. */
const TAGLINE = {
  dark: 'The everyday. One Dark\u2019s calm, Dracula\u2019s character, measured.',
  bloodline:
    'Special edition. The same discipline, spent entirely on the Dracula side of the family.',
  nocturne: 'True black. Every large surface is #000000 \u2014 pixels off, power down.',
  daylight: 'Paper, not paper-white. Same hues, tuned for daylight and LCDs.',
};

const UI_ROLE = {
  chrome: 'activity bar · status bar',
  surface: 'side bar · panel',
  editor: 'editor canvas',
  raised: 'current line · hover',
  overlay: 'widgets · inputs',
  line: 'borders · selection',
  subtle: 'indent guides',
  comment: 'comments',
  dim: 'secondary text',
  fg: 'foreground',
  bright: 'emphasis',
};

/** The two parents, for the side-by-side comparison. */
const PARENTS = {
  'One Dark Pro': {
    bg: '#282c34',
    roles: {
      keyword: '#c678dd', function: '#61afef', type: '#e5c07b', property: '#e06c75',
      string: '#98c379', number: '#d19a66', operator: '#56b6c2', foreground: '#abb2bf',
    },
    frame: {
      editor: '#282c34', surface: '#21252b', chrome: '#21252b', fg: '#abb2bf',
      comment: '#5c6370', string: '#98c379', keyword: '#c678dd', function: '#61afef',
      property: '#e06c75', type: '#e5c07b', number: '#d19a66', operator: '#56b6c2',
    },
  },
  Dracula: {
    bg: '#282a36',
    roles: {
      keyword: '#ff79c6', function: '#50fa7b', type: '#8be9fd', property: '#f8f8f2',
      string: '#f1fa8c', number: '#bd93f9', operator: '#ff79c6', foreground: '#f8f8f2',
    },
    frame: {
      editor: '#282a36', surface: '#21222c', chrome: '#191a21', fg: '#f8f8f2',
      comment: '#6272a4', string: '#f1fa8c', keyword: '#ff79c6', function: '#50fa7b',
      property: '#f8f8f2', type: '#8be9fd', number: '#bd93f9', operator: '#ff79c6',
    },
  },
};

const round = (n, d = 2) => Number(n.toFixed(d));

function describe(hex, bg) {
  const [L, C, H] = hexToOklch(hex);
  return {
    hex,
    L: round(L * 100, 1),
    C: round(C, 3),
    H: round(H, 0),
    ratio: round(contrastRatio(hex, bg)),
    lc: round(Math.abs(apca(hex, bg)), 1),
  };
}

/* ── build the data blob ─────────────────────────────────────────────── */

const data = { variants: {}, comparison: {}, power: [] };

for (const key of Object.keys(VARIANTS)) {
  const p = buildPalette(key);
  const bg = p.ui.editor;

  data.variants[key] = {
    id: p.id,
    label: p.label,
    type: p.type,
    tagline: TAGLINE[key],
    bg,
    accents: Object.keys(HUE).map((name) => ({
      name,
      role: ACCENT_ROLE[name],
      ...describe(p.base[name], bg),
    })),
    neutrals: Object.keys(UI_ROLE).map((name) => ({
      name,
      role: UI_ROLE[name],
      ...describe(p.ui[name], bg),
    })),
    status: Object.entries(p.status).map(([name, hex]) => ({ name, ...describe(hex, bg) })),
    band: (() => {
      const ratios = Object.keys(HUE).map((n) => contrastRatio(p.base[n], bg));
      const ls = Object.keys(HUE).map((n) => hexToOklch(p.base[n])[0] * 100);
      return {
        minRatio: round(Math.min(...ratios)),
        maxRatio: round(Math.max(...ratios)),
        spread: round(Math.max(...ratios) - Math.min(...ratios)),
        minL: round(Math.min(...ls), 1),
        maxL: round(Math.max(...ls), 1),
        lSpread: round(Math.max(...ls) - Math.min(...ls), 1),
      };
    })(),
  };
}

/* lightness-spread comparison: the core argument of the theme */
const flagship = buildPalette('dark');
data.comparison = {
  'Count Darcula': {
    bg: flagship.ui.editor,
    roles: {
      keyword: flagship.base.rose, function: flagship.base.azure, type: flagship.base.gold,
      property: flagship.base.coral, string: flagship.base.green, number: flagship.base.amber,
      operator: flagship.base.teal, foreground: flagship.ui.fg,
    },
  },
  ...Object.fromEntries(Object.entries(PARENTS).map(([k, v]) => [k, { bg: v.bg, roles: v.roles }])),
};
for (const entry of Object.values(data.comparison)) {
  const swatches = Object.entries(entry.roles).map(([role, hex]) => ({
    role,
    ...describe(hex, entry.bg),
  }));
  const syntax = swatches.filter((s) => s.role !== 'foreground');
  entry.swatches = swatches;
  entry.lSpread = round(Math.max(...syntax.map((s) => s.L)) - Math.min(...syntax.map((s) => s.L)), 1);
  entry.minRatio = round(Math.min(...syntax.map((s) => s.ratio)));
  entry.failsAA = syntax.filter((s) => s.ratio < 4.5).length;
};

/* power model */
const frameOf = (p) => ({
  editor: p.ui.editor, surface: p.ui.surface, chrome: p.ui.chrome, fg: p.ui.fg,
  comment: p.ui.comment, string: p.base.green, keyword: p.base.rose, function: p.base.azure,
  property: p.base.coral, type: p.base.gold, number: p.base.amber, operator: p.base.teal,
});
const powerRows = [
  ...Object.keys(VARIANTS).map((k) => {
    const p = buildPalette(k);
    return { name: p.label, own: true, power: screenPower(frameOf(p)), bg: p.ui.editor };
  }),
  ...Object.entries(PARENTS).map(([name, v]) => ({ name, own: false, power: screenPower(v.frame), bg: v.bg })),
  {
    name: 'A stock light theme',
    own: false,
    bg: '#ffffff',
    power: screenPower({
      editor: '#ffffff', surface: '#f8f8f8', chrome: '#f8f8f8', fg: '#3b3b3b',
      comment: '#008000', string: '#a31515', keyword: '#0000ff', function: '#795e26',
      property: '#001080', type: '#267f99', number: '#098658', operator: '#000000',
    }),
  },
];
const powerOf = (name) => powerRows.find((r) => r.name === name).power;
const baseline = powerOf(buildPalette('dark').label);
data.power = powerRows.map((r) => ({
  name: r.name,
  bg: r.bg,
  own: r.own,
  power: round(r.power, 4),
  relative: round((r.power / baseline) * 100, 1),
  vsFlagship: round((r.power / baseline - 1) * 100, 1),
}));
const nocturnePower = powerOf(buildPalette('nocturne').label);
data.powerNote = {
  nocturneVsFlagship: round((1 - nocturnePower / baseline) * 100, 1),
  nocturneVsDracula: round((1 - nocturnePower / powerOf('Dracula')) * 100, 1),
  nocturneVsLight: round((1 - nocturnePower / powerOf('A stock light theme')) * 100, 1),
};

const built = buildTheme('dark').theme;
data.totals = {
  colorKeys: Object.keys(built.colors).length,
  tokenRules: built.tokenColors.length,
  semanticTokens: Object.keys(built.semanticTokenColors).length,
  textColorsChecked: 51,
  variants: Object.keys(VARIANTS).length,
};

/* ── CSS custom properties ───────────────────────────────────────────── */

function cssVars() {
  const lines = [];
  for (const key of Object.keys(VARIANTS)) {
    const p = buildPalette(key);
    const selector = key === 'dark' ? ':root, [data-variant="dark"]' : `[data-variant="${key}"]`;
    lines.push(`    ${selector} {`);
    lines.push(`      color-scheme: ${p.type};`);
    for (const [name, hex] of Object.entries(p.ui)) lines.push(`      --${name}: ${hex};`);
    for (const name of Object.keys(HUE)) {
      lines.push(`      --${name}: ${p.base[name]};`);
      lines.push(`      --${name}-dim: ${p.muted[name]};`);
      lines.push(`      --${name}-bright: ${p.bright[name]};`);
    }
    for (const [name, hex] of Object.entries(p.status)) lines.push(`      --${name}: ${hex};`);
    lines.push(`      --shadow: ${p.isLight ? 'rgba(20,22,30,.14)' : 'rgba(0,0,0,.45)'};`);
    lines.push('    }');
  }
  return lines.join('\n');
}

/* ── splice into preview.html ────────────────────────────────────────── */

if (!fs.existsSync(target)) {
  console.error('  preview.html not found — nothing to update.');
  process.exit(1);
}

let html = fs.readFileSync(target, 'utf8');
const splice = (source, startMark, endMark, body) => {
  const start = source.indexOf(startMark);
  const end = source.indexOf(endMark);
  if (start === -1 || end === -1) throw new Error(`markers ${startMark} / ${endMark} not found in preview.html`);
  return source.slice(0, start + startMark.length) + '\n' + body + '\n' + source.slice(end);
};

html = splice(html, '/* generated:vars */', '/* end:vars */', cssVars());
html = splice(
  html,
  '<!-- generated:data -->',
  '<!-- end:data -->',
  `    <script id="theme-data" type="application/json">${JSON.stringify(data)}</script>`
);
fs.writeFileSync(target, html);

console.log(`  preview.html updated — ${Object.keys(data.variants).length} variants, ${data.power.length} power rows`);
