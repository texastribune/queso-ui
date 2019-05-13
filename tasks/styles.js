// utility packages
const fs = require('fs-extra');
const ora = require('ora');

// css packages
const postCSS = require('postcss');
const sass = require('node-sass');
const autoprefixer = require('autoprefixer');
const CleanCSS = require('clean-css');

// internal
const { isProductionEnv } = require('./env');
const { bustCache } = require('./utils');

// postCSS plugins
// @todo: Add linting when further along in CSS cleanup.
const postCSSInstance = postCSS([autoprefixer({ grid: true })]);

const processSass = async dirMap => {
  // get input and output
  const filePath = dirMap.in;
  const outputPath = dirMap.out;
  const { bustedName, baseName, bustedLocation } = bustCache(outputPath);

  // compile the sass file
  let compiled = {};
  const doShowSourceMaps = !isProductionEnv;
  try {
    compiled = await sass.renderSync({
      file: filePath,
      includePaths: ['node_modules'],
      outFile: bustedLocation,
      sourceComments: doShowSourceMaps,
      sourceMap: doShowSourceMaps,
      sourceMapEmbed: doShowSourceMaps,
    });
  } catch (err) {
    // eslint-disable-next-line no-throw-literal
    throw {
      source: 'sass',
      type: 'error',
      file: filePath,
      message: err.formatted,
    };
  }

  // grab CSS of compiled object
  // eslint-disable-next-line prefer-destructuring
  let css = compiled.css;

  // pass CSS through postcss plugins declared in postCSSInstance
  try {
    const processed = await postCSSInstance.process(css, {
      from: filePath,
    });
    css = processed.toString();
  } catch (err) {
    throw err;
  }

  // on prod (build), run our CSS through a cleaner
  if (isProductionEnv) {
    const cssCleaner = new CleanCSS({
      returnPromise: true,
      level: 2,
    });
    const { styles: minified } = await cssCleaner.minify(css);
    css = minified;
  }

  // write out compiled css or html to specified output directory
  try {
    await fs.outputFile(bustedLocation, css);
  } catch (err) {
    console.error(err);
  }
  let obj = {};
  obj[baseName] = bustedName;
  return obj;
};

const processManifest = async (bustedMap, mappedStylesManifest) => {
  let bustedMapObj = {};
  bustedMap.forEach(
    file => (bustedMapObj[Object.keys(file)] = file[Object.keys(file)])
  );
  try {
    await fs.outputFile(
      mappedStylesManifest,
      JSON.stringify(bustedMapObj, null, 2)
    );
  } catch (err) {
    throw err;
  }
  return;
};

module.exports = async (mappedStylesArr, mappedStylesManifest) => {
  const spinner = ora('Compiling SCSS').start();
  // loop through each file found and process our sass
  const bustedMap = await Promise.all(
    mappedStylesArr.map(dirMap => processSass(dirMap))
  );
  // write a manifest
  await processManifest(bustedMap, mappedStylesManifest);

  spinner.succeed();
};
