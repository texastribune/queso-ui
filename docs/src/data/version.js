/**
 * Export current version
 *
 */
const config = require('../../../package.json');

module.exports = async () => {
  return config.version;
};
