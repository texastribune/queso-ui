// utility
const fs = require('fs-extra');

// lib
const stylesRunner = require('../../tasks/styles');
const iconsRunner = require('../../tasks/icons');
const copyRunner = require('../../tasks/copy');

// custom to this build
const docsRunner = require('./docs.js');

const { mappedStyles, mappedIcons, mappedCopies } = require('./paths.js');

async function build() {
  // compile and move files
  await stylesRunner(mappedStyles);
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
