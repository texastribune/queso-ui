const buildDir = './docs/dist/';

const mappedStyles = [
  {
    in: './docs/src/scss/queso-docs.scss',
    out: `${buildDir}css/queso-docs.css`,
  },
  {
    in: './assets/scss/all.scss',
    out: `${buildDir}css/all.css`,
  },
];

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
  {
    in: './docs/src/icons/',
    out: `${buildDir}sprites/docs.html`,
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

const mappedGithubData = {
  in:
    'https://s3.amazonaws.com/cdn.texastribune.org/design-system/class-usage.json',
  out: './docs/dist/data/github.json',
};


const siteURL =
  process.env.SITE_ENV === 'production'
    ? 'https://texastribune.github.io/queso-ui'
    : 'http://localhost:3000';

module.exports = {
  mappedStyles,
  mappedGithubData,
  docsStyles,
  mappedIcons,
  docsIcons,
  mappedCopies,
  buildDir,
  siteURL,
};
