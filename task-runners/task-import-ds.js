const fs = require('fs');
const fetch = require('node-fetch');
const dotenv = require('dotenv').config();
const brandURL = process.env.DS_SCSS;
const outputDir = 'assets/scss';

const stripCssComments = str => {
  // Remove multi-line CSS comments
  str = str.replace(/(\/\*[\s\S]*?\*\/)/gm, '');
  // Remove empty line breaks and add one back
  str = str.replace(/^\s*\n/gm, '\n');
  // Remove top empty line too
  str = str.replace(/^\s*\n/, '');
  return str;
};

(importBrand => {
  if (typeof brandURL === 'undefined') {
    return;
  }
  const commentsLine1 = `// These tokens are imported from ${brandURL}\n\n`;
  const commentsLine2 = `// Chat with art team before modification\n\n`;
  const styleOutputDir = `${outputDir}/1-settings`;
  const fileName = `_design-tokens.scss`;
  fetch(brandURL)
    .then(resp => resp.text())
    .then(text => {
      let cleanText = stripCssComments(text);
      if (cleanText.length < 2) {
        cleanText = `// This brand.ai guide is empty => [${brandURL}]`;
      } else {
        cleanText = `${commentsLine1}${commentsLine2}${cleanText}`;
      }
      fs.writeFileSync(`./${styleOutputDir}/${fileName}`, cleanText, 'utf8');
    });
  console.log(`🎨 Create styling variables in ${styleOutputDir}/${fileName}`);
})();
