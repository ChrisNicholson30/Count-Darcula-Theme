/**
 * coverage.js — audits the *generated* theme, not the palette it came from.
 *
 * src/audit.js measures the palette: the twelve neutrals, eight accents and four
 * status colours, against the editor canvas. That is the design argument, but it
 * is not the whole theme. The built file has 244 foreground keys, 40 of them
 * alpha-composited, and a swatch that passes on `editor.background` can still
 * fail on the side bar or inside a widget.
 *
 * This module closes that gap. For every foreground in the generated theme it:
 *
 *   1. resolves the surface the colour actually renders against — a sibling
 *      `…Background` key where one exists, otherwise a prefix table;
 *   2. composites alpha, on both sides, so `#8693b3cc` over `#282b35` is
 *      measured as what the eye receives, not as its opaque parent;
 *   3. classifies what the key is, because WCAG does not ask the same of all of
 *      them — body text is held to 4.5:1, icons and controls to 3:1, disabled
 *      and inactive states are exempt but still reported, and scrollbar marks
 *      are not text at all.
 */

'use strict';

const { contrastRatio, apca, blend } = require('./color.js');

/** Foregrounds whose namespace has no background of its own. Longest match wins. */
const SURFACE_TABLE = [
  ['editorGroupHeader', 'editorGroupHeader.tabsBackground'],
  ['editorStickyScroll', 'editorStickyScroll.background'],
  ['editorSuggestWidget', 'editorSuggestWidget.background'],
  ['editorHoverWidget', 'editorHoverWidget.background'],
  ['editorMarkerNavigation', 'editorWidget.background'],
  ['editorWidget', 'editorWidget.background'],
  ['editorLineNumber', 'editor.background'],
  ['editorGhostText', 'editor.background'],
  ['editorCodeLens', 'editor.background'],
  ['editorInlayHint', 'editorInlayHint.background'],
  ['editorBracketHighlight', 'editor.background'],
  ['editorLightBulb', 'editor.background'],
  ['editorWatermark', 'editor.background'],
  ['editorWhitespace', 'editor.background'],
  ['editorIndentGuide', 'editor.background'],
  ['editorGutter', 'editor.background'],
  ['editorLink', 'editor.background'],
  ['editorUnicodeHighlight', 'editor.background'],
  ['editorError', 'editor.background'],
  ['editorWarning', 'editor.background'],
  ['editorInfo', 'editor.background'],
  ['editorHint', 'editor.background'],
  ['editorRuler', 'editor.background'],
  ['editorCursor', 'editor.background'],
  ['editorMultiCursor', 'editor.background'],
  ['editorOverviewRuler', 'editor.background'],
  ['editor', 'editor.background'],
  ['breadcrumb', 'breadcrumb.background'],
  ['minimap', 'editor.background'],
  ['peekViewResult', 'peekViewResult.background'],
  ['peekViewTitle', 'peekViewTitle.background'],
  ['peekViewEditor', 'peekViewEditor.background'],
  ['peekView', 'peekViewResult.background'],
  ['activityBarTop', 'activityBarTop.background'],
  ['activityBarBadge', 'activityBarBadge.background'],
  ['activityBar', 'activityBar.background'],
  ['statusBarItem', 'statusBar.background'],
  ['statusBar', 'statusBar.background'],
  ['titleBar', 'titleBar.activeBackground'],
  ['commandCenter', 'titleBar.activeBackground'],
  ['sideBarSectionHeader', 'sideBarSectionHeader.background'],
  ['sideBarTitle', 'sideBarTitle.background'],
  ['sideBarStickyScroll', 'sideBarStickyScroll.background'],
  ['sideBar', 'sideBar.background'],
  ['panelSectionHeader', 'panelSectionHeader.background'],
  ['panelTitle', 'panel.background'],
  ['panelSection', 'panel.background'],
  ['panelStickyScroll', 'panel.background'],
  ['panel', 'panel.background'],
  ['outputView', 'outputView.background'],
  ['debugConsole', 'panel.background'],
  ['debugToolBar', 'debugToolBar.background'],
  ['debugTokenExpression', 'sideBar.background'],
  ['debugIcon', 'editor.background'],
  ['debugView', 'sideBar.background'],
  ['terminalCommandDecoration', 'terminal.background'],
  ['terminalOverviewRuler', 'terminal.background'],
  ['terminalCommandGuide', 'terminal.background'],
  ['terminalStickyScroll', 'terminal.background'],
  ['terminalCursor', 'terminal.background'],
  ['terminal', 'terminal.background'],
  ['notificationLink', 'notifications.background'],
  ['notificationsErrorIcon', 'notifications.background'],
  ['notificationsWarningIcon', 'notifications.background'],
  ['notificationsInfoIcon', 'notifications.background'],
  ['notificationCenterHeader', 'notificationCenterHeader.background'],
  ['notifications', 'notifications.background'],
  ['quickInputList', 'quickInput.background'],
  ['quickInputTitle', 'quickInput.background'],
  ['quickInput', 'quickInput.background'],
  ['pickerGroup', 'quickInput.background'],
  ['keybindingLabel', 'keybindingLabel.background'],
  ['keybindingTable', 'quickInput.background'],
  ['listFilterWidget', 'editorWidget.background'],
  ['list', 'sideBar.background'],
  ['tree', 'sideBar.background'],
  ['gitDecoration', 'sideBar.background'],
  ['scmGraph', 'sideBar.background'],
  ['symbolIcon', 'editorSuggestWidget.background'],
  ['settings', 'editor.background'],
  ['extensionButton', 'extensionButton.prominentBackground'],
  ['extensionBadge', 'extensionBadge.remoteBackground'],
  ['extensionIcon', 'sideBar.background'],
  ['welcomePage', 'welcomePage.background'],
  ['walkThrough', 'walkThrough.embeddedEditorBackground'],
  ['notebookStatus', 'notebook.editorBackground'],
  ['notebook', 'notebook.editorBackground'],
  ['problems', 'panel.background'],
  ['testing', 'sideBar.background'],
  ['inlineChatInput', 'inlineChatInput.background'],
  ['inlineChat', 'inlineChat.background'],
  ['chat', 'sideBar.background'],
  ['menubar', 'titleBar.activeBackground'],
  ['menu', 'menu.background'],
  ['toolbar', 'editor.background'],
  ['charts', 'editor.background'],
  ['chart', 'editor.background'],
  ['ports', 'panel.background'],
  ['profileBadge', 'profileBadge.background'],
  ['banner', 'banner.background'],
  ['button', 'button.background'],
  ['badge', 'badge.background'],
  ['checkbox', 'checkbox.background'],
  ['radio', 'radio.activeBackground'],
  ['dropdown', 'dropdown.background'],
  ['input', 'input.background'],
  ['inputValidation', 'inputValidation.errorBackground'],
  ['inputOption', 'inputOption.activeBackground'],
  ['textLink', 'editor.background'],
  ['textPreformat', 'textPreformat.background'],
  ['textBlockQuote', 'textBlockQuote.background'],
  ['textSeparator', 'editor.background'],
  ['tab', 'tab.activeBackground'],
  ['icon', 'sideBar.background'],
  ['merge', 'editor.background'],
  ['mergeEditor', 'editor.background'],
  ['diffEditor', 'editor.background'],
  ['diffEditorOverview', 'editor.background'],
  ['descriptionForeground', 'editor.background'],
  ['disabledForeground', 'editor.background'],
  ['errorForeground', 'editor.background'],
  ['foreground', 'editor.background'],
];

