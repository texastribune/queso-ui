/**
 * Builds and compiles docs
 *
 */
const { styles, icons } = require('@texastribune/queso-tools');
const copy = require('./copy');
const github = require('./github');

const {
  mappedStyles,
  mappedIcons,
  mappedCopies,
} = require('../paths.js');

async function build() {
  // grab github data
  await github();

  // compile and move files
  await styles(mappedStyles);
  await icons(mappedIcons);
  await copy(mappedCopies);

}

build().catch(err => {
  // eslint-disable-next-line no-console
  console.log(err);
  process.exit(1);
});
