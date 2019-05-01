// utility
const fs = require('fs-extra');
const Purgecss = require('purgecss');
const purgeHtml = require('purgecss-from-html');
const path = require('path');

// internal
const styleDocRunner = require('../../tasks/style-doc');
const iconDocRunner = require('../../tasks/icon-doc');
const htmlRunner = require('../../tasks/html');
const { docsStyles, docsIcons } = require('./paths.js');

const COMPONENT_CSS = './docs/dist/css/all.css';

const clean = async html => {
  const purgecss = new Purgecss({
    content: [html],
    css: [COMPONENT_CSS],
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

module.exports = async () => {
  // creates object for docs
  const styleDocs = await styleDocRunner(docsStyles);
  const iconDocs = await iconDocRunner(docsIcons);
  const allDocs = {
    styleDocs,
    iconDocs,
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
        const out = `${previewPathOut}${section.slug}/${
          item.mainClass
        }`;
        // map preview
        previewArr.push({
          in: previewPathIn,
          out: `${out}.html`,
          data: item,
        });
        // map raw preview for components
        if (section.slug === 'components') {
          componentArr.push({
            in: previewPathInRaw,
            out: `${out}/raw.html`,
            data: item,
          });
        }
      }
      return;
    });
    return;
  });

  await htmlRunner(previewArr);
  await htmlRunner(componentArr);

  // generate component CSS
  await Promise.all(componentArr.map(component => clean(component.out)));

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
