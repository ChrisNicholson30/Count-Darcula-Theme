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
const { buildTheme } = require('./build.js');
const { VARIANTS } = require('./palette.js');

const HEX = /^#[0-9a-f]{6}([0-9a-f]{2})?$/;
const FONT_STYLE = /^(|(italic|bold|underline|strikethrough)( (italic|bold|underline|strikethrough))*)$/;
const KEY = /^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9*]+)*$/;

const errors = [];
const warnings = [];
const root = path.join(__dirname, '..');

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const contributed = pkg.contributes.themes.map((t) => t.path.replace(/^\.\//, ''));

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

/* every contributed path must exist */
for (const rel of contributed) {
  if (!fs.existsSync(path.join(root, rel))) errors.push(`package.json points at missing file ${rel}`);
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
