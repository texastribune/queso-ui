const fs = require('fs');
const fetch = require('node-fetch');
const kss = require('kss'),
  options = {
    markdown: true,
  };
const dotenv = require('dotenv').config();
const token = process.env.GITHUB_TOKEN;

const doFetch = true;
const brandJSON = process.env.DS_URL;
const icons = require('../dist/icons.json');
const githubData = require('../dist/github.json');

const outputDir = 'dist';
const outputFilename = `${outputDir}/styles.json`;
const outputFilenameNested = `${outputDir}/styles-nested.json`;

// Helpers
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
const escapeHTML = unsafeText => {
  return unsafeText.replace(/[^0-9A-Za-z ]/g, function(c) {
    return '&#' + c.charCodeAt(0) + ';';
  });
};
const stripTags = str => {
  return str.replace(/(<([^>]+)>)/gi, '');
};

const findDupe = arr => {
  const object = {};
  const result = [];

  arr.forEach(item => {
    if (!object[item.orderNumber]) object[item.orderNumber] = 0;
    object[item.orderNumber] += 1;
  });
  for (const prop in object) {
    if (object[prop] >= 2) {
      result.push(prop);
    }
  }
  return result;
};

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

let styles = {
  name: 'Our CSS Toolbox',
  cssFile: 'all.min.css',
  iconSets: icons,
  github: 'https://github.com/texastribune/ds-toolbox/blob/master',
};


async function getDesignTokens() {
  let designTokens = [];
  return fetch(brandJSON)
    .then(resp => resp.json())
    .then(json => {
      console.log('Fetched tokens');
      const data = json.list;
      const colors = data.colors;
      colors.forEach(colorSet => {
        // Make an array of color items
        let swatchSet = [];
        let colorSetArr = colorSet.colors;
        colorSetArr.forEach(swatch => {
          let swatchObj = {
            color: swatch.value,
            name: `$color-${slugify(swatch.name)}`,
            description: swatch.name,
            referenceNumber: '1.1.1',
          };
          swatchSet.push(swatchObj);
        });
        let colorSetObj = {
          header: colorSet.name,
          colors: swatchSet,
        };
        console.log(`Added ${colorSet.name} to design data`);
        designTokens.push(colorSetObj);
      });
      return designTokens;
    })
    .catch(e => console.log(e));
}
async function getComments() {
  let allStyles = [];
  return kss
    .traverse('./assets/scss/', options)
    .then(function(styleGuide) {
      // Now use KSS parsed data
      let styleGuideString = JSON.stringify(styleGuide);
      let styleGuideData = JSON.parse(styleGuideString);
      let sectionsArr = styleGuideData.sections;

      sectionsArr.forEach(section => {
        // Add a slug
        let name = slugify(section.header);
        let sectionObj = section;
        sectionObj.slug = name;

        // Extract classname from header
        let mainClass = sectionObj.slug;
        let parens = /\(([^)]+)\)/;
        let parensMatch = parens.exec(section.header);
        let prettyName = section.header;
        if (parensMatch && typeof parensMatch[1] !== 'undefined') {
          mainClass = parensMatch[1];
          prettyName = prettyName.replace(parens, '');
        }
        sectionObj.prettyName = prettyName;
        sectionObj.mainClass = mainClass;

        // Check description for hints
        let isWide = /{{isWide}}/;
        let isWideMatch = isWide.exec(section.description);
        let isWideBool = false;
        if (isWideMatch && typeof isWideMatch[0] !== 'undefined') {
          section.description = section.description.replace(isWide, '');
          isWideBool = true;
        }
        sectionObj.isWide = isWideBool;

        // Strip description tags
        let cleanDesc = stripTags(section.description);
        sectionObj.cleanDesc = cleanDesc;

        // Add github link
        const githubLink = `${styles.github}/${section.source.path}#L${
          section.source.line
        }`;
        sectionObj.githubLink = githubLink;

        // Check for markup as file or inline
        let isFile = false;
        let codeSnippet = escapeHTML(section.markup);

        // Look for "white" in class name
        let modifierEdit = [];
        section.modifiers.forEach(modifier => {
          // If there's white in the class name, mark as inverse
          let isInverse = false;
          if (modifier.className.includes('white')) {
            isInverse = true;
          }
          let modObj = modifier;
          modObj.isInverse = isInverse;
          modifierEdit.push(modObj);
        });
        sectionObj.modifiers = modifierEdit;

        if (
          typeof section.markup !== 'undefined' &&
          section.markup.includes('.html')
        ) {
          isFile = true;
          // Parse contents and write to object
          let contents = fs.readFileSync(
            `./assets/scss/${section.markup}`,
            'utf-8'
          );
          codeSnippet = escapeHTML(contents);
        } else if (
          typeof section.markup !== 'undefined' &&
          section.markup.includes('<')
        ) {
          // Pass className to modifiers and look for inverses
          let modifierEdit2 = [];
          section.modifiers.forEach(modifier => {
            let pattern = /{{ className }}/g;
            let markupStr = section.markup.replace(pattern, modifier.className);
            let modObj = modifier;
            modObj.markup = markupStr;
            modifierEdit2.push(modObj);
          });
          sectionObj.modifiers = modifierEdit2;
        }
        sectionObj.isFile = isFile;
        sectionObj.codeSnippet = codeSnippet;

        // Check for function or mixin
        let isTool = false;
        if (section.header.includes('@')) {
          isTool = true;
        }
        sectionObj.isTool = isTool;

        // Create an order number
        let orderNumber = Number(section.referenceURI.replace(/-/gi, ''));
        if (section.depth === 1) {
          orderNumber = Number(section.referenceURI + '00');
        }
        sectionObj.group = section.referenceURI[0];
        sectionObj.orderNumber = orderNumber;

        // Finally, push mutated custom object to array
        allStyles.push(sectionObj);
      });
      return allStyles;
    })
    .catch(e => console.log(e));
}

