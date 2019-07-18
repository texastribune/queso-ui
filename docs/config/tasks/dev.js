/**
 * Spins up browserSync server and builds docs
 *
 */

const watch = require('glob-watcher');
const browserSync = require('browser-sync');
const { styles, icons, utils } = require('@texastribune/queso-tools');
const copyRunner = require('./copy');
const docsRunner = require('./docs.js');
const githubRunner = require('./github.js');

const { mappedStyles, mappedCopies, mappedIcons } = require('../paths.js');

const printInstructions = (external, local) => {
  utils.logMessage(`${external} | ${local}`, 'green');
};

async function dev() {
  // create the browser-sync client
  const bs = browserSync.create();

  bs.init(
    {
      logConnections: true,
      logLevel: 'silent',
      logPrefix: 'queso-ui',
      notify: false,
      open: false,
      port: 3000,
      server: {
        baseDir: ['./docs/dist'],
      },
    },
    async err => {
      // if browser-sync failed to start up, hard stop here
      if (err) {
        return utils.logMessage(err, 'red');
      }

      // track whether errors or warnings already exist on other compiles
      let templatesError = null;
      let stylesError = null;

      utils.logMessage('Starting initial serve...');

      const urls = bs.getOption('urls');

      const local = urls.get('local');
      const external = urls.get('external');

      const onError = (type, error) => {
        utils.logMessage(`${type} failed to compile.\n`);
        utils.logMessage(error);
      };

      const logStatus = () => {
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
          printInstructions(local, external);
        }
      };

      const compile = async () => {
        try {
          await styles(mappedStyles);
          stylesError = null;
        } catch (e) {
          stylesError = e;
        }
        try {
          await docsRunner();
          templatesError = null;
        } catch (e) {
          templatesError = e;
        }

        try {
          await copyRunner(mappedCopies);
          templatesError = null;
        } catch (e) {
          templatesError = e;
        }

        // if browsersync is active, reload it
        if (bs.active) {
          bs.reload();
        }

        logStatus();
      };

      // build github data
      await githubRunner();

      // build icons
      await icons(mappedIcons);

      // initial compile
      await compile();

      // docs watching
      return watch(
        [
          './assets/scss/**/*.html',
          './assets/scss/**/*.scss',
          './docs/src/**/*.html',
          './docs/src/scss/**/*.scss',
          './docs/src/js/**/*.js',
        ],
        compile
      );
    }
  );
}

dev().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err.message);
});
