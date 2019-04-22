// utility
const fs = require('fs-extra');

// internal
const styleDocRunner = require('../../tasks/style-doc');
const iconDocRunner = require('../../tasks/icon-doc');
const htmlRunner = require('../../tasks/html');
const { docsStyles, docsIcons } = require('./paths.js');

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
  const previewPathOut = './docs/dist/pages/';
  let previewArr = [];
  styleDocs.items.map(section => {
    section.list.map(item => {
      if (item.markup.length > 0) {
        previewArr.push({
          in: previewPathIn,
          out: `${previewPathOut}${section.slug}/${item.mainClass}.html`,
          data: item,
        });
      }
      return;
    });
    return;
  });

  await htmlRunner(previewArr);

  // creates main
  const mainPathIn = './docs/src/index.html';
  const mainPathOut = './docs/dist/index.html';
  const mainMap = {
    in: mainPathIn,
    out: mainPathOut,
    data: allDocs,
  };

  await htmlRunner([mainMap]);

  return 'Generated docs'
}
