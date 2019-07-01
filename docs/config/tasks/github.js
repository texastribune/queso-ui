/**
 * Fetches GitHub data from s3 and writes to JSON file
 *
 */

const ora = require('ora');
const axios = require('axios');
const fs = require('fs-extra');

const { mappedGithubData } = require('../paths.js');

const fetch = async () => {
  try {
    const response = await axios.get(mappedGithubData.in);
    const { data } = response;
    return data;
  } catch (error) {
    throw error;
  }
};

module.exports = async () => {
  const spinner = ora();
  spinner.start('Fetching GitHub data from s3');
  // add github data
  const githubJSON = await fetch();
  try {
    await fs.outputFile(
      mappedGithubData.out,
      JSON.stringify(githubJSON, null, 2)
    );
    spinner.succeed('Wrote GitHub data');
  } catch (err) {
    spinner.fail('Did not fetch data');
    throw new Error(err.message);
  }
};
