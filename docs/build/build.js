// lib
const stylesRunner = require('../../tasks/styles');
const iconsRunner = require('../../tasks/icons');
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
  await stylesRunner(mappedStyles, mappedStylesManifest);
  await iconsRunner(mappedIcons);
  await copyRunner(mappedCopies);

  // build doc data and template
  await docsRunner();
}

build()
  .then(() => {
    console.log('Success!');
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
