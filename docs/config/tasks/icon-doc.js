/**
 * Create object of svg icons in a directory
 *
 * @param {Arr} dir - in/out directory
 * @returns {Object} - array of processed icons
 */

// utility packages
const fs = require('fs-extra');
const glob = require('fast-glob');
const ora = require('ora');
const path = require('path');

const createIconMap = async dirMap => {
  // find all .svg files in specified icon directory
  const svgs = await glob(`${dirMap}*/**.svg`);

  const output = [];
  svgs.forEach(svg => {
    // filename
    const iconName = path.basename(svg, path.extname(svg));
    // parent dir
    const name = path.basename(path.dirname(svg));

    // push to output
    const existing = output.filter(i => {
      return i.name === name;
    });

    if (existing.length > 0) {
      const existingIndex = output.indexOf(existing[0]);
      output[existingIndex].icons = output[existingIndex].icons.concat(
        iconName
      );
    } else {
      output.push({
        name,
        icons: [iconName],
      });
    }
  });
  return output;
};

module.exports = async dir => {
  const spinner = ora('Creating icon map').start();
  const docs = await createIconMap(dir);
  await fs.outputFile(
    './docs/dist/data/icons.json',
    JSON.stringify(docs, null, 2)
  );
  spinner.succeed();
  return docs;
};
