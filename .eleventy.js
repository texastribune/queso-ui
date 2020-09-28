const dev = require('./docs/config/tasks/dev');

module.exports = function (eleventyConfig) {
  // watch task
  eleventyConfig.on('beforeWatch', function () {
    dev();
  });
  eleventyConfig.setQuietMode(true);
  eleventyConfig.addWatchTarget('**/*.scss');
  eleventyConfig.addWatchTarget('./assets/scss/**/*.html');

  // filters
  eleventyConfig.addNunjucksFilter('toPx', (value) => {
    let rems = value.replace(/(rem|em)$/, '');
    rems = Number(rems);
    return `${rems * 16}px`;
  });
  eleventyConfig.addNunjucksFilter('getSize', (value) => {
    return value.replace('$size-', '');
  });
  eleventyConfig.addFilter('usageKey', (value, usage) => {
    const usageObj = usage[value];
    if (typeof usageObj === 'object') {
      return usageObj.data
    } else {
      return [];
    }
  });
  eleventyConfig.addFilter('modifierKey', (value, modifiers) => {
    return modifiers[value];
  });
  eleventyConfig.addFilter('cleanSlug', (value) => {
    return value.replace(/[^-0-9A-Za-z]/gi, '').toLowerCase();
  });
  eleventyConfig.addFilter('cleanName', (value) => {
    return value.replace(/\(([^)]+)\)/gi, '').trim();
  });

  // settings
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
