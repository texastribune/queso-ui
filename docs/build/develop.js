const watch = require('./watch');

async function develop() {
  await watch();
}

develop().catch(console.error);
