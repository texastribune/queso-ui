/**
 * Copies a file from one dir to specified dir
 *
 * @param {Arr} mappedCopies - in/out directory
 * @returns {Arr} - array completed copies made
 */

// utility packages
const fs = require('fs-extra');
const ora = require('ora');

const copyFiles = async dirMap => {
  await fs.copy(dirMap.in, dirMap.out);
  return `${dirMap.in} => ${dirMap.out}`;
};

module.exports = async mappedCopies => {
  const spinner = ora('Copying directories').start();

  return Promise.all(mappedCopies.map(dirMap => copyFiles(dirMap)))
    .then(resp => {
      spinner.succeed();
      return resp;
    })
    .catch(err => {
      throw new Error(err.message);
    });
};
