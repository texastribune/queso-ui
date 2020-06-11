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
}

const renderTemplate = async (template, data) => {
  const env = nunjucks.configure('./assets/scss');
  let rendered = '';
  try {
    rendered = env.renderString(template, { ...data, siteURL });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  return rendered
}

// If string is .classname, make it just classname
const stripSelector = (str) => {
  return str[0] === '.' ? str.substring(1) : str
}


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
  return typeof usageInfo.classData[stripSelector(className)] !==
    'undefined'
    ? usageInfo.classData[stripSelector(className)].searchDataArr
    : [];
}

const slugify = text => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const stripTags = str => {
  return str.replace(/(<([^>]+)>)/gi, '');
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
};
