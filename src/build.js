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
const workbench = require('./workbench.js');
const terminal = require('./terminal.js');
const syntax = require('./syntax.js');

const OUT_DIR = path.join(__dirname, '..', 'themes');

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
      file: path.relative(path.join(__dirname, '..'), file),
      colors: Object.keys(theme.colors).length,
      rules: theme.tokenColors.length,
      semantic: Object.keys(theme.semanticTokenColors).length,
      bg: palette.ui.editor,
    });
  }

  console.log('\n  Count Darcula — build\n');
  for (const s of summary) {
    console.log(
      `  ${s.name.padEnd(24)} ${s.bg}  ${String(s.colors).padStart(3)} ui · ` +
        `${String(s.rules).padStart(3)} textmate · ${String(s.semantic).padStart(2)} semantic  ->  ${s.file}`
    );
  }
  console.log('');
}

if (require.main === module) main();

module.exports = { buildTheme };
