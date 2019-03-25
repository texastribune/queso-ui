// Compile .scss files in */styles folders
const glob = require('fast-glob');
const fs = require('fs');

// Compile
const compile = file => {
  let arr = file.split('/');
  let fileName = arr[arr.length - 1];

  const img = fs.readFileSync(file);

  // For now, just move to dist
  const outputPath = `./dist/${fileName}`;

  fs.writeFile(outputPath, img, err => {
    if (err) throw err;
    console.log(`🎨 ${fileName} - updated!`);
  });
};

// Glob
let imageFiles = ['./docs/img/*.png', './docs/img/*.jpg'];

// Main task.
const main = async () => {
  const imgs = await glob(imageFiles);
  return Promise.all(imgs.map((file, index) => compile(file)));
};

main();
