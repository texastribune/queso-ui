// internal
const fs = require('fs');
// native
const path = require('path');

const colors = require('ansi-colors');

/**
 * Helper to swap out a file path's extension.
 *
 * @param {String} npath
 * @param {String} ext
 * @returns {String}
 */
const replaceExtension = (npath, ext) => {
  if (typeof npath !== 'string') {
    return npath;
  }

  if (npath.length === 0) {
    return npath;
  }

  const nFileName = path.basename(npath, path.extname(npath)) + ext;
  return path.join(path.dirname(npath), nFileName);
};

const logMessage = (msg, color) => {
  const message = msg != null && msg.message;
  let colorValue;
  switch (color) {
    case 'red':
      colorValue = '\x1b[31m%s\x1b[0m';
      break;
    case 'green':
      colorValue = '\x1b[32m%s\x1b[0m';
      break;
    case 'purple':
      colorValue = '\x1b[35m%s\x1b[0m';
      break;
    default:
      colorValue = '\x1b[37m%s\x1b[0m';
      break;
  }

  // eslint-disable-next-line no-console
  console.log(colorValue, `${message || msg}\n`);
};

const printInstructions = ({ external, local } = {}) => {
  console.log();
  console.log('You can view your project in the browser!');
  console.log();

  if (local) {
    console.log(`${colors.bold('Local server URL:')}       ${local}`);
  }

  if (external) {
    console.log(`${colors.bold('URL on your network:')}    ${external}`);
  }

  console.log();
};

const mkDirByPathSync = (targetDir, { isRelativeToScript = false } = {}) => {
  // eslint-disable-next-line prefer-destructuring
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir = isRelativeToScript ? __dirname : '.';

  return targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    try {
      fs.mkdirSync(curDir);
    } catch (err) {
      if (err.code === 'EEXIST') {
        // curDir already exists!
        return curDir;
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') {
        // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
      if (!caughtErr || (caughtErr && curDir === path.resolve(targetDir))) {
        throw err; // Throw if it's just the last created dir.
      }
    }

    return curDir;
  }, initDir);
};

const fileSizeReporter = async (filePath, threshold) => {
  let list = {};
  let isCompliant = false;
  try {
    const stats = await fs.statSync(filePath);
    const fileSizeInKB = parseFloat(stats['size'] / 1000).toFixed(2);
    if (threshold > Number(fileSizeInKB)) {
      isCompliant = true;
    }
    list = {
      size: Number(fileSizeInKB),
      valid: isCompliant,
    };
  } catch (err) {
    throw err;
  }
  return list;
};

const SVGOSettings = [
  {
    cleanupAttrs: true,
  },
  {
    removeDoctype: true,
  },
  {
    removeXMLProcInst: true,
  },
  {
    removeComments: true,
  },
  {
    removeMetadata: true,
  },
  {
    removeTitle: true,
  },
  {
    removeDesc: true,
  },
  {
    removeUselessDefs: true,
  },
  {
    removeEditorsNSData: true,
  },
  {
    removeEmptyAttrs: true,
  },
  {
    removeHiddenElems: true,
  },
  {
    removeEmptyText: true,
  },
  {
    removeEmptyContainers: true,
  },
  {
    removeViewBox: false,
  },
  {
    cleanupEnableBackground: true,
  },
  {
    convertStyleToAttrs: true,
  },
  {
    convertColors: true,
  },
  {
    convertPathData: true,
  },
  {
    convertTransform: true,
  },
  {
    removeUnknownsAndDefaults: true,
  },
  {
    removeNonInheritableGroupAttrs: true,
  },
  {
    removeUselessStrokeAndFill: true,
  },
  {
    removeUnusedNS: true,
  },
  {
    cleanupIDs: true,
  },
  {
    cleanupNumericValues: true,
  },
  {
    moveElemsAttrsToGroup: true,
  },
  {
    moveGroupAttrsToElems: true,
  },
  {
    collapseGroups: true,
  },
  {
    removeRasterImages: false,
  },
  {
    mergePaths: true,
  },
  {
    convertShapeToPath: true,
  },
  {
    sortAttrs: true,
  },
  {
    removeDimensions: true,
  },
];

const slugify = text => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const stripTags = str => {
  return str.replace(/(<([^>]+)>)/gi, '');
};

const escapeHTML = unsafeText => {
  return unsafeText.replace(/[^0-9A-Za-z ]/g, function(c) {
    return '&#' + c.charCodeAt(0) + ';';
  });
};

/**
 * Helper to run a series of Promise-returning functions in a series.
 *
 * @param {Array<Function>} fns
 * @returns {void}
 */
const series = fns => async () => {
  // eslint-disable-next-line
  for (const fn of fns) {
    // eslint-disable-next-line
    await fn();
  }
};

/**
 * Helper to run a collection of Promise-returning functions in parallel.
 *
 * @param {Array<Function>} fns
 * @returns {Function}
 */
const parallel = fns => () => Promise.all(fns.map(fn => fn()));

const isInteractive = process.stdout.isTTY;

const clearConsole = () =>
  isInteractive &&
  process.stdout.write(
    process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
  );

const logErrorMessage = err => {
  console.log(err);
  const message = err != null && err.message;

  console.log(`${message || err}\n\n`);
};

module.exports = {
  clearConsole,
  logMessage,
  logErrorMessage,
  replaceExtension,
  SVGOSettings,
  fileSizeReporter,
  mkDirByPathSync,
  slugify,
  stripTags,
  escapeHTML,
  parallel,
  series,
  printInstructions,
};
