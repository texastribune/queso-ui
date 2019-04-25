const mappedStyles = [
  {
    in: './docs/src/scss/ds.scss',
    out: './docs/dist/css/ds.css',
  },
  {
    in: './assets/scss/base-v2.scss',
    out: './docs/dist/css/base-v2.css',
  },
  {
    in: './assets/scss/base.scss',
    out: './docs/dist/css/base.css',
  },
];

const docsStyles = './assets/scss/';

const mappedIcons = [
  {
    in: './assets/icons/amp/',
    out: './docs/dist/sprites/amp.html',
  },
  {
    in: './assets/icons/base/',
    out: './docs/dist/sprites/base.html',
  },
];

const docsIcons = ['./assets/icons/'];

const mappedCopies = [
  {
    in: './docs/src/img',
    out: './docs/dist/img',
  },
  {
    in: './docs/src/js',
    out: './docs/dist/js',
  },
];

module.exports = {
  mappedStyles,
  docsStyles,
  mappedIcons,
  docsIcons,
  mappedCopies,
};