const buildDir = './docs/dist/';

const mappedStyles = [
  {
    in: './docs/src/scss/ds.scss',
    out: `${buildDir}css/ds.css`,
  },
  {
    in: './assets/scss/all.scss',
    out: `${buildDir}css/all.css`,
  },
  {
    in: './assets/scss/all-legacy.scss',
    out: `${buildDir}css/all-legacy.css`,
  },
  {
    in: './assets/scss/no-resets.scss',
    out: `${buildDir}css/no-resets.css`,
  },
];

// cache busting map
const mappedStylesManifest = `${buildDir}css/styles.json`;

const docsStyles = './assets/scss/';

const mappedIcons = [
  {
    in: './assets/icons/amp/',
    out: `${buildDir}sprites/amp.html`,
  },
  {
    in: './assets/icons/base/',
    out: `${buildDir}sprites/base.html`,
  },
];

const docsIcons = ['./assets/icons/'];

const mappedCopies = [
  {
    in: './docs/src/img',
    out: `${buildDir}img`,
  },
  {
    in: './docs/src/js',
    out: `${buildDir}js`,
  },
];

module.exports = {
  mappedStyles,
  mappedStylesManifest,
  docsStyles,
  mappedIcons,
  docsIcons,
  mappedCopies,
  buildDir,
};
