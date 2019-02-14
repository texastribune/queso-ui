// Compile .scss files in */styles folders
var glob = require('glob');
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
  // 1. Compile SCSS
  sass.render(
    {
      file: file,
    },
    function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      let css = result.css.toString();
      // 2. Build CSS
      fs.writeFile(`./dist/${fileNameCSS}`, css, err => {
        if (err) throw err;
        console.log(`🎨 ${fileNameCSS} - updated!`);
      });
      // 3. Build Minified CSS
      let output = new CleanCSS().minify(css);
      fs.writeFile(`./dist/${fileNameMin}`, output.styles, err => {
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
let cssFiles = './assets/**/*.scss';

// Glob options
let options = {
  cwd: __dirname + '/..',
  ignore: ['./assets/**/_*/**'],
};

// Main task.
const main = () => {
  glob(cssFiles, options, function(er, files) {
    files.forEach(file => {
      compile(file);
    });
  });
  lint();
};

main();
