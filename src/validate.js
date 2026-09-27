#!/usr/bin/env node
/**
 * validate.js — structural checks on the generated theme.
 *
 *   npm test
 *
 * Catches the failure modes that are invisible until someone installs the
 * theme: malformed colour values, keys Zed does not recognise, and drift
 * between src/ and the committed output.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { outputs, ZED_FILE } = require('./build.js');
const { VARIANTS } = require('./palette.js');
const { buildZed } = require('./zed.js');
const { SCHEMA, STYLE_KEYS, SYNTAX_KEYS, PLAYER_SLOTS } = require('./zed-schema.js');

const errors = [];
const warnings = [];
const root = path.join(__dirname, '..');

/* every generated file must match src/ exactly */
for (const [file, body] of outputs()) {
  const rel = path.relative(root, file);
  if (!fs.existsSync(file)) errors.push(`${rel} is missing — run \`npm run build\``);
  else if (fs.readFileSync(file, 'utf8') !== body) {
    errors.push(`${rel} is stale — run \`npm run build\` and commit the result`);
  }
}

/* ── Zed ──────────────────────────────────────────────────────────────────
   Zed ignores keys it does not recognise instead of erroring, so a typo costs
   you a colour and says nothing. Check the emitted vocabulary against the
   snapshot, and require the full 8-digit #RRGGBBAA form Zed expects. */
{
  const zed = buildZed();
  const RGBA = /^#[0-9a-f]{8}$/;
  if (fs.existsSync(ZED_FILE)) JSON.parse(fs.readFileSync(ZED_FILE, 'utf8')); // throws on malformed JSON

  if (zed.$schema !== SCHEMA) errors.push(`Zed: $schema is "${zed.$schema}", expected "${SCHEMA}"`);
  if (zed.themes.length !== Object.keys(VARIANTS).length) {
    errors.push(`Zed: ${zed.themes.length} themes, expected ${Object.keys(VARIANTS).length}`);
  }

  const known = new Set(STYLE_KEYS);
  const knownSyntax = new Set(SYNTAX_KEYS);

  for (const theme of zed.themes) {
    const label = `Zed/${theme.name}`;
    if (!['light', 'dark'].includes(theme.appearance)) {
      errors.push(`${label}: appearance "${theme.appearance}" is not light or dark`);
    }
    const { players, syntax, ...style } = theme.style;

    for (const [k, v] of Object.entries(style)) {
      if (!known.has(k)) errors.push(`${label}: "${k}" is not a Zed style key`);
      if (!RGBA.test(v)) errors.push(`${label}: style["${k}"] = "${v}" is not #rrggbbaa`);
    }
    const missing = STYLE_KEYS.filter((k) => !(k in style));
    if (missing.length) warnings.push(`${label}: ${missing.length} style key(s) left to Zed's defaults: ${missing.slice(0, 6).join(', ')}`);

    for (const [k, v] of Object.entries(syntax)) {
      if (!knownSyntax.has(k)) errors.push(`${label}: "${k}" is not a Zed syntax capture`);
      if (!RGBA.test(v.color)) errors.push(`${label}: syntax["${k}"].color = "${v.color}" is not #rrggbbaa`);
      if (!('font_style' in v) || !('font_weight' in v)) {
        errors.push(`${label}: syntax["${k}"] must carry font_style and font_weight, null included`);
      }
      if (v.font_style !== null && !['italic', 'normal', 'oblique'].includes(v.font_style)) {
        errors.push(`${label}: syntax["${k}"].font_style "${v.font_style}" is not valid`);
      }
    }
    const missingSyntax = SYNTAX_KEYS.filter((k) => !(k in syntax));
    if (missingSyntax.length) warnings.push(`${label}: ${missingSyntax.length} syntax capture(s) unstyled: ${missingSyntax.join(', ')}`);

    if (players.length !== PLAYER_SLOTS) {
      errors.push(`${label}: ${players.length} player slots, Zed expects ${PLAYER_SLOTS}`);
    }
    players.forEach((pl, i) => {
      for (const field of ['cursor', 'background', 'selection']) {
        if (!RGBA.test(pl[field])) errors.push(`${label}: players[${i}].${field} = "${pl[field]}" is not #rrggbbaa`);
      }
    });

    console.log(
      `  ✓ ${label.padEnd(34)} ${Object.keys(style).length}/${STYLE_KEYS.length} style, ` +
        `${Object.keys(syntax).length}/${SYNTAX_KEYS.length} syntax, ${players.length} players`
    );
  }
}

console.log('');
for (const w of warnings) console.log(`  ! ${w}`);
if (warnings.length) console.log('');
if (errors.length) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`\n  ${errors.length} error(s).\n`);
  process.exit(1);
}
console.log(`  ${warnings.length ? warnings.length + ' warning(s), ' : ''}0 errors.\n`);
