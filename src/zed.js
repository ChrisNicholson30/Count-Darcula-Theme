/**
 * zed.js — the same palette, spoken in Zed's vocabulary.
 *
 * Zed is not VS Code with different key names. It has a smaller, flatter surface
 * (139 style keys against VS Code's 687), it addresses syntax through tree-sitter
 * captures rather than TextMate scopes, every colour carries an explicit alpha
 * byte, and it has no equivalent for a good deal of VS Code's chrome.
 *
 * What does carry over unchanged is the argument: the same OKLCH palette, the same
 * L*76 band, the same role table. `keyword` is rose in both editors because it is
 * rose in `src/palette.js`, not because it was typed twice.
 *
 * Every variant ships in one file — Zed themes are families, and the editor
 * lists each `themes[]` entry separately in its picker.
 */

'use strict';

const { buildPalette, VARIANTS } = require('./palette.js');
const { SCHEMA, PLAYER_SLOTS } = require('./zed-schema.js');

/** Zed wants #RRGGBBAA on every colour; the palette speaks #RRGGBB and #RRGGBBAA. */
const rgba = (hex) => (hex.length === 9 ? hex : hex + 'ff');

/** `{ color, font_style, font_weight }` — Zed requires all three, nulls included. */
const tok = (color, style = null, weight = null) => ({
  color: rgba(color),
  font_style: style,
  font_weight: weight,
});

