/**
 * Export style data
 *
 */
const styleDocRunner = require('../../build/config/tasks/style-doc2');
const { docsStyles } = require('../../config/paths.js');

module.exports = async () => {
  // build doc data and template
  const styles = await styleDocRunner(docsStyles);
  return styles;
};
