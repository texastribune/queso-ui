const fs = require('fs-extra');
const nunjucks = require('nunjucks');
const {
  docsStyles,
  siteURL,
  mappedGithubData,
} = require('../../config/paths.js');

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
const stripSelector = (str) => {
  return str[0] === '.' ? str.substring(1) : str;
};

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
    typeof usageInfo.classData[className] !== 'undefined'
      ? usageInfo.classData[className].searchDataArr
      : [];
  return {
    className,
    data,
  };
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const stripTags = (str) => {
  return str.replace(/(<([^>]+)>)/gi, '');
};

const getKeywords = obj => {
  const {name, description, modifiers} = obj;
  const className = generateClassName(name);
  const keywordsStr = /Keywords: (.*)/;
  const keywordsMatch = keywordsStr.exec(description);
  let keywords = [`${name.toLowerCase()}`, className];
  const modifierNames = modifiers.map((modifier) => stripSelector(modifier.data.name));
  console.log(modifierNames);
  if (modifiers.length > 0) {
    keywords = [...keywords, ...modifierNames];
  }
  if (keywordsMatch && typeof keywordsMatch[1] !== 'undefined') {
    const extraKeywords = keywordsMatch[1].replace('</p>', '').split(', ');
    const labeledKeywords = extraKeywords.map((word) => {
      return `${word} (${name.toLowerCase()})`;
    });
    keywords = [...labeledKeywords, ...keywords];
  }
  return keywords;
}
const getDetails = (description, name) => {
  const isHelperStr = '{{isHelper}}';
  const isHelper = description.includes(isHelperStr);
  const isRecipeStr = '{{isRecipe}}';
  const isRecipe = description.includes(isRecipeStr);
  const isTool = name.includes('@');
  const keywordsStr = /Keywords: (.*)/;
  const keywordsMatch = keywordsStr.exec(description);
  const keywords = [];
  if (keywordsMatch && typeof keywordsMatch[1] !== 'undefined') {
    const extraKeywords = keywordsMatch[1].replace('</p>', '').split(', ');
    keywords = extraKeywords.map((word) => {
      return `${word} (${name.toLowerCase()})`;
    });
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
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};

const buildTokenArr = (arr) => {
  return arr
    .map((arrMap) => arrMap.list.map((token) => token.name))
    .reduce((acc, val) => acc.concat(val), []);
}

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
};