function zedTheme(variantKey) {
  const p = buildPalette(variantKey);
  const { ui, base, muted, bright, status, a } = p;
  const light = p.isLight;

  /* Zed draws its chrome flat, so the ramp maps one step differently than in VS
     Code: `background` is the window itself, `surface` the panels either side. */
  const c = (hex) => rgba(hex);

  const style = {
    /* borders — alpha, so panes read as folds rather than a grid of boxes */
    border: c(a(ui.line, light ? 0.55 : 0.5)),
    'border.variant': c(a(ui.line, light ? 0.32 : 0.28)),
    'border.focused': c(a(base.rose, 0.55)),
    'border.selected': c(a(base.violet, 0.55)),
    'border.transparent': '#00000000',
    'border.disabled': c(a(ui.line, 0.25)),

    /* surfaces */
    'elevated_surface.background': c(ui.overlay),
    'surface.background': c(ui.surface),
    background: c(ui.chrome),

    /* interactive elements */
    'element.background': c(a(ui.subtle, 0.1)),
    'element.hover': c(a(ui.subtle, 0.2)),
    'element.active': c(a(ui.subtle, 0.3)),
    'element.selected': c(a(base.violet, light ? 0.16 : 0.2)),
    'element.disabled': c(a(ui.subtle, 0.06)),
    'drop_target.background': c(a(base.violet, 0.24)),

    'ghost_element.background': '#00000000',
    'ghost_element.hover': c(a(ui.subtle, 0.16)),
    'ghost_element.active': c(a(ui.subtle, 0.26)),
    'ghost_element.selected': c(a(base.violet, light ? 0.14 : 0.18)),
    'ghost_element.disabled': '#00000000',

    /* text — the same tiers the VS Code audit holds to AA */
    text: c(ui.fg),
    'text.muted': c(ui.dim),
    'text.placeholder': c(ui.comment),
    'text.disabled': c(a(ui.dim, 0.5)),
    'text.accent': c(base.rose),

    icon: c(ui.dim),
    'icon.muted': c(ui.comment),
    'icon.disabled': c(a(ui.dim, 0.5)),
    'icon.placeholder': c(ui.comment),
    'icon.accent': c(base.rose),

    /* chrome */
    'status_bar.background': c(ui.chrome),
    'title_bar.background': c(ui.chrome),
    'title_bar.inactive_background': c(ui.chrome),
    'toolbar.background': c(ui.editor),
    'tab_bar.background': c(ui.surface),
    'tab.inactive_background': c(ui.surface),
    'tab.active_background': c(ui.editor),

    'search.match_background': c(a(base.amber, light ? 0.3 : 0.34)),
    'search.active_match_background': c(a(base.amber, light ? 0.44 : 0.5)),

    'panel.background': c(ui.surface),
    'panel.focused_border': c(a(base.rose, 0.6)),
    'pane.focused_border': c(a(base.rose, 0.6)),

    'scrollbar.thumb.background': c(a(ui.subtle, 0.28)),
    'scrollbar.thumb.hover_background': c(a(ui.subtle, 0.45)),
    'scrollbar.thumb.border': '#00000000',
    'scrollbar.track.background': '#00000000',
    'scrollbar.track.border': c(a(ui.line, 0.2)),

    /* the canvas */
    'editor.foreground': c(ui.fg),
    'editor.background': c(ui.editor),
    'editor.gutter.background': c(ui.editor),
    'editor.subheader.background': c(ui.surface),
    'editor.active_line.background': c(a(ui.raised, light ? 0.75 : 0.9)),
    'editor.highlighted_line.background': c(a(base.violet, 0.12)),
    // matches the VS Code build: recessive, but not the near-invisible 1.9:1 it was
    'editor.line_number': c(p.mix(ui.subtle, ui.comment, 0.5)),
    'editor.active_line_number': c(ui.fg),
    'editor.hover_line_number': c(ui.dim),
    'editor.invisible': c(a(ui.subtle, light ? 0.4 : 0.32)),
    'editor.wrap_guide': c(a(ui.line, 0.4)),
    'editor.active_wrap_guide': c(a(ui.line, 0.7)),
    'editor.document_highlight.read_background': c(a(base.violet, light ? 0.12 : 0.16)),
    'editor.document_highlight.write_background': c(a(base.green, light ? 0.12 : 0.16)),

    /* terminal — the 16 ANSI slots, plus Zed's dim tier */
    'terminal.background': c(ui.surface),
    'terminal.foreground': c(ui.fg),
    'terminal.bright_foreground': c(ui.bright),
    'terminal.dim_foreground': c(ui.dim),
    'terminal.ansi.black': c(light ? ui.fg : ui.overlay),
    'terminal.ansi.bright_black': c(ui.comment),
    'terminal.ansi.dim_black': c(light ? ui.dim : ui.line),
    'terminal.ansi.red': c(base.coral),
    'terminal.ansi.bright_red': c(bright.coral),
    'terminal.ansi.dim_red': c(muted.coral),
    'terminal.ansi.green': c(base.green),
    'terminal.ansi.bright_green': c(bright.green),
    'terminal.ansi.dim_green': c(muted.green),
    'terminal.ansi.yellow': c(base.gold),
    'terminal.ansi.bright_yellow': c(bright.gold),
    'terminal.ansi.dim_yellow': c(muted.gold),
    'terminal.ansi.blue': c(base.azure),
    'terminal.ansi.bright_blue': c(bright.azure),
    'terminal.ansi.dim_blue': c(muted.azure),
    'terminal.ansi.magenta': c(base.rose),
    'terminal.ansi.bright_magenta': c(bright.rose),
    'terminal.ansi.dim_magenta': c(muted.rose),
    'terminal.ansi.cyan': c(base.teal),
    'terminal.ansi.bright_cyan': c(bright.teal),
    'terminal.ansi.dim_cyan': c(muted.teal),
    'terminal.ansi.white': c(ui.dim),
    'terminal.ansi.bright_white': c(ui.bright),
    'terminal.ansi.dim_white': c(ui.comment),

    'link_text.hover': c(bright.azure),

    /* source control */
    'version_control.added': c(status.success),
    'version_control.modified': c(base.gold),
    'version_control.deleted': c(status.error),
    'version_control.conflict_marker.ours': c(a(base.azure, 0.24)),
    'version_control.conflict_marker.theirs': c(a(base.violet, 0.24)),
    'version_control.word_added': c(a(status.success, 0.24)),
    'version_control.word_deleted': c(a(status.error, 0.24)),
  };

  /* Zed's status family: each is a triple of foreground, wash and border. */
  const statusTriple = (name, colour, wash = 0.12) => {
    style[name] = c(colour);
    style[`${name}.background`] = c(a(colour, wash));
    style[`${name}.border`] = c(a(colour, 0.4));
  };
  statusTriple('conflict', base.rose);
  statusTriple('created', status.success);
  statusTriple('deleted', status.error);
  statusTriple('error', status.error);
  statusTriple('hidden', ui.comment, 0.08);
  statusTriple('hint', base.teal, 0.1);
  statusTriple('ignored', ui.comment, 0.08);
  statusTriple('info', status.info);
  statusTriple('modified', base.gold);
  statusTriple('predictive', ui.comment, 0.08);
  statusTriple('renamed', base.teal);
  statusTriple('success', status.success);
  statusTriple('unreachable', ui.comment, 0.08);
  statusTriple('warning', status.warning);

  /* Collaborator cursors — one per accent, so eight people never collide. */
  const playerHues = ['rose', 'azure', 'green', 'gold', 'violet', 'teal', 'coral', 'amber'];
  const players = playerHues.slice(0, PLAYER_SLOTS).map((hue) => ({
    cursor: c(base[hue]),
    background: c(base[hue]),
    selection: c(a(base[hue], 0.24)),
  }));

  /* The role table from src/syntax.js, in tree-sitter's names. */
  const syntax = {
    keyword: tok(base.rose),
    'variable.special': tok(base.rose, 'italic'),
    boolean: tok(base.violet),
    constant: tok(base.amber),
    number: tok(base.amber),
    variant: tok(base.amber),

    string: tok(base.green),
    'string.escape': tok(base.teal),
    'string.regex': tok(base.green),
    'string.special': tok(base.teal),
    'string.special.symbol': tok(base.teal),
    'text.literal': tok(base.green),

    comment: tok(ui.comment, 'italic'),
    'comment.doc': tok(ui.comment, 'italic'),

    function: tok(base.azure),
    constructor: tok(base.gold),
    type: tok(base.gold),
    enum: tok(base.gold),
    namespace: tok(base.gold),
    selector: tok(base.gold),
    'selector.pseudo': tok(base.violet),

    property: tok(base.coral),
    tag: tok(base.coral),
    label: tok(base.coral),
    attribute: tok(base.amber, 'italic'),

    variable: tok(ui.fg),
    'variable.parameter': tok(base.amber, 'italic'),
    primary: tok(ui.fg),
    embedded: tok(ui.fg),

    operator: tok(base.teal),
    preproc: tok(base.violet),

    punctuation: tok(ui.dim),
    'punctuation.bracket': tok(ui.dim),
    'punctuation.delimiter': tok(ui.dim),
    'punctuation.list_marker': tok(base.rose),
    'punctuation.markup': tok(light ? base.green : muted.green),
    'punctuation.special': tok(base.rose),

    title: tok(base.rose, null, 700),
    emphasis: tok(base.amber, 'italic'),
    'emphasis.strong': tok(base.amber, null, 700),
    link_text: tok(base.azure, 'italic'),
    link_uri: tok(base.teal),

    hint: tok(ui.comment, 'italic'),
    predictive: tok(a(ui.comment, light ? 0.85 : 0.8), 'italic'),

    'diff.plus': tok(status.success),
    'diff.minus': tok(status.error),
  };

  return {
    name: p.label,
    appearance: p.type,
    style: { ...style, players, syntax },
  };
}

function buildZed() {
  return {
    $schema: SCHEMA,
    name: 'Count Darcula',
    author: 'Chris Nicholson <chris@cn-design.co.uk>',
    themes: Object.keys(VARIANTS).map(zedTheme),
  };
}

module.exports = { buildZed, zedTheme };
