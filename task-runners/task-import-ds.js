const fs = require('fs');
const fetch = require('node-fetch');

const brandURL =
  'https://projects.invisionapp.com/dsm-export/ashley-test/ds-test/_style-params.scss?key=S1K_10dmV ';

const outputDir = 'assets';

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
