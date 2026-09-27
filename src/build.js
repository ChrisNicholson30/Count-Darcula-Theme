#!/usr/bin/env node
/**
 * build.js — renders the Zed theme and the palette cards from the palette.
 *
 *   npm run build
 *
 * The generated files are committed so the theme installs with no build step;
 * regenerate whenever src/palette.js changes and commit the result.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { buildPalette, VARIANTS, HUE } = require('./palette.js');
const { buildZed } = require('./zed.js');

const ROOT = path.join(__dirname, '..');
const ZED_FILE = path.join(ROOT, 'zed', 'themes', 'count-darcula.json');
const cardFile = (key) => path.join(ROOT, 'assets', `palette-${key}.svg`);

/** A palette card: the eight accents, then the neutral ramp, drawn on the canvas. */
function paletteCard(key) {
  const p = buildPalette(key);
  const W = 880;
  const H = 300;
  const chip = 94;
  const gap = 10;
  const x0 = 32;
  const esc = (s) => s.replace(/&/g, '&amp;');

  const accents = Object.keys(HUE)
    .map((name, i) => {
      const x = x0 + i * (chip + gap);
      const hex = p.base[name];
      return (
        `  <rect x="${x}" y="72" width="${chip}" height="72" rx="10" fill="${hex}"/>\n` +
        `  <text x="${x}" y="166" fill="${p.ui.fg}" font-size="13" font-weight="600">${name}</text>\n` +
        `  <text x="${x}" y="184" fill="${p.ui.dim}" font-size="12">${hex}</text>`
      );
    })
    .join('\n');

  const ramp = Object.entries(p.ui);
  const rw = (W - 2 * x0) / ramp.length;
  const neutrals = ramp
    .map(([, hex], i) => `  <rect x="${(x0 + i * rw).toFixed(1)}" y="214" width="${rw.toFixed(1)}" height="40" fill="${hex}"/>`)
    .join('\n');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" ` +
      `font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">`,
    `  <rect width="${W}" height="${H}" rx="16" fill="${p.ui.editor}"/>`,
    `  <text x="${x0}" y="46" fill="${p.ui.bright}" font-size="20" font-weight="700">${esc(p.label)}</text>`,
    `  <text x="${W - x0}" y="46" fill="${p.ui.comment}" font-size="13" text-anchor="end">canvas ${p.ui.editor} / text ${p.ui.fg}</text>`,
    accents,
    `  <clipPath id="ramp"><rect x="${x0}" y="214" width="${W - 2 * x0}" height="40" rx="8"/></clipPath>`,
    `  <g clip-path="url(#ramp)">`,
    neutrals,
    `  </g>`,
    `  <rect x="${x0}" y="214" width="${W - 2 * x0}" height="40" rx="8" fill="none" stroke="${p.ui.line}"/>`,
    `  <text x="${x0}" y="280" fill="${p.ui.comment}" font-size="12">neutral ramp, deep to bright</text>`,
    `</svg>`,
    '',
  ].join('\n');
}

/** Every generated file and its expected contents, for build.js and validate.js alike. */
function outputs() {
  const files = [[ZED_FILE, JSON.stringify(buildZed(), null, 2) + '\n']];
  for (const key of Object.keys(VARIANTS)) files.push([cardFile(key), paletteCard(key)]);
  return files;
}

function main() {
  console.log('\n  Count Darcula — build\n');
  for (const [file, body] of outputs()) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body);
    console.log(`  -> ${path.relative(ROOT, file)}`);
  }
  console.log('');
  for (const key of Object.keys(VARIANTS)) {
    const p = buildPalette(key);
    console.log(`  ${p.label.padEnd(22)} canvas ${p.ui.editor}  text ${p.ui.fg}`);
  }
  console.log('');
}

if (require.main === module) main();

module.exports = { outputs, ZED_FILE };
