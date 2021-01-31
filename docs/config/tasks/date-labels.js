const ora = require('ora');
const puppeteer = require('puppeteer');
const path = require('path');
const { docsImages } = require('../paths');
const { years } = require('./utils');

module.exports = async () => {
  const spinner = ora('Generating date labels').start();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080/date-labels/');
  await page.waitForSelector('.date-labels');
  const elements = await page.$$('.date-label');
  const yearObj = { ...years() };
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < elements.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await elements[i].screenshot({
      path: `${path.join(docsImages, 'date-labels', '/')}${yearObj[i]}.png`,
    });
  }

  await browser.close();

  spinner.succeed();
};
