const axios = require('axios');
const fs = require('fs-extra');
const nunjucks = require('nunjucks');
const path = require('path');
const {
  docsStyles,
  siteURL,
  mappedGithubData,
  buildDir,
} = require('../paths.js');

const generateClassName = (str) => {
  let className = str;
  const parens = /\(([^)]+)\)/;
  const parensMatch = parens.exec(str);
  if (parensMatch && typeof parensMatch[1] !== 'undefined') {
    [, className] = parensMatch;
  }
  return className;
};

const generateName = (str) => {
  let extractedName = str;
  const parens = /\(([^)]+)\)/;
  const parensMatch = parens.exec(str);
  if (parensMatch && typeof parensMatch[1] !== 'undefined') {
    extractedName = extractedName.replace(parens, '').trim();
  }
  return extractedName;
};

const generateTemplate = async (str) => {
  const isFile = str.includes('.html');
  let template = str;
  if (isFile) {
    const codePath = `${docsStyles}${str}`;
    template = fs.readFileSync(codePath, 'utf-8');
  }
  return template;
};

const renderTemplate = async (template, data) => {
  const env = nunjucks.configure('./assets/scss');
  let rendered = '';
  try {
    rendered = env.renderString(template, { ...data, siteURL });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  return rendered;
};

// If string is .classname, make it just classname
const stripSelector = (str) => (str[0] === '.' ? str.substring(1) : str);

const readUsageInfo = async () => {
  let github = {};
  try {
    github = await fs.readJson(mappedGithubData.out);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return github;
};

const findUsageInfo = (usageInfo, className) => {
  const data =
    typeof usageInfo.results[className] !== 'undefined'
      ? usageInfo.results[className]
      : [];
  return {
    className,
    data,
  };
};

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

const stripTags = (str) => str.replace(/(<([^>]+)>)/gi, '');

const getKeywords = (obj) => {
  const { name, description, modifiers } = obj;
  const className = generateClassName(name);
  const keywordsStr = /Keywords: (.*)/;
  const keywordsMatch = keywordsStr.exec(description);
  let keywords = [`${name.toLowerCase()}`, className];
  const modifierNames = modifiers.map((modifier) =>
    stripSelector(modifier.data.name)
  );
  if (modifiers.length > 0) {
    keywords = [...keywords, ...modifierNames];
  }
  if (keywordsMatch && typeof keywordsMatch[1] !== 'undefined') {
    const extraKeywords = keywordsMatch[1].replace('</p>', '').split(', ');
    const labeledKeywords = extraKeywords.map(
      (word) => `${word} (${name.toLowerCase()})`
    );
    keywords = [...labeledKeywords, ...keywords];
  }
  return keywords;
};
const getDetails = (description, name) => {
  const isHelperStr = '{{isHelper}}';
  const isHelper = description.includes(isHelperStr);
  const isRecipeStr = '{{isRecipe}}';
  const isRecipe = description.includes(isRecipeStr);
  const isTool = name.includes('@');
  const keywordsStr = /Keywords: (.*)/;
  const keywordsMatch = keywordsStr.exec(description);
  let keywords = [];
  if (keywordsMatch && typeof keywordsMatch[1] !== 'undefined') {
    const extraKeywords = keywordsMatch[1].replace('</p>', '').split(', ');
    keywords = extraKeywords.map((word) => `${word} (${name.toLowerCase()})`);
  }

  const filteredDesc = description
    .replace(isHelperStr, '')
    .replace(isRecipeStr, '')
    .replace(keywordsStr, '');
  return {
    details: {
      isHelper,
      isRecipe,
      isTool,
      keywords,
    },
    description: filteredDesc,
  };
};

const convertArrayToObject = (array, key) => {
  const initialValue = {};
  return array.reduce(
    (obj, item) => ({
      ...obj,
      [item[key]]: item,
    }),
    initialValue
  );
};

const buildTokenArr = (arr) =>
  arr
    .map((arrMap) => arrMap.list.map((token) => ({ ...token })))
    .reduce((acc, val) => acc.concat(val), []);

const downloadAsset = async (url, name) => {
  const filepath = path.resolve(buildDir, name);
  const writer = fs.createWriteStream(filepath);

  const response = await axios({
    url,
    method: 'GET',
    responseEncoding: 'binary',
    responseType: 'stream',
  });

  await new Promise((resolve, reject) => {
    response.data.pipe(writer);
    let error = null;
    writer.on('error', (err) => {
      error = err;
      writer.close();
      reject(err);
    });
    writer.on('close', () => {
      if (!error) {
        resolve(true);
      }
    });
  });
  return filepath;
};

const years = () => {
  const now = new Date().getUTCFullYear();
  const in20years = now + 20; 
  return Array(in20years - 1998)
    .fill('')
    .map((v, idx) => in20years - idx);
};

module.exports = {
  findUsageInfo,
  generateClassName,
  generateName,
  generateTemplate,
  readUsageInfo,
  renderTemplate,
  slugify,
  stripSelector,
  stripTags,
  getDetails,
  convertArrayToObject,
  buildTokenArr,
  getKeywords,
  downloadAsset,
  years
};
