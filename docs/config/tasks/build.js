/**
 * Builds and compiles docs
 *
 */

const { styles, icons } = require('@texastribune/queso-tools');
const copy = require('./copy');
const docs = require('./docs.js');
const github = require('./github.js');
const styleDocRunner = require('./style-doc');
const iconDocRunner = require('./icon-doc');
const fs = require('fs-extra');

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
  // await docs();
  const styleDocs = await styleDocRunner(docsStyles);
  const iconDocs = await iconDocRunner(docsIcons);
  await fs.outputFile(
    './docs/dist/data/styles.json',
    JSON.stringify(styleDocs, null, 2)
  );
  await fs.outputFile(
    './docs/dist/data/icons.json',
    JSON.stringify(iconDocs, null, 2)
  );
}

build().catch(err => {
  // eslint-disable-next-line no-console
  console.log(err);
  process.exit(1);
});
