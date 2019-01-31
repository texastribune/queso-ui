const fs = require('fs');
const fetch = require('node-fetch');
const moment = require('moment');
const kss = require('kss'),
  options = {
    markdown: true,
  };
const brandJSON =
  'https://projects.invisionapp.com/dsm-export/ashley-test/ds-test/style-data.json?exportFormat=list&key=S1K_10dmV';

const outputDir = 'dist';
const outputFilename = `${outputDir}/styles.json`;

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
let styles = {
  name: 'Design Preview',
  lastUpdated: moment().format('MMM DD, YYYY | LTS'),
};
kss.traverse('./assets/', options).then(function(styleGuide) {
  // First fetch Invision design tokens
  let styleGuideString = JSON.stringify(styleGuide);
  let styleGuideData = JSON.parse(styleGuideString);
  let sectionsArr = styleGuideData.sections;
  console.log('Fetching Invision design tokens');
  fetch(brandJSON)
    .then(resp => resp.json())
    .then(json => {
      console.log('Fetched tokens');
      const data = json.list;
      const colors = data.colors;
      colors.forEach(colorSet => {
        // Make an array of color items
        let swatchSet = [];
        let colorSetArr = colorSet.colors;
        colorSetArr.forEach(swatch => {
          let swatchObj = {
            color: swatch.value,
            name: `$color-${slugify(swatch.name)}`,
            description: swatch.name,
            referenceNumber: 1,
          };
          swatchSet.push(swatchObj);
        });
        let colorSetObj = { header: colorSet.name, colors: swatchSet };
        console.log(`Added ${colorSet.name} to design data`);
        sectionsArr.push(colorSetObj);
      });
      styles.styleData = sectionsArr;
      fs.writeFileSync(outputFilename, JSON.stringify(styles, null, 4));
      console.log(`🌲 Build tree of design data in ${outputFilename}`);
    });
});
