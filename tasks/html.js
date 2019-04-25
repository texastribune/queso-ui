// utility packages
const fs = require('fs-extra');
const ora = require('ora');

// html packages
const nunjucks = require('nunjucks');

const processHTML = async dirMap => {
  try {
    const env = nunjucks.configure('./');
    const rendered = env.render(dirMap.in, dirMap.data);
    await fs.outputFile(dirMap.out, rendered);
  } catch (err) {
    console.error(err);
  }
};

module.exports = async mappedHTML => {
  const spinner = ora('Building HTML templates').start();
  // loop through each file found and process our sass
  return await Promise.all(mappedHTML.map(dirMap => processHTML(dirMap))).then(
    resp => {
      spinner.succeed();
      return resp;
    }
  );
};
