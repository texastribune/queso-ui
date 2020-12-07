/**
 * Export watermark data
 *
 */
const waterMarkRunner = require('../../build/config/tasks/watermark');

module.exports = async () => {
  // build array of files
  const watermarks = await waterMarkRunner();
  return watermarks;
};
