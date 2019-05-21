// utility
const fs = require('fs-extra');
const Purgecss = require('purgecss');
const purgeHtml = require('purgecss-from-html');
const path = require('path');

// internal
const styleDocRunner = require('../../tasks/style-doc');
const iconDocRunner = require('../../tasks/icon-doc');
const htmlRunner = require('../../tasks/html');
const { getBundles } = require('../../tasks/utils');
const {
  docsStyles,
  docsIcons,
  mappedStylesManifest,
  mappedGithubData,
} = require('./paths.js');

const COMPONENT_CSS_FILE = 'no-resets';
const COMPONENT_CSS_PATH = './docs/dist/css';

const clean = async (html, bundles) => {
  const filePath = `${COMPONENT_CSS_PATH}/${bundles[COMPONENT_CSS_FILE]}`;

  const purgecss = new Purgecss({
    content: [html],
    css: [filePath],
    extractors: [
      {
        extractor: purgeHtml,
        extensions: ['html'],
      },
    ],
  });
  const file = path.basename(html, path.extname(html));
  const dir = path.dirname(html);
  const purgecssResult = await purgecss.purge();
  const purgecssParsed = purgecssResult[0].css;
  // create a css file
  try {
    await fs.outputFile(`${dir}/${file}.css`, purgecssParsed);
  } catch (err) {
    console.error(err);
  }
  // create a styled preview
  try {
    const htmlStr = await fs.readFileSync(html, 'utf-8');
    await fs.outputFile(
      `${dir}/${file}-preview.html`,
      `<style>${purgecssParsed}</style>\n${htmlStr}`
    );
  } catch (err) {
    console.error(err);
  }
};

const merge = async styles => {
  let github = {};
  try {
    github = await fs.readJson(mappedGithubData.out);
  } catch (err) {
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
  const bundles = await getBundles(mappedStylesManifest);

  // add github data
  try {
    styleDocs = await merge(styleDocs);
  } catch (error) {
    console.log(error);
  }

  // loop through classes and add github data
  const allDocs = {
    styleDocs,
    iconDocs,
    bundles,
  };
  try {
    await fs.outputFile(
      './docs/dist/data/docs.json',
      JSON.stringify(allDocs, null, 2)
    );
  } catch (err) {
    console.error(err);
  }

  // creates pages
  const pagesPathIn = './docs/src/page.html';
  const pagesPathOut = './docs/dist/pages/';
  const htmlMap = styleDocs.items.map(section => {
    section['bundles'] = bundles;
    return {
      in: pagesPathIn,
      out: `${pagesPathOut}${section.slug}/index.html`,
      data: section,
    };
  });

  await htmlRunner(htmlMap);

  // creates previews
  const previewPathIn = './docs/src/preview.html';
  const previewPathInRaw = './docs/src/preview-raw.html';
  const previewPathOut = './docs/dist/pages/';
  let previewArr = [];
  let componentArr = [];
  styleDocs.items.map(section => {
    section.list.map(item => {
      if (item.markup.length > 0) {
        const out = `${previewPathOut}${section.slug}/${item.mainClass}`;
        item['bundles'] = bundles;
        // map preview
        previewArr.push({
          in: previewPathIn,
          out: `${out}.html`,
          data: item,
        });
        // map raw preview for components
        componentArr.push({
          in: previewPathInRaw,
          out: `${out}/raw.html`,
          data: item,
        });
      }
      return;
    });
    return;
  });

  await htmlRunner(previewArr);
  await htmlRunner(componentArr);

  // generate component CSS
  await Promise.all(
    componentArr.map(component => clean(component.out, bundles))
  );

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