/**
 * Translucent backgrounds whose namespace has no container of its own — without
 * these they resolve to themselves and composite over themselves, which reads
 * far more opaque than what actually reaches the eye. Where a surface is
 * ambiguous (an input box appears in the side bar, the settings editor and the
 * quick pick) the entry names the *lightest* plausible container, so the
 * measurement is the worst case for light-on-dark text.
 */
const CONTAINER = {
  'badge.background': 'sideBar.background',
  'profileBadge.background': 'activityBar.background',
  'extensionBadge.remoteBackground': 'sideBar.background',
  'editorInlayHint.background': 'editor.background',
  'inlineChatInput.background': 'inlineChat.background',
  'input.background': 'editor.background',
  'keybindingLabel.background': 'quickInput.background',
  'panelSectionHeader.background': 'panel.background',
  'peekViewEditor.background': 'editor.background',
  'radio.activeBackground': 'editor.background',
  'sideBarSectionHeader.background': 'sideBar.background',
  'textBlockQuote.background': 'editor.background',
  'textPreformat.background': 'editor.background',
};

/**
 * Deliberately de-emphasised states. WCAG 1.4.3 exempts disabled controls, and
 * inline suggestions, watermarks and placeholders are low-contrast *on purpose* —
 * they'd be worse at 4.5:1. Reported with their measured value, not failed.
 */
