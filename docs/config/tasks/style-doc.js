/**
 * Create object of SCSS documentation in a directory
 *
 * @param {Arr} dir - in/out directory
 * @returns {Object} - array of processed style docs
 */

// utility packages
const fs = require('fs');
const ora = require('ora');
const kss = require('kss');
const md = require('markdown-it')({ html: true });

// internal
const { slugify, stripTags } = require('./utils');

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

const processSection = (section, dir) => {
  // helper vars
  const { header, markup } = section;
  const slug = slugify(header);
  const isFile = markup.includes('.html');
  const isWideStr = '{{isWide}}';
  const isWide = section.description.includes(isWideStr);
  const isHelperStr = '{{isHelper}}';
  const isHelper = section.description.includes(isHelperStr);
  const isRecipeStr = '{{isRecipe}}';
  const isRecipe = section.description.includes(isRecipeStr);
  const isTool = header.includes('@');
  const description = md.render(
    section.description
      .replace(isWideStr, '')
      .replace(isHelperStr, '')
      .replace(isRecipeStr, '')
  );
  const cleanDesc = stripTags(description);
  const githubLink = `${GITHUB_URL}/${section.source.path}#L${
    section.source.line
  }`;

  // create an order number
  const ref = section.referenceURI;
  const orderNumber =
    section.depth === 1 ? Number(`${ref}00`) : Number(ref.replace(/-/gi, ''));
  const group = ref[0];

  // extract mainClass and prettyName (regex)
  let mainClass = slug;
  let prettyName = header;
  const parens = /\(([^)]+)\)/;
  const parensMatch = parens.exec(header);
  if (parensMatch && typeof parensMatch[1] !== 'undefined') {
    [, mainClass] = parensMatch;
    prettyName = prettyName.replace(parens, '').trim();
  }

  // grab code snippet
  let snippet = markup;
  if (isFile) {
    const markupPath = `${dir}/${markup}`;
    snippet = fs.readFileSync(markupPath, 'utf-8');
  }
  const codeSnippet = snippet;

  // process modifiers
  const modifiers = section.modifiers.map(modifier => {
    const { className } = modifier;
    const isInverse = className.includes('white');
    const modifierMarkup = markup.replace(/{{ className }}/g, className);
    const modifierDesc = md.render(modifier.description);
    return {
      ...modifier,
      isInverse,
      markup: modifierMarkup,
      description: modifierDesc,
    };
  });

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
  };

  return context;
};

const processComments = async dirMap => {
  const raw = await kss.traverse(dirMap, { markdown: true });
  const styleGuideString = JSON.stringify(raw);
  const styleGuideData = JSON.parse(styleGuideString);

  // parse sections
  const sectionData = styleGuideData.sections.map(section =>
    processSection(section, dirMap)
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
  sectionData.forEach(item => {
    const name = groupMap[item.group.toString()];
    if (typeof nested[name] !== 'object') {
      nested[name] = {
        list: [item],
        slug: slugify(name),
        name,
      };
    } else {
      nested[name].list.push(item);
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
    github: GITHUB_URL,
    items: nestedArr,
  };

  return allData;
};

module.exports = async dir => {
  const spinner = ora('Parsing SCSS comments').start();
  const docs = processComments(dir);
  spinner.succeed();
  return docs;
};
