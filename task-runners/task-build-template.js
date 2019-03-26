const fs = require('fs');
const nunjucks = require('nunjucks');
const bs = require('browser-sync').create();
const data = require('../dist/styles.json');

const outputDir = 'dist';
const outputTemplate = `${outputDir}/index.html`;
const assetDir = './assets/scss/';

const { slugify, mkDirByPathSync } = require('./utils');
// Render variables with Handlebars based on JSON
var rendered = nunjucks.render('./templates/index.html', data);

// Render each page
data.items.forEach(item => {
  const inner = nunjucks.render('./templates/page.html', item);
  fs.writeFileSync(`${outputDir}/${slugify(item.name)}.html`, inner);
  // Loop through each item and make page for markup files
  item.list.forEach(childItem => {
    const childData = {
      className: childItem.mainClass,
    };
    if (childItem.isFile) {
      const preview = nunjucks.render(
        `${assetDir}${childItem.markup}`,
        childData
      );
      const previewData = {
        markup: preview,
      };
      const previewTemplate = nunjucks.render(
        './templates/preview.html',
        previewData
      );
      fs.writeFileSync(
        `${outputDir}/${childItem.mainClass}.html`,
        previewTemplate
      );
    }
  });
});

// Write file into outputDir
fs.writeFile(outputTemplate, rendered, err => {
  if (err) throw err;
  console.log(`📝  Write file to ${outputTemplate}`);
  // bs.init({
  //   server: './dist',
  //   port: 8080,
  //   ui: {
  //     port: 8081,
  //   },
  // });
  console.log(`Launching...`);
});
