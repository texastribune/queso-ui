const fs = require('fs');
const nunjucks = require('nunjucks');
const bs = require('browser-sync').create();
const data = require('../dist/styles.json');

const outputDir = 'dist';
const outputTemplate = `${outputDir}/index.html`;

const slugify = text => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Render variables with Handlebars based on JSON
var rendered = nunjucks.render('./templates/index.html', data);

// Render each page
data.items.forEach(item => {
  const inner = nunjucks.render('./templates/page.html', item);
  fs.writeFile(`${outputDir}/${slugify(item.name)}.html`, inner, err => {});
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
