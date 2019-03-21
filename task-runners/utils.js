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

const escapeHTML = unsafeText => {
  return unsafeText.replace(/[^0-9A-Za-z ]/g, function (c) {
    return '&#' + c.charCodeAt(0) + ';';
  });
};
const stripTags = str => {
  return str.replace(/(<([^>]+)>)/gi, '');
};

const findDupe = arr => {
  const object = {};
  const result = [];

  arr.forEach(item => {
    if (!object[item.orderNumber]) object[item.orderNumber] = 0;
    object[item.orderNumber] += 1;
  });
  for (const prop in object) {
    if (object[prop] >= 2) {
      result.push(prop);
    }
  }
  return result;
};

module.exports = {
  mkDirByPathSync,
  slugify,
  escapeHTML,
  stripTags,
  findDupe
};
