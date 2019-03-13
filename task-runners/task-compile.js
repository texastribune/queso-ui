// Compile .scss files in */styles folders
var glob = require('fast-glob');
var chokidar = require('chokidar');
var fs = require('fs');
var CleanCSS = require('clean-css');
var stylelint = require('stylelint');
var path = require('path');

var sass = require('node-sass');

// Compile
const compile = file => {
  // File name EX: assets/base.scss
  let arr = file.split('/');
  let fileName = arr[arr.length - 1];
  let fileNameCSS = fileName.replace('.scss', '.css');
  let fileNameMin = fileName.replace('.scss', '.min.css');
  const outputPath = `./dist/${fileNameCSS}`;
  const outputPathMin = `./dist/${fileNameMin}`;
  // 1. Compile SCSS
  sass.render(
    {
      file: file,
      includePaths: ['node_modules'],
      outFile: outputPath,
      sourceComments: true,
      sourceMap: true,
      sourceMapEmbed: true,
    },
    function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      let css = result.css.toString();
      // 2. Build CSS
      fs.writeFile(outputPath, css, err => {
        if (err) throw err;
        console.log(`🎨 ${fileNameCSS} - updated!`);
      });
      // 3. Build Minified CSS
      let output = new CleanCSS().minify(css);
      fs.writeFile(outputPathMin, output.styles, err => {
        if (err) throw err;
        console.log(`🎨 ${fileNameMin} - updated!`);
      });
    }
  );
};

// Lint
const lint = () => {
  stylelint
    .lint({
      files: cssFiles,
      formatter: function(stylelintResults) {
        // Build arr of warnings
        let warnings = [];
        stylelintResults.forEach(result => {
          if (result.errored) {
            let status = {
              file: result.source,
              warnings: result.warnings,
            };
            const relativePath = path.relative(process.cwd(), result.source);
            console.log(
              '\x1b[36m%s\x1b[0m',
              `${result.warnings.length} errors in ${relativePath}`
            );
            result.warnings.forEach(warning => {
              console.log(`${warning.text} in ${relativePath}:${warning.line}`);
            });
            warnings.push(result);
          }
        });
      },
      syntax: 'scss',
    })
    .then(function() {
      console.log('Linting check complete');
    });
};

// Glob
let cssFiles = ['./assets/**/[^_]*.scss', './docs/**/*.scss'];

// Main task.
// const main = () => {
//   glob(cssFiles, options, function(er, files) {
//     files.forEach(file => {
//       compile(file);
//     });
//   });
//   lint();
// };

const main = async () => {
  const css = await glob(cssFiles);
  Promise.all(css.map((file, index) => compile(file))).then(resp => lint());
};

main();
