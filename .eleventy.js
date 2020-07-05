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
  eleventyConfig.addNunjucksFilter('toPx', function (value) {
    let rems = value.replace(/(rem|em)$/, '');
    rems = Number(rems);
    return `${rems * 16}px`;
  });
  eleventyConfig.addNunjucksFilter('getSize', function (value) {
    return value.replace('$size-', '');
  });

  // temp logger
  eleventyConfig.addFilter('dump', (obj) => {
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return;
          }
          seen.add(value);
        }
        return value;
      };
    };

    return JSON.stringify(obj, getCircularReplacer(), 4);
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
