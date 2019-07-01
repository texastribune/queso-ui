/**
 * Builds and compiles docs
 *
 */

const { styles, icons } = require('@texastribune/queso-tools');
const copy = require('./copy');
const docs = require('./docs.js');
const github = require('./github.js');

const {
  mappedStyles,
  mappedIcons,
  mappedCopies,
  mappedStylesManifest,
} = require('../paths.js');

async function build() {
  // grab github data
  await github();

  // compile and move files
  await styles(mappedStyles, mappedStylesManifest);
  await icons(mappedIcons);
  await copy(mappedCopies);

  // build doc data and template
  await docs();
}

build().catch(err => {
  // eslint-disable-next-line no-console
  console.log(err);
  process.exit(1);
});
