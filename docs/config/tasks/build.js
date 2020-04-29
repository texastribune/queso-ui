/**
 * Builds and compiles docs
 *
 */

const { styles, icons } = require('@texastribune/queso-tools');
const copy = require('./copy');
const github = require('./github.js');
const styleDocRunner = require('./style-doc');
const iconDocRunner = require('./icon-doc');

const {
  mappedStyles,
  mappedIcons,
  mappedCopies,
  docsStyles,
  docsIcons,
} = require('../paths.js');

async function build() {
  // grab github data
  await github();

  // compile and move files
  await styles(mappedStyles);
  await icons(mappedIcons);
  await copy(mappedCopies);

  // build doc data and template
  await styleDocRunner(docsStyles);
  await iconDocRunner(docsIcons);

}

build().catch(err => {
  // eslint-disable-next-line no-console
  console.log(err);
  process.exit(1);
});
