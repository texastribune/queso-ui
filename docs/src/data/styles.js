/**
 * Export style data
 *
 */
const styleDocRunner = require('../../config/tasks/style-doc');
const { docsStyles } = require('../../config/paths.js');

module.exports = async () => {
  // build doc data and template
  const styles = await styleDocRunner(docsStyles);
  return styles;
};
