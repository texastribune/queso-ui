// utility packages
const fs = require('fs');
const ora = require('ora');

const kss = require('kss');

// internal
const { slugify, stripTags, escapeHTML } = require('./utils');

GITHUB_URL = 'https://github.com/texastribune/ds-toolbox/blob/master';

const createMap = arr => {
  const object = {};

  arr.forEach(item => {
    if (item.depth === 1) {
      let name = item.header;
      let number = item.group;
      object[number] = name;
    }
  });

  return object;
};

const processSection = (section, dir) => {
  // helper vars
  const header = section.header;
  const slug = slugify(header);
  const markup = section.markup;
  const isFile = markup.includes('.html');
  const isWideStr = '{{isWide}}';
  const isWide = section.description.includes(isWideStr);
  const isTool = header.includes('@');
  const description = section.description.replace(isWideStr, '');
  const cleanDesc = stripTags(description);
  const githubLink = `${GITHUB_URL}/${section.source.path}#L${
    section.source.line
  }`;

  // create an order number
  const ref = section.referenceURI;
  const orderNumber =
    section.depth === 1 ? Number(ref + '00') : Number(ref.replace(/-/gi, ''));
  const group = ref[0];

  // extract mainClass and prettyName (regex)
  let mainClass = slug;
  let prettyName = header;
  const parens = /\(([^)]+)\)/;
  const parensMatch = parens.exec(header);
  if (parensMatch && typeof parensMatch[1] !== 'undefined') {
    mainClass = parensMatch[1];
    prettyName = prettyName.replace(parens, '').trim();
  }

  // grab code snippet
  const snippet = isFile
    ? fs.readFileSync(`${dir}/${markup}`, 'utf-8')
    : markup;
  const codeSnippet = escapeHTML(snippet);

  // process modifiers
  const modifiers = section.modifiers.map(modifier => {
    const className = modifier.className;
    const isInverse = className.includes('white');
    const modifierMarkup = markup.replace(/{{ className }}/g, className);
    return {
      ...modifier,
      isInverse,
      markup: modifierMarkup,
    };
  });

  let context = {
    ...section,
    slug,
    isFile,
    isWide,
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
  let styleGuideString = JSON.stringify(raw);
  let styleGuideData = JSON.parse(styleGuideString);

  // parse sections
  const sectionData = styleGuideData.sections.map(section =>
    processSection(section, dirMap)
  );

  // create a map of groups
  const groupMap = createMap(sectionData);

  // sort step 1 (reference number)
  sectionData.sort(function(a, b) {
    var keyA = a.orderNumber,
      keyB = b.orderNumber;
    // Compare the 2 dates
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });

  // sort step 2 (nest by section)
  let nested = {};
  for (const item of sectionData) {
    const name = groupMap[item.group.toString()];
    if (typeof nested[name] !== 'object') {
      nested[name] = {
        name: name,
        list: [item],
        slug: slugify(name),
      };
    } else {
      nested[name]['list'].push(item);
    }
  }

  // sort step 3 (convert back to arr)
  let nestedArr = [];
  Object.keys(nested).forEach((e, index) => {
    // Sort style data by reference number
    nested[e].list.sort(function(a, b) {
      var keyA = a.header,
        keyB = b.header;
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
