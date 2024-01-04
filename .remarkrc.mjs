/**
 * @typedef {{settings?: import('mdast-util-to-markdown').Options, plugins?:
 * import('unified-engine/lib/configuration').PluggableList |
 * import('unified-engine/lib/configuration').PluginIdList}} Config
 */

/**
 * Remark configuration loaded when `NODE_ENV === 'lint'`. The goal here is to
 * check for things that will not be corrected by prettier or remark during a
 * formatting pass (see below).
 *
 * @type {Config}
 */
const lintConfig = {
  plugins: [
    'ignore',
    'frontmatter',
    'gfm',
    'lint',
    'lint-definition-case',
    'lint-fenced-code-flag',
    'lint-fenced-code-flag-case',
    'lint-file-extension',
    'lint-first-heading-level',
    'lint-heading-increment',
    'lint-heading-whitespace',
    [
      'lint-list-item-style',
      // ? Add ":" as allowed punctuation
      { checkPunctuation: ['(\\.|\\?|;|:|,|!|\\p{Emoji}\uFE0F|\\p{Emoji_Presentation})'] }
    ],
    'lint-no-duplicate-defined-urls',
    'lint-no-duplicate-headings-in-section',
    'lint-no-empty-sections',
    'lint-no-empty-url',
    'lint-heading-word-length',
    'lint-no-heading-like-paragraph',
    'lint-no-heading-punctuation',
    'lint-no-inline-padding',
    'lint-no-literal-urls',
    'lint-no-multiple-toplevel-headings',
    'lint-no-reference-like-url',
    'lint-no-shell-dollars',
    'lint-no-shortcut-reference-image',
    'lint-no-shortcut-reference-link',
    'lint-no-tabs',
    'lint-no-undefined-references',
    'lint-ordered-list-marker-value',
    ['lint-strikethrough-marker', '~~'],
    // ? Prettier will reformat list markers UNLESS they precede checkboxes
    ['lint-unordered-list-marker-style', '-'],
    'validate-links'
  ]
};

/**
 * Remark configuration loaded when `NODE_ENV === 'format'`. The goal here is to
 * correct things that will not be taken care of by prettier.
 *
 * @type {Config}
 */
const formatConfig = {
  plugins: [
    'ignore',
    'frontmatter',
    'gfm',
    'tight-comments',
    ['capitalize-headings', { excludeHeadingLevel: { h1: true } }],
    'remove-unused-definitions',
    'remove-url-trailing-slash',
    'renumber-references',
    'sort-definitions'
  ]
};

if (!['lint', 'format'].includes(process.env.NODE_ENV)) {
  throw new Error('remark expects NODE_ENV to be one of either: lint, format');
}

/**
 * @type {Config}
 */
export default {
  settings: {
    bullet: '-',
    emphasis: '_',
    fences: true,
    listItemIndent: 'one',
    rule: '-',
    strong: '*',
    tightDefinitions: true,
    ...(process.env.NODE_ENV === 'lint' ? lintConfig.settings : formatConfig.settings)
  },
  plugins: [
    ...(process.env.NODE_ENV === 'lint' ? lintConfig.plugins : formatConfig.plugins)
  ]
};
