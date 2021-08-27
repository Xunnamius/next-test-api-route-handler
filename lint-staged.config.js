'use strict';

module.exports = {
  '*.md': 'remark -o --use reference-links --use gfm --use frontmatter',
  'package.json': 'sort-package-json',
  '*': 'prettier --write --ignore-unknown'
};
