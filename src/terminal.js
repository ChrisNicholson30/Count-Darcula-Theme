/**
 * terminal.js — the integrated terminal, including the 16 ANSI slots.
 *
 * The ANSI set is the one place a theme meets software it does not control:
 * `ls`, `git`, spinners, TUIs. So the normal set uses the syntax band (already
 * proven >= 4.5:1) and the bright set uses the bright band. On the light
 * variant "bright" means *more saturated*, not lighter, because a lighter
 * bright-yellow on paper is unreadable and that is where most light themes
 * fall over.
 */

'use strict';

module.exports = function terminal(p) {
  const { ui, base, bright, strong, status, a } = p;
  const light = p.isLight;

  const normal = light ? base : base;
  const vivid = light ? strong : bright;

  return {
    'terminal.background': ui.surface,
    'terminal.foreground': ui.fg,
    'terminal.border': p.a(ui.line, 0.32),
    'terminal.selectionBackground': a(base.azure, light ? 0.24 : 0.28),
    'terminal.inactiveSelectionBackground': a(base.azure, 0.14),
    'terminal.hoverHighlightBackground': a(base.azure, 0.12),
    'terminal.findMatchBackground': a(base.amber, 0.34),
    'terminal.findMatchBorder': a(base.amber, 0.7),
    'terminal.findMatchHighlightBackground': a(base.amber, 0.18),
    'terminal.findMatchHighlightBorder': a(base.amber, 0.35),
    'terminal.dropBackground': a(base.violet, 'soft'),
    'terminal.tab.activeBorder': base.rose,
    'terminalCursor.foreground': light ? base.rose : bright.rose,
    'terminalCursor.background': ui.surface,
    'terminalCommandDecoration.defaultBackground': a(ui.subtle, 0.5),
    'terminalCommandDecoration.successBackground': status.success,
    'terminalCommandDecoration.errorBackground': status.error,
    'terminalOverviewRuler.cursorForeground': a(base.rose, 0.6),
    'terminalOverviewRuler.findMatchForeground': a(base.amber, 0.6),
    'terminalStickyScroll.background': ui.surface,
    'terminalStickyScrollHover.background': ui.raised,
    'terminalCommandGuide.foreground': a(base.rose, 0.35),

    'terminal.ansiBlack': light ? ui.bright : ui.overlay,
    'terminal.ansiRed': normal.coral,
    'terminal.ansiGreen': normal.green,
    'terminal.ansiYellow': normal.gold,
    'terminal.ansiBlue': normal.azure,
    'terminal.ansiMagenta': normal.rose,
    'terminal.ansiCyan': normal.teal,
    'terminal.ansiWhite': light ? ui.dim : ui.dim,
    'terminal.ansiBrightBlack': light ? ui.dim : ui.comment,
    'terminal.ansiBrightRed': vivid.coral,
    'terminal.ansiBrightGreen': vivid.green,
    'terminal.ansiBrightYellow': vivid.gold,
    'terminal.ansiBrightBlue': vivid.azure,
    'terminal.ansiBrightMagenta': vivid.rose,
    'terminal.ansiBrightCyan': vivid.teal,
    'terminal.ansiBrightWhite': light ? ui.bright : ui.bright,
  };
};
