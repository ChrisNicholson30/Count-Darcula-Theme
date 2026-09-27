/**
 * zed.js — the palette, spoken in Zed's vocabulary.
 *
 * Zed addresses syntax through tree-sitter captures, every colour carries an
 * explicit alpha byte, and it ignores keys it does not recognise rather than
 * erroring — so validate.js checks every emitted key against zed-schema.js.
 *
 * Both variants ship in one file — Zed themes are families, and the editor
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
    'border.focused': c(a(base.volt, 0.55)),
    'border.selected': c(a(base.iris, 0.55)),
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
    'element.selected': c(a(base.iris, light ? 0.16 : 0.2)),
    'element.disabled': c(a(ui.subtle, 0.06)),
    'drop_target.background': c(a(base.iris, 0.24)),

    'ghost_element.background': '#00000000',
    'ghost_element.hover': c(a(ui.subtle, 0.16)),
    'ghost_element.active': c(a(ui.subtle, 0.26)),
    'ghost_element.selected': c(a(base.iris, light ? 0.14 : 0.18)),
    'ghost_element.disabled': '#00000000',

    /* text — every tier audit.js holds to AA */
    text: c(ui.fg),
    'text.muted': c(ui.dim),
    'text.placeholder': c(ui.comment),
    'text.disabled': c(a(ui.dim, 0.5)),
    'text.accent': c(base.volt),

    icon: c(ui.dim),
    'icon.muted': c(ui.comment),
    'icon.disabled': c(a(ui.dim, 0.5)),
    'icon.placeholder': c(ui.comment),
    'icon.accent': c(base.volt),

    /* chrome */
    'status_bar.background': c(ui.chrome),
    'title_bar.background': c(ui.chrome),
    'title_bar.inactive_background': c(ui.chrome),
    'toolbar.background': c(ui.editor),
    'tab_bar.background': c(ui.surface),
    'tab.inactive_background': c(ui.surface),
    'tab.active_background': c(ui.editor),

    'search.match_background': c(a(base.tangerine, light ? 0.3 : 0.34)),
    'search.active_match_background': c(a(base.tangerine, light ? 0.44 : 0.5)),

    'panel.background': c(ui.surface),
    'panel.focused_border': c(a(base.volt, 0.6)),
    'pane.focused_border': c(a(base.volt, 0.6)),

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
    'editor.highlighted_line.background': c(a(base.iris, 0.12)),
    // recessive, but never near-invisible
    'editor.line_number': c(p.mix(ui.subtle, ui.comment, 0.5)),
    'editor.active_line_number': c(ui.fg),
    'editor.hover_line_number': c(ui.dim),
    'editor.invisible': c(a(ui.subtle, light ? 0.4 : 0.32)),
    'editor.wrap_guide': c(a(ui.line, 0.4)),
    'editor.active_wrap_guide': c(a(ui.line, 0.7)),
    'editor.document_highlight.read_background': c(a(base.iris, light ? 0.12 : 0.16)),
    'editor.document_highlight.write_background': c(a(base.mint, light ? 0.12 : 0.16)),

    /* terminal — the 16 ANSI slots, plus Zed's dim tier */
    'terminal.background': c(ui.surface),
    'terminal.foreground': c(ui.fg),
    'terminal.bright_foreground': c(ui.bright),
    'terminal.dim_foreground': c(ui.dim),
    'terminal.ansi.black': c(light ? ui.fg : ui.overlay),
    'terminal.ansi.bright_black': c(ui.comment),
    'terminal.ansi.dim_black': c(light ? ui.dim : ui.line),
    'terminal.ansi.red': c(base.ember),
    'terminal.ansi.bright_red': c(bright.ember),
    'terminal.ansi.dim_red': c(muted.ember),
    'terminal.ansi.green': c(base.mint),
    'terminal.ansi.bright_green': c(bright.mint),
    'terminal.ansi.dim_green': c(muted.mint),
    'terminal.ansi.yellow': c(base.citrine),
    'terminal.ansi.bright_yellow': c(bright.citrine),
    'terminal.ansi.dim_yellow': c(muted.citrine),
    'terminal.ansi.blue': c(base.cobalt),
    'terminal.ansi.bright_blue': c(bright.cobalt),
    'terminal.ansi.dim_blue': c(muted.cobalt),
    'terminal.ansi.magenta': c(base.orchid),
    'terminal.ansi.bright_magenta': c(bright.orchid),
    'terminal.ansi.dim_magenta': c(muted.orchid),
    'terminal.ansi.cyan': c(base.volt),
    'terminal.ansi.bright_cyan': c(bright.volt),
    'terminal.ansi.dim_cyan': c(muted.volt),
    'terminal.ansi.white': c(ui.dim),
    'terminal.ansi.bright_white': c(ui.bright),
    'terminal.ansi.dim_white': c(ui.comment),

    'link_text.hover': c(bright.cobalt),

    /* source control */
    'version_control.added': c(status.success),
    'version_control.modified': c(base.citrine),
    'version_control.deleted': c(status.error),
    'version_control.conflict_marker.ours': c(a(base.cobalt, 0.24)),
    'version_control.conflict_marker.theirs': c(a(base.iris, 0.24)),
    'version_control.word_added': c(a(status.success, 0.24)),
    'version_control.word_deleted': c(a(status.error, 0.24)),
  };

  /* Zed's status family: each is a triple of foreground, wash and border. */
  const statusTriple = (name, colour, wash = 0.12) => {
    style[name] = c(colour);
    style[`${name}.background`] = c(a(colour, wash));
    style[`${name}.border`] = c(a(colour, 0.4));
  };
  statusTriple('conflict', base.orchid);
  statusTriple('created', status.success);
  statusTriple('deleted', status.error);
  statusTriple('error', status.error);
  statusTriple('hidden', ui.comment, 0.08);
  statusTriple('hint', base.cobalt, 0.1);
  statusTriple('ignored', ui.comment, 0.08);
  statusTriple('info', status.info);
  statusTriple('modified', base.citrine);
  statusTriple('predictive', ui.comment, 0.08);
  statusTriple('renamed', base.volt);
  statusTriple('success', status.success);
  statusTriple('unreachable', ui.comment, 0.08);
  statusTriple('warning', status.warning);

  /* Collaborator cursors — one per accent, so eight people never collide. */
  const playerHues = ['volt', 'orchid', 'mint', 'citrine', 'iris', 'cobalt', 'ember', 'tangerine'];
  const players = playerHues.slice(0, PLAYER_SLOTS).map((hue) => ({
    cursor: c(base[hue]),
    background: c(base[hue]),
    selection: c(a(base[hue], 0.24)),
  }));

  /* The role table. Colour means one thing in every language:
       volt       keywords & storage        the shape of the program
       citrine    things you call           functions, methods
       tangerine  things you instantiate    types, classes, namespaces
       cobalt     things you address        properties, keys, tags
       mint       literal text              strings
       orchid     literal values            numbers, constants, parameters
       ember      machinery                 operators, escapes, symbols
       iris       the language's own words  booleans, preprocessor, pseudo-selectors
       fg         your own variables        the default, and deliberately the quietest
     Italics only where slant carries information colour cannot: comments,
     parameters, attributes, `self`/`this`. */
  const syntax = {
    keyword: tok(base.volt),
    'variable.special': tok(base.volt, 'italic'),
    boolean: tok(base.iris),
    constant: tok(base.orchid),
    number: tok(base.orchid),
    variant: tok(base.orchid),

    string: tok(base.mint),
    'string.escape': tok(base.ember),
    'string.regex': tok(base.mint),
    'string.special': tok(base.ember),
    'string.special.symbol': tok(base.ember),
    'text.literal': tok(base.mint),

    comment: tok(ui.comment, 'italic'),
    'comment.doc': tok(ui.comment, 'italic'),

    function: tok(base.citrine),
    constructor: tok(base.tangerine),
    type: tok(base.tangerine),
    enum: tok(base.tangerine),
    namespace: tok(base.tangerine),
    selector: tok(base.tangerine),
    'selector.pseudo': tok(base.iris),

    property: tok(base.cobalt),
    tag: tok(base.cobalt),
    label: tok(base.cobalt),
    attribute: tok(base.orchid, 'italic'),

    variable: tok(ui.fg),
    'variable.parameter': tok(base.orchid, 'italic'),
    primary: tok(ui.fg),
    embedded: tok(ui.fg),

    operator: tok(base.ember),
    preproc: tok(base.iris),

    punctuation: tok(ui.dim),
    'punctuation.bracket': tok(ui.dim),
    'punctuation.delimiter': tok(ui.dim),
    'punctuation.list_marker': tok(base.volt),
    'punctuation.markup': tok(light ? base.mint : muted.mint),
    'punctuation.special': tok(base.volt),

    title: tok(base.volt, null, 700),
    emphasis: tok(base.orchid, 'italic'),
    'emphasis.strong': tok(base.tangerine, null, 700),
    link_text: tok(base.cobalt, 'italic'),
    link_uri: tok(base.volt),

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
