const fs = require('fs');
const nunjucks = require('nunjucks');
const bs = require('browser-sync').create();
const data = require('../dist/styles.json');

const outputDir = 'dist';
const outputTemplate = `${outputDir}/index.html`;

// Render variables with Handlebars based on JSON
var rendered = nunjucks.render('./templates/template.html', data);
// Write file into outputDir
fs.writeFile(outputTemplate, rendered, err => {
  if (err) throw err;
  console.log(`📝  Write file to ${outputTemplate}`);
  bs.init({
    server: './dist',
    port: 8080,
    ui: {
      port: 8081,
    },
  });
  console.log(`Launching...`);
});
