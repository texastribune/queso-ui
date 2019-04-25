// utility packages
const fs = require('fs-extra');
const ora = require('ora');

const copyFiles = async dirMap => {
  try {
    await fs.copy(dirMap.in, dirMap.out);
    return `${dirMap.in} => ${dirMap.out}`;
  } catch (err) {
    console.error(err);
  }
};

module.exports = async mappedCopies => {
  const spinner = ora('Copying directories').start();

  return await Promise.all(mappedCopies.map(dirMap => copyFiles(dirMap))).then(
    resp => {
      spinner.succeed();
      return resp;
    }
  );
};
