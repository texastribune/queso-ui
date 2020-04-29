/**
 * Builds and compiles docs
 *
 */
const ora = require('ora');
const { styles, icons } = require('@texastribune/queso-tools');

const {
  mappedStyles,
  mappedIcons,
} = require('../paths.js');

module.exports = async () => {
    const spinner = ora('Compiling styles and icons').start();
    await styles(mappedStyles);
    await icons(mappedIcons);
    spinner.succeed();
}