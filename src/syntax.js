/**
 * syntax.js — token colours.
 *
 * THE RULE SYSTEM
 * Colour means one thing across every language. Learn it once and every file
 * you open — TS, Rust, Python, YAML, CSS — reads the same way:
 *
 *   rose    keywords & storage        the shape of the program (if, class, fn)
 *   violet  flow & metaprogramming    return, await, decorators, macros
 *   azure   things you call           functions, methods, ids
 *   gold    things you instantiate    classes, types, interfaces, components
 *   coral   things you address        properties, keys, tags, attributes' hosts
 *   green   literal text              strings
 *   amber   literal values            numbers, constants, parameters
 *   teal    machinery                 operators, escapes, regex, built-ins
 *   fg      your own variables        the default, and deliberately the quietest
 *
 * ITALICS
 * Used only where slant carries information you cannot get from colour alone:
 * comments, parameters, `this`/`self`, type parameters, HTML attributes and
 * markdown emphasis. Not on keywords — at 13px, slanted keywords on every other
 * line is exactly the kind of low-grade friction that adds up over a day.
 * (README has a two-line snippet if you want them.)
 */

'use strict';

module.exports = function syntax(p) {
  const { ui, base, muted, status } = p;

  /* ── roles ─────────────────────────────────────────────────────────── */
  const r = {
    comment: { foreground: ui.comment, fontStyle: 'italic' },
    docTag: { foreground: muted.teal, fontStyle: 'italic' },
    string: { foreground: base.green },
    stringPunct: { foreground: muted.green },
    escape: { foreground: base.teal },
    regexp: { foreground: base.green },
    regexpMeta: { foreground: base.teal },
    number: { foreground: base.amber },
    constant: { foreground: base.amber },
    langConstant: { foreground: base.violet },
    keyword: { foreground: base.rose },
    flow: { foreground: base.violet },
    operator: { foreground: base.teal },
    storage: { foreground: base.rose },
    modifier: { foreground: base.rose },
    func: { foreground: base.azure },
    builtin: { foreground: base.teal },
    type: { foreground: base.gold },
    typeParam: { foreground: base.gold, fontStyle: 'italic' },
    variable: { foreground: ui.fg },
    param: { foreground: base.amber, fontStyle: 'italic' },
    self: { foreground: base.rose, fontStyle: 'italic' },
    property: { foreground: base.coral },
    tag: { foreground: base.coral },
    component: { foreground: base.gold },
    attribute: { foreground: base.amber, fontStyle: 'italic' },
    punctuation: { foreground: ui.dim },
    delimiter: { foreground: p.a(ui.dim, 0.8) },
    decorator: { foreground: base.violet },
    label: { foreground: base.coral },
    link: { foreground: base.azure, fontStyle: 'underline' },
    invalid: { foreground: status.error },
  };

  const rule = (scope, settings) => ({ scope, settings });

  /* ── TextMate scopes ───────────────────────────────────────────────── */
  const tokenColors = [
    { scope: ['source', 'text'], settings: { foreground: ui.fg } },

    /* comments ------------------------------------------------------- */
    rule(
      ['comment', 'punctuation.definition.comment', 'comment.block', 'comment.line', 'string.comment'],
      r.comment
    ),
    rule(
      [
        'comment.block.documentation',
        'comment.block.documentation punctuation.definition.comment',
        'string.quoted.docstring',
        'string.quoted.docstring punctuation.definition.string',
      ],
      { foreground: ui.comment, fontStyle: 'italic' }
    ),
    rule(
      [
        'storage.type.class.jsdoc',
        'punctuation.definition.block.tag.jsdoc',
        'comment keyword.other.documentation',
        'comment.block.documentation entity.name.type',
        'comment.block.documentation storage.type',
        'keyword.other.phpdoc',
        'entity.name.tag.doc',
      ],
      r.docTag
    ),
    rule(['comment.block.documentation variable', 'comment.block.documentation variable.other'], {
      foreground: muted.amber,
      fontStyle: 'italic',
    }),
    rule(['comment.line.region', 'comment.block.region', 'meta.preprocessor.region'], {
      foreground: muted.violet,
      fontStyle: 'italic',
    }),
    rule(['keyword.codetag.notation', 'comment keyword.codetag'], {
      foreground: base.coral,
      fontStyle: 'bold',
    }),

    /* strings -------------------------------------------------------- */
    rule(['string', 'string.quoted', 'string.template', 'meta.attribute-selector string'], r.string),
    rule(
      [
        'punctuation.definition.string.begin',
        'punctuation.definition.string.end',
        'punctuation.definition.string.template.begin',
        'punctuation.definition.string.template.end',
      ],
      r.stringPunct
    ),
    rule(
      [
        'constant.character.escape',
        'constant.other.placeholder',
        'constant.character.escape punctuation',
        'string.interpolated punctuation.definition',
      ],
      r.escape
    ),
    rule(
      [
        'punctuation.definition.template-expression',
        'punctuation.section.embedded',
        'meta.embedded punctuation.section',
        'punctuation.definition.interpolation',
      ],
      { foreground: base.rose }
    ),
    rule(['meta.template.expression', 'meta.embedded.line'], { foreground: ui.fg }),

    /* regex ---------------------------------------------------------- */
    rule(['string.regexp', 'source.regexp', 'string.regexp punctuation.definition.string'], r.regexp),
    rule(
      [
        'string.regexp keyword.operator',
        'string.regexp keyword.control',
        'constant.other.character-class.regexp',
        'constant.other.character-class.set.regexp',
        'keyword.operator.quantifier.regexp',
        'keyword.control.anchor.regexp',
        'punctuation.definition.group.regexp',
        'punctuation.definition.character-class.regexp',
        'meta.assertion.regexp',
      ],
      r.regexpMeta
    ),
    rule(['constant.character.escape.backslash.regexp', 'constant.character.escape.regexp'], {
      foreground: base.violet,
    }),

    /* numbers & constants -------------------------------------------- */
    rule(
      [
        'constant.numeric',
        'constant.numeric.integer',
        'constant.numeric.float',
        'constant.numeric.hex',
        'constant.numeric.binary',
        'constant.numeric.octal',
        'keyword.other.unit',
        'keyword.operator.plus.exponent',
        'keyword.operator.minus.exponent',
      ],
      r.number
    ),
    rule(
      [
        'constant',
        'constant.other',
        'constant.other.caps',
        'variable.other.constant',
        'constant.other.symbol',
        'constant.other.key',
        'support.constant',
        'support.constant.math',
        'support.constant.property-value',
      ],
      r.constant
    ),
    rule(
      [
        'constant.language',
        'constant.language.boolean',
        'constant.language.null',
        'constant.language.undefined',
        'constant.language.nan',
        'constant.language.infinity',
        'keyword.constant',
        'variable.language.super',
      ],
      r.langConstant
    ),

    /* keywords, storage, flow ---------------------------------------- */
    rule(
      [
        'keyword',
        'keyword.other',
        'keyword.operator.new',
        'keyword.operator.delete',
        'keyword.operator.expression',
        'keyword.operator.logical.python',
        'keyword.operator.wordlike',
        'keyword.declaration',
      ],
      r.keyword
    ),
    rule(
      [
        'keyword.control',
        'keyword.control.flow',
        'keyword.control.trycatch',
        'keyword.control.loop',
        'keyword.control.conditional',
        'keyword.control.exception',
        'keyword.control.return',
        'keyword.control.yield',
        'keyword.control.await',
        'keyword.other.await',
        'keyword.control.switch',
        'keyword.control.default',
        'keyword.control.match',
        'keyword.control.goto',
      ],
      r.flow
    ),
    rule(
      [
        'keyword.control.import',
        'keyword.control.export',
        'keyword.control.from',
        'keyword.control.as',
        'keyword.other.import',
        'keyword.other.package',
        'keyword.other.using',
        'meta.import keyword.other',
        'meta.export keyword.other',
      ],
      r.keyword
    ),
    rule(['storage', 'storage.type', 'storage.type.function', 'storage.type.class', 'storage.type.namespace'], r.storage),
    rule(
      [
        'storage.modifier',
        'storage.modifier.async',
        'storage.modifier.access',
        'keyword.other.type',
        'storage.type.property',
      ],
      r.modifier
    ),
    rule(['keyword.operator', 'keyword.operator.assignment', 'keyword.operator.arithmetic',
      'keyword.operator.comparison', 'keyword.operator.relational', 'keyword.operator.bitwise',
      'keyword.operator.ternary', 'keyword.operator.spread', 'keyword.operator.rest',
      'keyword.operator.optional', 'keyword.operator.type.annotation', 'keyword.operator.arrow',
      'keyword.operator.definiteassignment', 'keyword.operator.assignment.compound',
      'storage.type.function.arrow'], r.operator),

    /* functions ------------------------------------------------------- */
    rule(
      [
        'entity.name.function',
        'meta.function-call entity.name.function',
        'meta.function-call.generic',
        'variable.function',
        'meta.definition.method entity.name.function',
        'entity.name.method',
        'meta.function.python entity.name.function',
      ],
      r.func
    ),
    rule(
      [
        'support.function',
        'support.function.builtin',
        'support.function.magic',
        'meta.function-call support.function',
        'entity.name.function.preprocessor',
        'support.function.misc',
      ],
      r.builtin
    ),
    rule(['entity.name.function.constructor', 'variable.language.this.constructor'], {
      foreground: base.gold,
    }),

    /* types, classes, namespaces -------------------------------------- */
    rule(
      [
        'entity.name.type',
        'entity.name.class',
        'entity.name.type.class',
        'entity.name.type.interface',
        'entity.name.type.enum',
        'entity.name.type.struct',
        'entity.name.type.module',
        'entity.name.type.alias',
        'entity.other.inherited-class',
        'support.class',
        'support.type',
        'support.type.object',
        'entity.name.scope-resolution',
        'meta.type.annotation entity.name.type',
        'storage.type.annotation',
      ],
      r.type
    ),
    rule(['entity.name.type.parameter', 'entity.name.type.type-parameter', 'meta.type.parameters entity.name.type', 'storage.type.generic'], r.typeParam),
    rule(['entity.name.namespace', 'entity.name.module', 'entity.name.package', 'support.other.namespace'], {
      foreground: base.gold,
    }),
    rule(['support.type.primitive', 'support.type.builtin', 'storage.type.primitive', 'keyword.type'], {
      foreground: base.gold,
    }),

    /* variables, parameters, properties ------------------------------- */
    rule(['variable', 'variable.other', 'variable.other.readwrite', 'meta.definition.variable variable'], r.variable),
    rule(
      [
        'variable.parameter',
        'meta.parameters variable',
        'meta.function.parameters variable',
        'variable.parameter.function-call',
        'meta.at-rule.function variable',
      ],
      r.param
    ),
    rule(
      [
        'variable.language.this',
        'variable.language.self',
        'variable.language.special.self',
        'keyword.other.this',
        'variable.parameter.function.language.special.self',
        'variable.language',
      ],
      r.self
    ),
    rule(
      [
        'variable.other.property',
        'variable.other.object.property',
        'meta.object-literal.key',
        'support.variable.property',
        'variable.other.member',
        'entity.name.variable.field',
        'variable.other.enummember',
      ],
      r.property
    ),
    rule(['variable.other.constant.property', 'support.constant.dom'], { foreground: base.coral }),
    rule(['support.variable', 'support.variable.dom', 'support.variable.object'], { foreground: base.teal }),
    rule(['entity.name.label', 'entity.name.goto-label'], r.label),

    /* decorators & macros --------------------------------------------- */
    rule(
      [
        'meta.decorator',
        'meta.decorator entity.name.function',
        'meta.decorator variable.other',
        'entity.name.function.decorator',
        'punctuation.decorator',
        'storage.type.annotation.java',
        'meta.attribute.rust',
        'entity.name.function.macro',
        'entity.name.function.macro.rules',
        'support.function.macro',
        'meta.preprocessor',
        'keyword.control.directive',
        'entity.name.function.preprocessor.c',
      ],
      r.decorator
    ),

    /* punctuation ------------------------------------------------------ */
    rule(
      [
        'punctuation.separator',
        'punctuation.terminator',
        'punctuation.definition.parameters',
        'punctuation.definition.arguments',
        'punctuation.definition.dict',
        'punctuation.definition.list',
        'meta.brace',
        'punctuation.section.arguments',
        'punctuation.section.parameters',
      ],
      r.punctuation
    ),
    rule(['punctuation.accessor', 'punctuation.separator.key-value', 'punctuation.separator.dictionary'], r.delimiter),

    /* markup: HTML / JSX / Vue / Svelte -------------------------------- */
    rule(['entity.name.tag', 'entity.name.tag.html', 'entity.name.tag.other', 'meta.tag'], r.tag),
    rule(
      [
        'punctuation.definition.tag',
        'punctuation.definition.tag.begin',
        'punctuation.definition.tag.end',
        'punctuation.definition.tag.html',
      ],
      { foreground: p.a(base.coral, 0.65) }
    ),
    rule(
      [
        'entity.other.attribute-name',
        'entity.other.attribute-name.html',
        'meta.tag entity.other.attribute-name',
      ],
      r.attribute
    ),
    rule(
      [
        'support.class.component',
        'entity.name.tag.jsx',
        'entity.name.tag.tsx',
        'support.class.component.jsx',
        'entity.name.tag.namespace',
        'meta.tag.custom entity.name.tag',
      ],
      r.component
    ),
    rule(['entity.name.tag.doctype', 'meta.tag.sgml.doctype', 'meta.tag.metadata.doctype'], {
      foreground: muted.violet,
      fontStyle: 'italic',
    }),
    rule(['entity.other.attribute-name.class.jsx', 'meta.directive.vue', 'entity.other.attribute-name.vue', 'entity.other.attribute-name.svelte'], {
      foreground: base.violet,
      fontStyle: 'italic',
    }),

    /* CSS / SCSS / LESS ------------------------------------------------ */
    rule(['support.type.property-name.css', 'support.type.property-name', 'meta.property-name'], {
      foreground: base.coral,
    }),
    rule(['entity.name.tag.css', 'entity.name.tag.scss', 'meta.selector entity.name.tag'], {
      foreground: base.coral,
    }),
    rule(['entity.other.attribute-name.class.css', 'entity.other.attribute-name.class'], {
      foreground: base.gold,
    }),
    rule(['entity.other.attribute-name.id', 'entity.other.attribute-name.id.css'], { foreground: base.azure }),
    rule(
      [
        'entity.other.attribute-name.pseudo-class',
        'entity.other.attribute-name.pseudo-element',
        'entity.other.attribute-name.placeholder',
      ],
      { foreground: base.violet }
    ),
    rule(['support.constant.property-value.css', 'support.constant.font-name', 'meta.property-value'], {
      foreground: base.amber,
    }),
    rule(['keyword.other.unit.css', 'constant.numeric.css'], { foreground: base.amber }),
    rule(['support.function.misc.css', 'support.function.transform', 'support.function.calc'], {
      foreground: base.azure,
    }),
    rule(['variable.css', 'variable.argument.css', 'support.type.custom-property.css', 'variable.other.custom-property'], {
      foreground: base.teal,
    }),
    rule(['keyword.control.at-rule', 'keyword.control.at-rule.css', 'punctuation.definition.keyword.css'], {
      foreground: base.rose,
    }),
    rule(['keyword.other.important', 'keyword.other.important.css'], { foreground: base.coral, fontStyle: 'bold' }),

    /* data: JSON / YAML / TOML / INI ---------------------------------- */
    rule(
      [
        'support.type.property-name.json',
        'support.type.property-name.json punctuation',
        'meta.structure.dictionary.json support.type.property-name',
      ],
      { foreground: base.coral }
    ),
    rule(['support.type.property-name.json.comments'], { foreground: base.coral }),
    rule(['entity.name.tag.yaml', 'entity.name.tag.yaml punctuation', 'string.unquoted.plain.out.yaml entity.name.tag'], {
      foreground: base.coral,
    }),
    rule(['string.unquoted.plain.out.yaml', 'string.unquoted.plain.in.yaml', 'string.unquoted.block.yaml'], {
      foreground: base.green,
    }),
    rule(['punctuation.definition.anchor.yaml', 'entity.name.type.anchor.yaml', 'variable.other.alias.yaml'], {
      foreground: base.violet,
    }),
    rule(['keyword.key.toml', 'support.type.property-name.toml', 'entity.name.tag.toml'], { foreground: base.coral }),
    rule(['entity.name.section.toml', 'entity.name.section.group-title.ini'], { foreground: base.gold, fontStyle: 'bold' }),
    rule(['keyword.other.definition.ini'], { foreground: base.coral }),

    /* markdown --------------------------------------------------------- */
    rule(['markup.heading', 'markup.heading entity.name', 'entity.name.section.markdown'], {
      foreground: base.rose,
      fontStyle: 'bold',
    }),
    rule(['heading.1.markdown', 'markup.heading.1'], { foreground: base.rose, fontStyle: 'bold' }),
    rule(['heading.2.markdown', 'markup.heading.2'], { foreground: base.violet, fontStyle: 'bold' }),
    rule(['heading.3.markdown', 'markup.heading.3'], { foreground: base.azure, fontStyle: 'bold' }),
    rule(['heading.4.markdown', 'markup.heading.4'], { foreground: base.teal, fontStyle: 'bold' }),
    rule(['heading.5.markdown', 'markup.heading.5'], { foreground: base.green, fontStyle: 'bold' }),
    rule(['heading.6.markdown', 'markup.heading.6'], { foreground: base.gold, fontStyle: 'bold' }),
    rule(['punctuation.definition.heading.markdown'], { foreground: p.a(base.rose, 0.55) }),
    rule(['markup.bold', 'markup.bold string'], { foreground: base.amber, fontStyle: 'bold' }),
    rule(['markup.italic', 'markup.italic string'], { foreground: base.amber, fontStyle: 'italic' }),
    rule(['markup.bold markup.italic', 'markup.italic markup.bold'], { foreground: base.amber, fontStyle: 'bold italic' }),
    rule(['markup.strikethrough'], { foreground: ui.comment, fontStyle: 'strikethrough' }),
    rule(['markup.underline'], { fontStyle: 'underline' }),
    rule(['markup.quote', 'markup.quote punctuation.definition.quote', 'beginning.punctuation.definition.quote.markdown'], {
      foreground: ui.comment,
      fontStyle: 'italic',
    }),
    rule(['markup.list', 'beginning.punctuation.definition.list.markdown', 'punctuation.definition.list.begin.markdown'], {
      foreground: base.rose,
    }),
    rule(['markup.inline.raw', 'markup.inline.raw string', 'markup.raw.block'], { foreground: base.green }),
    rule(['markup.fenced_code.block', 'markup.raw.block.fenced.markdown', 'punctuation.definition.markdown'], {
      foreground: muted.green,
    }),
    rule(['fenced_code.block.language', 'markup.fenced_code.block.markdown support'], { foreground: muted.teal, fontStyle: 'italic' }),
    rule(['markup.underline.link', 'markup.underline.link.image', 'string.other.link'], r.link),
    rule(['string.other.link.title.markdown', 'string.other.link.description.markdown', 'markup.link'], {
      foreground: base.teal,
    }),
    rule(['meta.separator.markdown', 'markup.heading.setext'], { foreground: p.a(ui.subtle, 0.8) }),
    rule(['markup.table', 'punctuation.definition.table'], { foreground: ui.dim }),

    /* diff & git ------------------------------------------------------ */
    rule(['markup.inserted', 'markup.inserted.diff', 'meta.diff.header.to-file'], { foreground: status.success }),
    rule(['markup.deleted', 'markup.deleted.diff', 'meta.diff.header.from-file'], { foreground: status.error }),
    rule(['markup.changed', 'markup.changed.diff'], { foreground: base.gold }),
    rule(['meta.diff.header', 'meta.diff.range', 'punctuation.definition.range.diff'], { foreground: base.violet }),
    rule(['meta.diff.index', 'meta.diff.header.command'], { foreground: ui.comment }),

    /* shell ------------------------------------------------------------ */
    rule(['variable.other.normal.shell', 'variable.other.special.shell', 'punctuation.definition.variable.shell'], {
      foreground: base.coral,
    }),
    rule(['support.function.builtin.shell', 'entity.name.command.shell'], { foreground: base.azure }),
    rule(['constant.other.option', 'constant.other.option.shell', 'string.unquoted.argument'], { foreground: base.amber }),
    rule(['entity.name.function.shell', 'meta.function.shell entity.name.function'], { foreground: base.azure }),

    /* language flavour ------------------------------------------------- */
    rule(['entity.name.function.decorator.python', 'meta.function.decorator.python'], { foreground: base.violet }),
    rule(['support.type.exception.python', 'support.type.python'], { foreground: base.gold }),
    rule(['meta.function-call.arguments.python variable'], { foreground: ui.fg }),
    rule(['storage.type.string.python', 'string.quoted.raw.python storage'], { foreground: base.rose }),
    rule(['entity.name.type.lifetime.rust', 'storage.modifier.lifetime.rust', 'punctuation.definition.lifetime.rust'], {
      foreground: base.coral,
      fontStyle: 'italic',
    }),
    rule(['keyword.other.rust', 'storage.type.rust'], { foreground: base.rose }),
    rule(['entity.name.type.trait.rust', 'entity.name.type.declaration.rust'], { foreground: base.gold }),
    rule(['constant.other.symbol.ruby', 'constant.other.symbol.hashkey.ruby'], { foreground: base.teal }),
    rule(['variable.other.readwrite.instance.ruby', 'variable.other.readwrite.global.ruby'], { foreground: base.coral }),
    rule(['punctuation.definition.variable.php', 'variable.other.php'], { foreground: ui.fg }),
    rule(['entity.name.type.go', 'keyword.type.go'], { foreground: base.gold }),
    rule(['storage.type.string.go', 'keyword.operator.address.go'], { foreground: base.teal }),
    rule(['keyword.other.definition.graphql', 'entity.name.fragment.graphql'], { foreground: base.rose }),
    rule(['variable.graphql', 'variable.parameter.graphql'], { foreground: base.coral }),
    rule(['keyword.other.dockerfile', 'keyword.other.special-method.dockerfile'], { foreground: base.rose }),
    rule(['keyword.other.DML.sql', 'keyword.other.sql', 'keyword.other.create.sql'], { foreground: base.rose }),
    rule(['constant.other.database-name.sql', 'constant.other.table-name.sql'], { foreground: base.gold }),
    rule(['entity.name.function.latex', 'support.function.general.tex'], { foreground: base.azure }),
    rule(['punctuation.definition.entity.html', 'constant.character.entity.html'], { foreground: base.violet }),
    rule(['source.env', 'string.unquoted.dotenv'], { foreground: base.green }),

    /* states ------------------------------------------------------------ */
    rule(['invalid', 'invalid.illegal'], r.invalid),
    rule(['invalid.deprecated'], { foreground: base.gold, fontStyle: 'strikethrough' }),
    rule(['message.error', 'log.error'], { foreground: status.error }),
    rule(['log.warning', 'message.warning'], { foreground: status.warning }),
    rule(['log.info'], { foreground: base.azure }),
    rule(['log.date', 'constant.other.time'], { foreground: ui.comment }),
    rule(['token.debug-token'], { foreground: base.violet }),
  ];

  /* ── semantic tokens ───────────────────────────────────────────────── */
  const semanticTokenColors = {
    namespace: base.gold,
    class: base.gold,
    'class.defaultLibrary': base.gold,
    struct: base.gold,
    enum: base.gold,
    interface: base.gold,
    type: base.gold,
    'type.defaultLibrary': base.gold,
    typeParameter: { foreground: base.gold, fontStyle: 'italic' },
    parameter: { foreground: base.amber, fontStyle: 'italic' },
    variable: ui.fg,
    'variable.readonly': base.amber,
    'variable.readonly.defaultLibrary': base.teal,
    'variable.defaultLibrary': base.teal,
    'variable.declaration': ui.fg,
    property: base.coral,
    'property.readonly': base.coral,
    'property.declaration': base.coral,
    enumMember: base.amber,
    event: base.coral,
    function: base.azure,
    'function.declaration': base.azure,
    'function.defaultLibrary': base.teal,
    method: base.azure,
    'method.declaration': base.azure,
    'method.defaultLibrary': base.teal,
    macro: base.violet,
    decorator: base.violet,
    label: base.coral,
    comment: { foreground: ui.comment, fontStyle: 'italic' },
    string: base.green,
    keyword: base.rose,
    number: base.amber,
    regexp: base.green,
    operator: base.teal,
    selfKeyword: { foreground: base.rose, fontStyle: 'italic' },
    builtinConstant: base.violet,
    magicFunction: base.teal,
    builtinType: base.gold,
    lifetime: { foreground: base.coral, fontStyle: 'italic' },
    formatSpecifier: base.teal,
    generic: base.gold,
    typeAlias: base.gold,
    boolean: base.violet,
    '*.deprecated': { fontStyle: 'strikethrough' },
    '*.abstract': { fontStyle: 'italic' },
    '*.async': { foreground: base.violet },
  };

  return { tokenColors, semanticTokenColors };
};