const DEEMPHASISED =
  /(disabled|inactive|placeholder|ghost ?text|watermark|dimmed|ignoredresource|deemphasized|unfocused|unverified|foldplaceholder|commentrange|linenumber\.foreground)/i;

/** Positional marks, not text: scrollbar ticks, guides, rules, sliders. */
const DECORATION =
  /(overview|editorruler|indentguide|bracketpairguide|slider|guide|whitespace|minimap|stroke|editorgutter\.(added|modified|deleted)|separator|border|lines$|axis$)/i;

/** Icons and control affordances: WCAG 1.4.11 asks 3:1, not 4.5:1. */
const NON_TEXT = /(icon|cursor|bracket|highlight|decoration|control|foldingcontrol|guide)/i;

const AA_TEXT = 4.5;
const AA_NON_TEXT = 3.0;

const isForeground = (key) => /[Ff]oreground$/.test(key);

/** The background a foreground actually sits on. */
function surfaceFor(key, colors) {
  if (CONTAINER[key]) return CONTAINER[key];
  const sibling = key.replace(/([Ff])oreground$/, (_, c) => (c === 'F' ? 'Background' : 'background'));
  if (sibling !== key && colors[sibling]) return sibling;
  for (const [prefix, bg] of SURFACE_TABLE) {
    if (key === prefix || key.startsWith(prefix)) {
      return colors[bg] && bg !== key ? bg : 'editor.background';
    }
  }
  return 'editor.background';
}

/** Flatten a possibly-translucent colour key down to what the eye receives. */
function opaque(key, colors, root, seen = new Set()) {
  const value = colors[key];
  if (!value) return root;
  if (value.length === 7) return value;
  const alpha = parseInt(value.slice(7, 9), 16) / 255;
  const next = surfaceFor(key, colors);
  // a surface can never sit on itself, and a cycle resolves to the canvas
  const under = next === key || seen.has(next) || seen.size > 4
    ? root
    : opaque(next, colors, root, new Set([...seen, key]));
  return blend(value.slice(0, 7), under, alpha);
}

function classify(key) {
  if (DECORATION.test(key)) return 'decoration';
  if (DEEMPHASISED.test(key)) return 'deemphasised';
  if (NON_TEXT.test(key)) return 'nonText';
  return 'text';
}

/**
 * @returns {{rows: object[], failures: object[], counts: object}}
 */
function auditTheme(theme) {
  const colors = theme.colors;
  const root = colors['editor.background'];
  const rows = [];

  for (const key of Object.keys(colors)) {
    if (!isForeground(key)) continue;
    const tier = classify(key);
    if (tier === 'decoration') {
      rows.push({ key, tier, skipped: true });
      continue;
    }
    const bgKey = surfaceFor(key, colors);
    const bg = opaque(bgKey, colors, root);
    const raw = colors[key];
    const fg = raw.length === 9 ? blend(raw.slice(0, 7), bg, parseInt(raw.slice(7, 9), 16) / 255) : raw;
    const ratio = contrastRatio(fg, bg);
    const required = tier === 'text' ? AA_TEXT : tier === 'nonText' ? AA_NON_TEXT : 0;
    rows.push({
      key, tier, bgKey, fg, bg, raw,
      translucent: raw.length === 9,
      ratio,
      lc: Math.abs(apca(fg, bg)),
      required,
      pass: ratio + 1e-9 >= required,
    });
  }

  const counts = { text: 0, nonText: 0, deemphasised: 0, decoration: 0, translucent: 0 };
  for (const r of rows) {
    counts[r.tier]++;
    if (r.translucent) counts.translucent++;
  }

  return { rows, failures: rows.filter((r) => !r.skipped && !r.pass), counts };
}

module.exports = { auditTheme, surfaceFor, opaque, classify, AA_TEXT, AA_NON_TEXT };
