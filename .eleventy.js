const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const dev = require('./docs/config/tasks/dev');

module.exports = function (eleventyConfig) {
  eleventyConfig.on('beforeWatch', function () {
    dev();
  });
  eleventyConfig.setQuietMode(true);
  eleventyConfig.addWatchTarget('**/*.scss');

  eleventyConfig.addPlugin(syntaxHighlight, {
    templateFormats: ['njk', 'md'],
  });
  eleventyConfig.addNunjucksFilter('toPx', function (value) {
    let rems = value.replace(/(rem|em)$/, '');
    rems = Number(rems);
    return `${rems * 16}px`;
  });

  eleventyConfig.addNunjucksFilter('getSize', function (value) {
    let size = value.replace('$size-', '');
    // size = value.replace("$font-letter-spacing-", "");
    return size;
  });
  eleventyConfig.addNunjucksFilter('getLsp', function (value) {
    let size = value.replace('$font-letter-spacing-', '');
    // size = value.replace("$font-letter-spacing-", "");
    return size;
  });

  return {
    dir: {
      input: 'docs/src/',
      output: 'docs/dist',
      data: 'data',
      layouts: 'layouts',
    },
    passthroughFileCopy: true,
    templateFormats: ['njk', 'md', 'css', 'html', 'yml'],
    htmlTemplateEngine: 'njk',
  };
};