function fetchGithubData(url) {
  let occurrenceArr = [];
  return fetch(url, {
    method: 'GET',
    withCredentials: true,
    headers: {
      Authorization: 'token ' + token,
      'user-agent': 'node.js',
    },
  })
    .then(resp => resp.json())
    .then(json => {
      console.log(json);
      if (!json.incomplete_results && typeof json.items === 'object') {
        json.items.forEach(occurrence => {
          let occObj = {
            file: occurrence.name,
            link: occurrence.html_url,
          };
          occurrenceArr.push(occObj);
        });
      }
      let gitHubData = {
        results: occurrenceArr,
        count: occurrenceArr.length,
      };
      return gitHubData;
    })
    .catch(e => {
      console.log(e);
      return e;
    });
}

async function githubFn(url) {
  let data = await fetchGithubData(url);
  console.log(`fetched ${url}`);
  return data;
}

const buildStyleData = async () => {
  // const designTokenData = await getDesignTokens();
  const designTokenData = [];
  const styleData = await getComments();
  const mergedData = designTokenData.concat(styleData);
  let checkedArr = [];
  const duplicates = findDupe(mergedData);
  const groupMap = createMap(mergedData);
  let searchUrls = [];
  // Loop through again and perform github and duplicate checks
  for (const item of mergedData) {
    // Now check in on github for deprecated items
    if (item.deprecated && doFetch) {
      // Most of the time we want where it's used in HTML.
      let language = 'html';
      // In some cases we want to search for CSS instances.
      if (item.mainClass === 'resets') {
        language = 'scss';
      }

      if (item.mainClass !== 'undefined') {
        const donations = `https://api.github.com/search/code?q=${
          item.mainClass
        }+language:${language}+repo:texastribune/donations`;
        const main = `https://api.github.com/search/code?q=${
          item.mainClass
        }+language:${language}+repo:texastribune/texastribune`;
        searchUrls.push({
          name: item.slug,
          donations: donations,
          main: main,
        });
      }
    }
    fs.writeFileSync(
      `${outputDir}/urls.json`,
      JSON.stringify(searchUrls, null, 2)
    );
    // Label duplicates
    if (duplicates.includes(item.orderNumber.toString())) {
      item.isDuplicate = true;
    } else {
      item.isDuplicate = false;
    }
    // Label groups
    item.groupName = groupMap[item.group.toString()];

    // Check for github data
    const found = githubData.find(function(query) {
      if (query.name === item.slug) {
        return query;
      }
    });
    if (typeof found === 'object') {
      item.gitHubData = [
        {
          name: 'Main (texastribune)',
          results: found.main.results,
          count: found.main.count,
        },
        {
          name: 'Donations',
          results: found.donations.results,
          count: found.donations.count,
        },
      ];
    }

    checkedArr.push(item);
  }

  // Sort style data by reference number
  checkedArr.sort(function(a, b) {
    var keyA = a.orderNumber,
      keyB = b.orderNumber;
    // Compare the 2 dates
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });

  // ADD to styles to style config
  // styles.styleData = checkedArr;

  // nest the json by section
  let nested = {};
  let nestedArr = [];
  checkedArr.forEach(classItem => {
    let group = classItem.groupName;
    if (typeof nested[group] !== 'object') {
      nested[group] = {
        name: group,
        list: [classItem],
        slug: slugify(group),
      };
    } else {
      nested[group]['list'].push(classItem);
    }
  });
  Object.keys(nested).forEach((e, index) => {
    // Sort style data by reference number
    nested[e].list.sort(function(a, b) {
      var keyA = a.header,
        keyB = b.header;
      // Compare the 2 dates
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
    nestedArr.push(nested[e]);
  });
  styles.items = nestedArr;

  fs.writeFileSync(outputFilename, JSON.stringify(styles, null, 4));
};

buildStyleData();
