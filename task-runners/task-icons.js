const dirTree = require('directory-tree');
const fs = require('fs');
const SVGSpriter = require('svg-sprite');
const pathTool = require('path');
const mkdirp = require('mkdirp');

// Folders to parse
const groups = ['base', 'amp'];

// Loop through each icon in each folder and build SVG sprite
(buildIcons => {
  const setArr = [];
  groups.forEach(group => {
    const iconTree = dirTree(`./assets/icons/${group}`, {
      extensions: /\.svg/,
    });
    const allArr = iconTree.children;
    const iconArr = [];
    // Create spriter instance (see https://github.com/jkphl/svg-sprite#general-configuration-options for `config` examples)
    const spriter = new SVGSpriter({
      dest: './dist',
      mode: {
        symbol: {
          mode: 'symbol',
          sprite: `${group}-sprite`,
          inline: true,
          dest: '',
          example: false,
        },
      },
      svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false,
      },
    });
    if (Array.isArray(allArr)) {
      allArr.forEach(element => {
        // Add clean name to icon array
        iconArr.push(element.name.replace(/(\/|\.|svg)/g, ''));
        // Add spriter icon
        let svgPath = `./${element.path}`;
        spriter.add(
          pathTool.resolve(svgPath),
          element.name,
          fs.readFileSync(svgPath, { encoding: 'utf-8' })
        );
      });
    }
    // Push array of icons to set array
    setArr.push({
      name: group,
      icons: iconArr,
    });
    // Compile the sprite
    spriter.compile(function(error, result) {
      /* Write `result` files to disk */
      for (var mode in result) {
        for (var resource in result[mode]) {
          mkdirp.sync(pathTool.dirname(result[mode][resource].path));
          // Add display: none prop for accessibility and perf
          // @link: https://www.24a11y.com/2018/accessible-svg-icons-with-inline-sprites/
          let fileContents = result[mode][resource].contents.toString('utf8');
          fileContents = fileContents.replace(
            /position:absolute/,
            'display:none;'
          );
          fs.writeFileSync(result[mode][resource].path, fileContents);
        }
      }
    });
    // Create JSON data of icons
    fs.writeFileSync(`./dist/icons.json`, JSON.stringify(setArr));
    console.log(`✓ Create icon sprite in ./dist/${group}-sprite.svg`);
  });
})();
