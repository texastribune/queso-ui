/**
 * Kicks off all the documentation runners and template compiling steps
 *
 */

const fs = require('fs-extra');
const Purgecss = require('purgecss');
const purgeHtml = require('purgecss-from-html');
const path = require('path');
const styleDocRunner = require('./style-doc');
const iconDocRunner = require('./icon-doc');
const htmlRunner = require('./html');
const config = require('../../../package.json');

const { docsStyles, docsIcons, mappedGithubData } = require('../paths.js');

const COMPONENT_CSS_FILE = 'all.css';
const COMPONENT_CSS_FILE_MIN = 'no-resets.css';
const LEGACY_CSS_FILE = 'all-legacy.css';
const COMPONENT_CSS_PATH = './docs/dist/css';

const purge = (html, filePath) => {
  return new Purgecss({
    content: [html],
    css: [filePath],
    keyframes: true,
    extractors: [
      {
        extractor: purgeHtml,
        extensions: ['html'],
      },
    ],
  });
};

const clean = async (html, deprecated) => {
  let css = COMPONENT_CSS_FILE;
  if (deprecated) {
    css = LEGACY_CSS_FILE;
  }
  const filePath = `${COMPONENT_CSS_PATH}/${css}`;
  const filePathMin = `${COMPONENT_CSS_PATH}/${COMPONENT_CSS_FILE_MIN}`;

  const purgecss = purge(html, filePath);
  const purgecssMin = purge(html, filePathMin);

  const file = path.basename(html, path.extname(html));
  const dir = path.dirname(html);
  const purgecssResult = await purgecss.purge();
  const purgecssParsed = purgecssResult[0].css;
  const purgecssResultMin = await purgecssMin.purge();
  const purgecssParsedMin = purgecssResultMin[0].css;
  // create a css file
  try {
    await fs.outputFile(`${dir}/${file}.css`, purgecssParsed);
  } catch (err) {
    throw err;
  }
  try {
    await fs.outputFile(`${dir}/${file}-min.css`, purgecssParsedMin);
  } catch (err) {
    throw err;
  }
  // create a styled preview
  try {
    const htmlStr = await fs.readFileSync(html, 'utf-8');
    await fs.outputFile(
      `${dir}/${file}-preview.html`,
      `<style>${purgecssParsed}</style>\n${htmlStr}`
    );
  } catch (err) {
    throw err;
  }
};

const merge = async styles => {
  let github = {};
  try {
    github = await fs.readJson(mappedGithubData.out);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return styles;
  }
  const items = styles.items.map(section => {
    const list = section.list.map(classInfo => {
      const { mainClass } = classInfo;
      let githubData = {};
      if (typeof github[mainClass] !== 'undefined') {
        githubData = github[mainClass].searchDataArr;
      }
      const modifiers = classInfo.modifiers.map(modifier => {
        const { className } = modifier;
        let githubDataMod = {};
        if (typeof github[className] !== 'undefined') {
          githubDataMod = github[className].searchDataArr;
        }
        return {
          ...modifier,
          githubData: githubDataMod,
        };
      });
      return {
        ...classInfo,
        githubData,
        modifiers,
      };
    });
    return {
      ...section,
      list,
    };
  });
  return {
    ...styles,
    items,
  };
};

module.exports = async () => {
  // creates object for docs
  let styleDocs = await styleDocRunner(docsStyles);
  const iconDocs = await iconDocRunner(docsIcons);

  // add github data
  try {
    styleDocs = await merge(styleDocs);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }

  // loop through classes and add github data
  const allDocs = {
    styleDocs,
    iconDocs,
    config,
  };
  try {
    await fs.outputFile(
      './docs/dist/data/docs.json',
      JSON.stringify(allDocs, null, 2)
    );
  } catch (err) {
    throw new Error(err.message);
  }

  // creates pages
  const pagesPathIn = './docs/src/page.html';
  const pagesPathOut = './docs/dist/pages/';
  const htmlMap = styleDocs.items.map(section => {
    return {
      in: pagesPathIn,
      out: `${pagesPathOut}${section.slug}/index.html`,
      data: {
        ...section,
        config
      },
    };
  });

  await htmlRunner(htmlMap);

  // creates previews
  const previewPathIn = './docs/src/preview.html';
  const previewPathInRaw = './docs/src/preview-raw.html';
  const previewPathOut = './docs/dist/pages/';
  const previewArr = [];
  const componentArr = [];
  styleDocs.items.forEach(section => {
    section.list.forEach(item => {
      if (item.markup.length > 0) {
        const out = `${previewPathOut}${section.slug}/${item.mainClass}`;
        // build preview
        previewArr.push({
          in: previewPathIn,
          out: `${out}.html`,
          data: {
            ...item,
          },
        });
        // build raw preview
        componentArr.push({
          in: previewPathInRaw,
          out: `${out}/raw.html`,
          data: item,
        });
      }
    });
  });

  await htmlRunner(previewArr);
  await htmlRunner(componentArr);

  // generate component CSS
  await Promise.all(
    componentArr.map(component =>
      clean(component.out, component.data.deprecated)
    )
  );

  // creates search include
  const searchPathIn = './docs/src/includes/search.html';
  const searchPathOut = './docs/dist/search.html';
  const searchArr = styleDocs.items.map(item => {
    return item.list.map(className => {
      return {
        ...className,
        link: `/pages/${item.slug}#${className.slug}`,
        terms: className.keywords,
      };
    });
  });
  const keywords = {
    keywords: searchArr.flat(),
  };
  const searchMap = {
    in: searchPathIn,
    out: searchPathOut,
    data: keywords,
  };
  await htmlRunner([searchMap]);

  // creates main
  const mainPathIn = './docs/src/index.html';
  const mainPathOut = './docs/dist/index.html';
  const mainMap = {
    in: mainPathIn,
    out: mainPathOut,
    data: allDocs,
  };

  await htmlRunner([mainMap]);

  return 'Generated docs';
};
