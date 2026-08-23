#!/usr/bin/env node
/**
 * build.js — renders themes/*.json from the palette.
 *
 *   npm run build
 *
 * The generated files are committed so the extension works with no build step;
 * regenerate whenever src/palette.js changes and commit the result.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { buildPalette, VARIANTS } = require('./palette.js');
const { buildZed } = require('./zed.js');
const workbench = require('./workbench.js');
const terminal = require('./terminal.js');
const syntax = require('./syntax.js');

const ROOT = path.join(__dirname, '..');
/* Each editor gets a self-contained directory: vscode/ is a packageable extension,
   zed/ is a Zed extension you can point "Install Dev Extension" at. Both are
   generated from src/, so neither can drift from the palette. */
const OUT_DIR = path.join(ROOT, 'vscode', 'themes');
const ZED_FILE = path.join(ROOT, 'zed', 'themes', 'count-darcula.json');
const VSCODE_LICENSE = path.join(ROOT, 'vscode', 'LICENSE');
const VSCODE_ICON = path.join(ROOT, 'vscode', 'assets', 'icon.png');

/** Drop nulls (used to mean "let VS Code decide") and normalise case. */
function clean(colors) {
  const out = {};
  for (const key of Object.keys(colors).sort()) {
    const value = colors[key];
    if (value === null || value === undefined) continue;
    out[key] = String(value).toLowerCase();
  }
  return out;
}

function buildTheme(variantKey) {
  const p = buildPalette(variantKey);
  const { tokenColors, semanticTokenColors } = syntax(p);

  return {
    theme: {
      $schema: 'vscode://schemas/color-theme',
      name: p.label,
      type: p.type,
      semanticHighlighting: true,
      colors: clean({ ...workbench(p), ...terminal(p) }),
      semanticTokenColors,
      tokenColors,
    },
    palette: p,
    file: path.join(OUT_DIR, `${p.id}-color-theme.json`),
  };
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const summary = [];

  for (const key of Object.keys(VARIANTS)) {
    const { theme, palette, file } = buildTheme(key);
    fs.writeFileSync(file, JSON.stringify(theme, null, 2) + '\n');
    summary.push({
      name: theme.name,
      file: path.relative(ROOT, file),
      colors: Object.keys(theme.colors).length,
      rules: theme.tokenColors.length,
      semantic: Object.keys(theme.semanticTokenColors).length,
      bg: palette.ui.editor,
    });
  }

  // Zed ships all three variants in one file; the editor lists each themes[] entry
  const zed = buildZed();
  fs.mkdirSync(path.dirname(ZED_FILE), { recursive: true });
  fs.writeFileSync(ZED_FILE, JSON.stringify(zed, null, 2) + '\n');

  /* vsce packages relative to vscode/package.json and cannot reach outside it, so
     the licence and icon are copied in rather than maintained twice by hand. */
  fs.mkdirSync(path.dirname(VSCODE_ICON), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'LICENSE'), VSCODE_LICENSE);
  fs.copyFileSync(path.join(ROOT, 'assets', 'icon.png'), VSCODE_ICON);

  console.log('\n  Count Darcula — build\n');
  for (const s of summary) {
    console.log(
      `  ${s.name.padEnd(24)} ${s.bg}  ${String(s.colors).padStart(3)} ui · ` +
        `${String(s.rules).padStart(3)} textmate · ${String(s.semantic).padStart(2)} semantic  ->  ${s.file}`
    );
  }
  const zedStyle = Object.keys(zed.themes[0].style).filter((k) => !['players', 'syntax'].includes(k));
  console.log(
    `  ${'Zed (all three)'.padEnd(24)} ${'—'.padEnd(7)}  ${String(zedStyle.length).padStart(3)} style · ` +
      `${String(Object.keys(zed.themes[0].style.syntax).length).padStart(3)} syntax · ` +
      ` 8 players  ->  ${path.relative(ROOT, ZED_FILE)}`
  );
  console.log('');
}

if (require.main === module) main();

module.exports = { buildTheme, ZED_FILE };
