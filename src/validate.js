#!/usr/bin/env node
/**
 * validate.js — structural checks on the generated themes.
 *
 *   npm test
 *
 * Catches the failure modes that are invisible until someone installs the
 * extension: malformed colour values, illegal fontStyle keywords, scopes
 * silently shadowed by a later rule, and drift between src/ and themes/.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { buildTheme, ZED_FILE } = require('./build.js');
const { VARIANTS } = require('./palette.js');
const { buildZed } = require('./zed.js');
const { SCHEMA, STYLE_KEYS, SYNTAX_KEYS, PLAYER_SLOTS } = require('./zed-schema.js');

const HEX = /^#[0-9a-f]{6}([0-9a-f]{2})?$/;
const FONT_STYLE = /^(|(italic|bold|underline|strikethrough)( (italic|bold|underline|strikethrough))*)$/;
const KEY = /^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9*]+)*$/;

const errors = [];
const warnings = [];
const root = path.join(__dirname, '..');

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'vscode', 'package.json'), 'utf8'));
// contributes paths are relative to vscode/package.json, not the repo root
const contributed = pkg.contributes.themes.map((t) => path.join('vscode', t.path.replace(/^\.\//, '')));

for (const key of Object.keys(VARIANTS)) {
  const { theme, file } = buildTheme(key);
  const rel = path.relative(root, file);
  const label = theme.name;

  /* generated file must match src/ exactly */
  if (!fs.existsSync(file)) {
    errors.push(`${label}: ${rel} is missing — run \`npm run build\``);
    continue;
  }
  const onDisk = fs.readFileSync(file, 'utf8');
  if (onDisk !== JSON.stringify(theme, null, 2) + '\n') {
    errors.push(`${label}: ${rel} is stale — run \`npm run build\` and commit the result`);
  }
  JSON.parse(onDisk); // throws on malformed JSON

  /* package.json must actually ship it */
  if (!contributed.includes(rel)) {
    errors.push(`${label}: ${rel} is not listed in package.json contributes.themes`);
  }

  /* colours */
  for (const [k, v] of Object.entries(theme.colors)) {
    if (!KEY.test(k)) warnings.push(`${label}: suspicious colour key "${k}"`);
    if (!HEX.test(v)) errors.push(`${label}: colours["${k}"] = "${v}" is not a 6/8-digit hex`);
  }

  /* token rules */
  const seen = new Map();
  theme.tokenColors.forEach((rule, i) => {
    const scopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope];
    if (!scopes.length || scopes.some((s) => typeof s !== 'string' || !s.trim())) {
      errors.push(`${label}: tokenColors[${i}] has an empty scope`);
    }
    if (!rule.settings || (!rule.settings.foreground && !rule.settings.fontStyle)) {
      errors.push(`${label}: tokenColors[${i}] has no foreground or fontStyle`);
    }
    if (rule.settings.foreground && !HEX.test(rule.settings.foreground)) {
      errors.push(`${label}: tokenColors[${i}].foreground "${rule.settings.foreground}" is not hex`);
    }
    if (rule.settings.fontStyle !== undefined && !FONT_STYLE.test(rule.settings.fontStyle)) {
      errors.push(`${label}: tokenColors[${i}].fontStyle "${rule.settings.fontStyle}" is not valid`);
    }
    for (const s of scopes) {
      if (seen.has(s)) warnings.push(`${label}: scope "${s}" in rule ${i} shadows rule ${seen.get(s)}`);
      seen.set(s, i);
    }
  });

  /* semantic tokens */
  for (const [k, v] of Object.entries(theme.semanticTokenColors)) {
    const color = typeof v === 'string' ? v : v.foreground;
    if (color && !HEX.test(color)) {
      errors.push(`${label}: semanticTokenColors["${k}"] = "${color}" is not hex`);
    }
    if (typeof v === 'object' && v.fontStyle !== undefined && !FONT_STYLE.test(v.fontStyle)) {
      errors.push(`${label}: semanticTokenColors["${k}"].fontStyle "${v.fontStyle}" is not valid`);
    }
  }

  console.log(
    `  ✓ ${label.padEnd(24)} ${Object.keys(theme.colors).length} colours, ` +
      `${theme.tokenColors.length} rules, ${Object.keys(theme.semanticTokenColors).length} semantic`
  );
}

/* ── Zed ──────────────────────────────────────────────────────────────────
   Zed ignores keys it does not recognise instead of erroring, so a typo costs
   you a colour and says nothing. Check the emitted vocabulary against the
   snapshot, and require the full 8-digit #RRGGBBAA form Zed expects. */
{
  const zed = buildZed();
  const rel = path.relative(root, ZED_FILE);
  const RGBA = /^#[0-9a-f]{8}$/;

  if (!fs.existsSync(ZED_FILE)) {
    errors.push(`Zed: ${rel} is missing — run \`npm run build\``);
  } else if (fs.readFileSync(ZED_FILE, 'utf8') !== JSON.stringify(zed, null, 2) + '\n') {
    errors.push(`Zed: ${rel} is stale — run \`npm run build\` and commit the result`);
  }

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

/* every contributed path must exist */
for (const rel of contributed) {
  if (!fs.existsSync(path.join(root, rel))) errors.push(`vscode/package.json points at missing file ${rel}`);
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
