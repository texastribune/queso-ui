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

module.exports = {
  slugify,
  stripTags,
};
