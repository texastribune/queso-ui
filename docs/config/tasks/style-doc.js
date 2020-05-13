/**
 * Create object of SCSS documentation
 *
 * @param {Arr} dir - in/out directory
 * @returns {Object} - array of processed style docs
 */

// utility packages
const fs = require('fs-extra');
const ora = require('ora');
const kss = require('kss');
const md = require('markdown-it')({ html: true });
const nunjucks = require('nunjucks');
const {
  passesWcagAaLargeText,
  passesWcagAa,
  passesWcagAaa,
} = require('passes-wcag');

// internal
const { slugify, stripTags } = require('./utils');
const { mappedGithubData } = require('../paths.js');

const GITHUB_URL = 'https://github.com/texastribune/queso-ui/blob/master';

const createMap = arr => {
  const object = {};

  arr.forEach(item => {
    if (item.depth === 1) {
      const name = item.header;
      const number = item.group;
      object[number] = name;
    }
  });

  return object;
};

const readUsageInfo = async () => {
    let github = {};
    try {
    const { classData } = await fs.readJson(mappedGithubData.out);
    github = classData;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return github;
}

const processSection = (section, dir, usageInfo) => {
  // helper vars
  const { header, markup } = section;
  const isFile = markup.includes('.html');
  const isWideStr = '{{isWide}}';
  const isWide = section.description.includes(isWideStr);
  const isHelperStr = '{{isHelper}}';
  const isHelper = section.description.includes(isHelperStr);
  const isRecipeStr = '{{isRecipe}}';
  const isRecipe = section.description.includes(isRecipeStr);
  const isTool = header.includes('@');
  const keywordsStr = /Keywords: (.*)/;
  const keywordsMatch = keywordsStr.exec(section.description);

  const description = md.render(
    section.description
      .replace(isWideStr, '')
      .replace(isHelperStr, '')
      .replace(isRecipeStr, '')
      .replace(keywordsStr, '')
  );
  const cleanDesc = stripTags(description);
  const githubLink = `${GITHUB_URL}/${section.source.path}#L${section.source.line}`;

  // create an order number
  const ref = section.referenceURI;
  const orderNumber =
    section.depth === 1 ? Number(`${ref}00`) : Number(ref.replace(/-/gi, ''));
  const group = ref[0];

  // extract mainClass and prettyName (regex)
  let mainClass = slugify(header);
  let prettyName = header;
  const parens = /\(([^)]+)\)/;
  const parensMatch = parens.exec(header);
  if (parensMatch && typeof parensMatch[1] !== 'undefined') {
    [, mainClass] = parensMatch;
    prettyName = prettyName.replace(parens, '').trim();
  }
  const slug = slugify(mainClass);


  // github usage data
  let githubData = [];
  if (
    typeof usageInfo[mainClass] !== 'undefined' &&
    typeof usageInfo[mainClass].searchDataArr === 'object'
  ) {
    githubData = usageInfo[mainClass].searchDataArr;
  }


  // grab code snippet
  let snippet = markup;
  let templateCode = markup;
  if (isFile) {
    const markupPath = `${dir}/${markup}`;
    templateCode = fs.readFileSync(markupPath, 'utf-8');
  }
  const env = nunjucks.configure('./assets/scss');
  try {
    snippet = env.renderString(templateCode, section);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  const codeSnippet = snippet;

  // process modifiers
  const modifiers = section.modifiers.map((modifier) => {
    const { className } = modifier;
    const isInverse = className.includes('white');
    const modifierMarkup = markup.replace(/{{ className }}/g, className);
    const modifierDesc = md.render(modifier.description);
    let modifierSnippet = modifierMarkup;
    try {
      modifierSnippet = env.renderString(templateCode, { className });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
    let modifierGithubData = [];
    if (
      typeof usageInfo[className] !== 'undefined' &&
      typeof usageInfo[className].searchDataArr === 'object'
    ) {
      modifierGithubData = usageInfo[className].searchDataArr;
    }

    return {
      ...modifier,
      markup: modifierMarkup,
      description: modifierDesc,
      parentClass: slug,
      isInverse,
      modifierSnippet,
      githubData: modifierGithubData,
    };
  });

  // check colors
  const colors = section.colors.map((color) => {
    return {
      ...color,
      aa: passesWcagAa(color.color, '#fff'),
      aaLargeText: passesWcagAaLargeText(color.color, '#fff'),
      aaa: passesWcagAaa(color.color, '#fff'),
    };
  });

  // extra keywords (regex)
  let keywords = [`${prettyName.toLowerCase()} (${mainClass})`];
  if (modifiers.length > 0) {
    keywords = [
      ...keywords,
      ...modifiers.map((modifier) => modifier.className),
    ];
  }
  if (keywordsMatch && typeof keywordsMatch[1] !== 'undefined') {
    const extraKeywords = keywordsMatch[1].replace('</p>', '').split(', ');
    const labeledKeywords = extraKeywords.map((word) => {
      return `${word} (${prettyName.toLowerCase()})`;
    });
    keywords = [...labeledKeywords, ...keywords];
  }

  const context = {
    ...section,
    slug,
    isFile,
    isWide,
    isHelper,
    isRecipe,
    isTool,
    cleanDesc,
    githubLink,
    description,
    mainClass,
    prettyName,
    codeSnippet,
    group,
    orderNumber,
    modifiers,
    colors,
    keywords,
    githubData,
  };

  return context;
};

const processComments = async dirMap => {
  const raw = await kss.traverse(dirMap, { markdown: true });
  const styleGuideString = JSON.stringify(raw);
  const styleGuideData = JSON.parse(styleGuideString);
  const usageInfo = await readUsageInfo();

  // parse sections
  const sectionData = styleGuideData.sections.map((section) =>
    processSection(section, dirMap, usageInfo)
  );

  // create a map of groups
  const groupMap = createMap(sectionData);

  // sort step 1 (orderNumber)
  sectionData.sort((a, b) => {
    const keyA = a.orderNumber;
    const keyB = b.orderNumber;
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });

  // sort step 2 (nest by section)
  const nested = {};
  const nonNested = [];
  const modifiers = [];
  sectionData.forEach(item => {
    const name = groupMap[item.group.toString()];
    const {prettyName, slug, header, description } = item;
    if (item.depth > 2) {
      const groupedItem = {
        ...item,
        section: name,
        sectionSlug: slugify(name),
      };
      nonNested.push(groupedItem);
      if (item.modifiers.length > 0) {
        item.modifiers.forEach(modifier => {
          modifiers.push(modifier);
        });
      }
    }
    const basicInfo = { prettyName, slug, header };
    if (typeof nested[name] !== 'object') {
      nested[name] = {
        list: [basicInfo],
        slug: slugify(name),
        name,
        description,
      };
    } else {
      nested[name].list.push(basicInfo);
    }
  });

  // sort step 3 (convert back to arr)
  const nestedArr = [];
  Object.keys(nested).forEach(e => {
    // Sort style data by reference number
    nested[e].list.sort((a, b) => {
      const keyA = a.header;
      const keyB = b.header;
      // Compare the 2 names
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
    nestedArr.push(nested[e]);
  });
  const allData = {
    all: nonNested,
    nested: nestedArr,
    modifiers
  };
  return allData;
};

module.exports = async dir => {
  const spinner = ora('Parsing SCSS comments').start();
  const docs = await processComments(dir);

  spinner.succeed();
  return docs;
};
