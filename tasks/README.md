# @texastribune/ds-toolbox-tasks
> Node task runners for compiling CSS, creating SVGs, and more.

## Install

```sh
yarn add @texastribune/ds-toolbox-tasks
```
```sh
npm install @texastribune/ds-toolbox-tasks
```

## Using these tasks in the wild

Most of the tasks expect an input and output presented as an array of objects.

To set this up, create a file called `paths.js` and declare your map of paths.

Example from our /donations repo

```js
// paths.js
const path = require('path');
const glob = require('fast-glob');
const { replaceExtension } = require('@texastribune/ds-toolbox-tasks/utils');

const SCSS_DIR = './scss';
const CSS_OUTPUT_DIR = './css/';
const SVG_LIB_DIR = './node_modules/@texastribune/ds-toolbox-assets/icons/base';
const SVG_OUTPUT_DIR = './templates/includes';

const mappedStyles = [
  {
    in: [
      `${SCSS_DIR}/styles.scss`,
      `${SCSS_DIR}/styles2.scss`,
    ],
    out: CSS_OUTPUT_DIR,
  },
];

// tip: you can use some icons from @texastribune/ds-toolbox-assets and some stored locally
const mappedIcons = [
  {
    in: [
      `${SVG_LIB_DIR}/twitter.svg`,
      `${SVG_LIB_DIR}/facebook.svg`,
      './icons/custom-icon.svg',
      './icons/other-icon.svg'
    ],
    out: `${SVG_OUTPUT_DIR}/my-svg-sprite.html`,
  },
];

const mappedStylesManifest = `${CSS_OUTPUT_DIR}styles.json`;


module.exports = {
  mappedStyles,
  mappedIcons,
  mappedStylesManifest
};

```

Now create a `build.js` file in that same folder where you'll reference these paths and begin to call the various tasks in this package.

That could look something like the following:

```js
// build.js
const stylesRunner = require('@texastribune/ds-toolbox-tasks/styles');
const iconsRunner = require('@texastribune/ds-toolbox-tasks/icons');
const { logMessage } = require('@texastribune/ds-toolbox-tasks/utils');
const { mappedStyles, mappedIcons, mappedStylesManifest } = require('../paths.js');

async function build() {
  // compile scss
  await stylesRunner(mappedStyles, mappedStylesManifest);
  // OR (use await if you had to glob to get your map)
  // const mappedStylesArr = await mappedStyles();
  // await stylesRunner(mappedStylesArr, mappedStylesManifest);

  // compile icons
  await iconsRunner(mappedIcons);
}

build()
  .then(() => {
    logMessage('Success!', 'green');
  })
  .catch(err => {
    logMessage('Something went wrong in the build...', 'red');
    logMessage(err);
    process.exit(1);
  });

```


Now run `node build.js` in your local environment to invoke the build.