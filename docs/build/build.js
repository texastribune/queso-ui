const { styles, icons } = require('@texastribune/queso-tools');
const copyRunner = require('../../tasks/copy');

// custom to this build
const docsRunner = require('./docs.js');
const githubRunner = require('./github.js');

const {
  mappedStyles,
  mappedIcons,
  mappedCopies,
  mappedStylesManifest,
} = require('./paths.js');

async function build() {
  // grab github data
  await githubRunner();

  // compile and move files
  await styles(mappedStyles, mappedStylesManifest);
  await icons(mappedIcons);
  await copyRunner(mappedCopies);

  // build doc data and template
  await docsRunner();
}

build().catch(err => {
  console.log(err);
  process.exit(1);
});
