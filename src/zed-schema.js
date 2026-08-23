/**
 * zed-schema.js — the Zed theme vocabulary, snapshotted so the build can be checked.
 *
 * Zed rejects unknown keys silently rather than loudly: a typo does not error, the
 * colour simply never applies and you find out by squinting at the editor. So the
 * validator checks every key we emit against this list, and reports the ones we
 * leave for Zed to default.
 *
 * Source: assets/themes/one/one.json in zed-industries/zed, the built-in One theme,
 * which the schema at https://zed.dev/schema/themes/v0.2.0.json is generated from.
 * 139 style keys, 46 syntax captures, 8 player slots.
 */

'use strict';

const SCHEMA = 'https://zed.dev/schema/themes/v0.2.0.json';

/** Every property allowed inside a theme's `style`, excluding `players` and `syntax`. */
const STYLE_KEYS = [
  'border',                                    'border.variant',
  'border.focused',                            'border.selected',
  'border.transparent',                        'border.disabled',
  'elevated_surface.background',               'surface.background',
  'background',                                'element.background',
  'element.hover',                             'element.active',
  'element.selected',                          'element.disabled',
  'drop_target.background',                    'ghost_element.background',
  'ghost_element.hover',                       'ghost_element.active',
  'ghost_element.selected',                    'ghost_element.disabled',
  'text',                                      'text.muted',
  'text.placeholder',                          'text.disabled',
  'text.accent',                               'icon',
  'icon.muted',                                'icon.disabled',
  'icon.placeholder',                          'icon.accent',
  'status_bar.background',                     'title_bar.background',
  'title_bar.inactive_background',             'toolbar.background',
  'tab_bar.background',                        'tab.inactive_background',
  'tab.active_background',                     'search.match_background',
  'search.active_match_background',            'panel.background',
  'panel.focused_border',                      'pane.focused_border',
  'scrollbar.thumb.background',                'scrollbar.thumb.hover_background',
  'scrollbar.thumb.border',                    'scrollbar.track.background',
  'scrollbar.track.border',                    'editor.foreground',
  'editor.background',                         'editor.gutter.background',
  'editor.subheader.background',               'editor.active_line.background',
  'editor.highlighted_line.background',        'editor.line_number',
  'editor.active_line_number',                 'editor.hover_line_number',
  'editor.invisible',                          'editor.wrap_guide',
  'editor.active_wrap_guide',                  'editor.document_highlight.read_background',
  'editor.document_highlight.write_background', 'terminal.background',
  'terminal.foreground',                       'terminal.bright_foreground',
  'terminal.dim_foreground',                   'terminal.ansi.black',
  'terminal.ansi.bright_black',                'terminal.ansi.dim_black',
  'terminal.ansi.red',                         'terminal.ansi.bright_red',
  'terminal.ansi.dim_red',                     'terminal.ansi.green',
  'terminal.ansi.bright_green',                'terminal.ansi.dim_green',
  'terminal.ansi.yellow',                      'terminal.ansi.bright_yellow',
  'terminal.ansi.dim_yellow',                  'terminal.ansi.blue',
  'terminal.ansi.bright_blue',                 'terminal.ansi.dim_blue',
  'terminal.ansi.magenta',                     'terminal.ansi.bright_magenta',
  'terminal.ansi.dim_magenta',                 'terminal.ansi.cyan',
  'terminal.ansi.bright_cyan',                 'terminal.ansi.dim_cyan',
  'terminal.ansi.white',                       'terminal.ansi.bright_white',
  'terminal.ansi.dim_white',                   'link_text.hover',
  'version_control.added',                     'version_control.modified',
  'version_control.word_added',                'version_control.word_deleted',
  'version_control.deleted',                   'version_control.conflict_marker.ours',
  'version_control.conflict_marker.theirs',    'conflict',
  'conflict.background',                       'conflict.border',
  'created',                                   'created.background',
  'created.border',                            'deleted',
  'deleted.background',                        'deleted.border',
  'error',                                     'error.background',
  'error.border',                              'hidden',
  'hidden.background',                         'hidden.border',
  'hint',                                      'hint.background',
  'hint.border',                               'ignored',
  'ignored.background',                        'ignored.border',
  'info',                                      'info.background',
  'info.border',                               'modified',
  'modified.background',                       'modified.border',
  'predictive',                                'predictive.background',
  'predictive.border',                         'renamed',
  'renamed.background',                        'renamed.border',
  'success',                                   'success.background',
  'success.border',                            'unreachable',
  'unreachable.background',                    'unreachable.border',
  'warning',                                   'warning.background',
  'warning.border',
];

/** Every tree-sitter capture Zed maps to a syntax style. */
const SYNTAX_KEYS = [
  'attribute',                   'boolean',                     'comment',
  'comment.doc',                 'constant',                    'constructor',
  'diff.minus',                  'diff.plus',                   'embedded',
  'emphasis',                    'emphasis.strong',             'enum',
  'function',                    'hint',                        'keyword',
  'label',                       'link_text',                   'link_uri',
  'namespace',                   'number',                      'operator',
  'predictive',                  'preproc',                     'primary',
  'property',                    'punctuation',                 'punctuation.bracket',
  'punctuation.delimiter',       'punctuation.list_marker',     'punctuation.markup',
  'punctuation.special',         'selector',                    'selector.pseudo',
  'string',                      'string.escape',               'string.regex',
  'string.special',              'string.special.symbol',       'tag',
  'text.literal',                'title',                       'type',
  'variable',                    'variable.parameter',          'variable.special',
  'variant',
];

/** Zed themes carry 8 collaborator cursor slots. */
const PLAYER_SLOTS = 8;

module.exports = { SCHEMA, STYLE_KEYS, SYNTAX_KEYS, PLAYER_SLOTS };
