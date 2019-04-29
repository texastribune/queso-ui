// packages
const watch = require('glob-watcher');
const browserSync = require('browser-sync');
const colors = require('ansi-colors');

// lib
const stylesRunner = require('../../tasks/styles');
const {
  clearConsole,
  printInstructions,
  logErrorMessage,
} = require('../../tasks/utils');

const docsRunner = require('./docs.js');
const { mappedStyles } = require('./paths.js');

module.exports = async () => {
  // create the browser-sync client
  const bs = browserSync.create();

  bs.init(
    {
      logConnections: true,
      logLevel: 'silent',
      logPrefix: 'ds-toolbox',
      notify: false,
      open: false,
      port: 3000,
      server: {
        baseDir: ['./docs/dist'],
      },
    },
    async err => {
      // if browser-sync failed to start up, hard stop here
      if (err) return console.error(err);

      // track whether errors or warnings already exist on other compiles
      let templatesError = null;
      let stylesError = null;

      console.log('Starting initial serve...');

      const urls = bs.getOption('urls');

      const local = urls.get('local');
      const external = urls.get('external');

      const onError = (type, err) => {
        console.log(colors.red(`${type} failed to compile.\n`));
        logErrorMessage(err);
      };

      const onWarning = (type, err) => {
        console.log(colors.yellow(`${type} compiled with warnings.\n`));
        logErrorMessage(err);
      };

      const logStatus = () => {
        clearConsole();

        let hadError = false;

        if (templatesError) {
          hadError = true;
          onError('Templates', templatesError);
        }

        if (stylesError) {
          hadError = true;
          onError('Styles', stylesError);
        }

        if (!hadError) {
          console.log(colors.green('Project compiled successfully!'));
          printInstructions({ local, external });
        }
      };


      const compile = async () => {
        try {
          await stylesRunner(mappedStyles);
          stylesError = null;
        } catch (err) {
          stylesError = err;
        }
        try {
          await docsRunner();
          templatesError = null;
        } catch (err) {
          templatesError = err;
        }

        // if browsersync is active, reload it
        if (bs.active) {
          bs.reload();
        }

        logStatus();
      };

      // initial compile
      await compile();

      // docs watching
      watch(
        [
          './assets/scss/**/*.html',
          './assets/scss/**/*.scss',
          './docs/src/**/*.html',
          './docs/src/scss/**/*.scss',
        ],
        compile
      );
    }
  );
};
