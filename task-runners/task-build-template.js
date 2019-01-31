const fs = require('fs');
const Mustache = require('mustache');
import data from '../dist/styles.json';

const outputDir = 'dist';
const outputTemplate = `${outputDir}/index.html`;

// Read HTML
const template = fs.readFileSync('./templates/template.html', 'utf-8');
// Render variables with Handlebars based on JSON
const rendered = Mustache.render(template, data);
// Write file into outputDir
fs.writeFile(outputTemplate, rendered, err => {
  if (err) throw err;
  console.log(`📝  Write file to ${outputTemplate}`);
});
