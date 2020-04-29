/**
 * Builds and compiles docs
 *
 */
const iconMap = require('../../config/tasks/icon-doc');
const { mappedIcons } = require('../../config/paths.js');

module.exports = async () => {
  // build doc data and template
  const icons = await iconMap(mappedIcons);
  return icons;
};
