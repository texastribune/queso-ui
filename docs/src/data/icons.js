/**
 * Export icon data
 *
 */
const iconMap = require('../../config/tasks/icon-doc');
const { docsIcons } = require('../../config/paths.js');

module.exports = async () => {
  // build doc data and template
  const icons = await iconMap(docsIcons);
  return icons;
};
