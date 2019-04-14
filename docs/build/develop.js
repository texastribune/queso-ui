// internal
const { series, clearConsole } = require('../../tasks/utils');

// tasks

const watch = require('./watch');

async function develop() {
  // clearConsole();
  await watch();
}


develop().catch(console.error);
