// Compile .scss files in */styles folders
const glob = require('fast-glob');
const fs = require('fs');

// Compile
const compile = file => {
  let arr = file.split('/');
  let fileName = arr[arr.length - 1];

  const js = fs.readFileSync(file);

  // For now, just move to dist
  const outputPath = `./dist/${fileName}`;

  fs.writeFile(outputPath, js, err => {
    if (err) throw err;
    console.log(`🎨 ${fileName} - updated!`);
  });
};

// Glob
let jsFiles = ['./docs/ds.js'];

// Glob options
let options = {
  cwd: __dirname + '/..',
  ignore: ['node_modules'],
};

// Main task.
const main = async () => {
  const js = await glob(jsFiles);
  return Promise.all(js.map((file, index) => compile(file)));
};

main();
