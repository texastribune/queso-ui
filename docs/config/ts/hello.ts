const fs = require('fs-extra');
const kss = require('kss');
const {
  slugify,
  generateName,
  generateClassName,
  generateTemplate,
  readUsageInfo,
  stripSelector,
  findUsageInfo,
  renderTemplate,
} = require('../tasks/utils');
const { docsStyles, siteURL } = require('../../config/paths.js');

const {
  passesWcagAaLargeText,
  passesWcagAa,
  passesWcagAaa,
} = require('passes-wcag');

const GITHUB_URL = 'https://github.com/texastribune/queso-ui/blob/master';

interface Base {
  name: string;
  description: string;
  type: string;
  location: string;
}
interface Item extends Base {
  depth: number;
  id: number;
  className: string;
  template?: string;
  preview: string;
  label: string;
  usage?: (string | GithubDataItem)[];
  modifiers?: Modifier[];
  modifierList?: string[];
}
interface Modifier extends Base {
  className: string;
  usage?: (string | GithubDataItem)[];
  preview?: string;
  template?: string;
}
interface Color extends Base {
  value: string;
  check?: {
    aa: boolean;
    aaa: boolean;
    aaLargeText: boolean;
  };
}
interface ColorMap extends Base {
  list: Color[];
}
interface Variable extends Base {
  value: string;
}
interface Section extends Base {
  depth: number;
  slug?: string;
  id: number;
  list?: object[];
}

// Main data
interface Sorted {
  sections: Section[];
  items: Item[];
  colorMaps: ColorMap[];
  modifiers: Modifier[] | string[];
}

// Third party
interface KSSData {
  meta: {
    depth: number;
    styleGuide: {
      meta: {
        autoInit: boolean;
        files: object;
        hasNumericReferences: boolean;
        needsDepth: boolean;
        needsReferenceNumber: boolean;
        needsSort: boolean;
        referenceMap: object;
        weightMap: object;
      };
      data: object;
    };
  };
  data: {
    header: string;
    modifiers?: KSSModifier[];
    reference: string;
    description: string;
    colors?: {
      color: string;
      name: string;
      description: string;
    }[];
    source: {
      filename: string;
      path: string;
      line: number;
    };
    markup: string;
  };
}
interface KSSModifier {
  data: {
    name: string;
    description: string;
    className: string;
  };
}
interface GithubDataItem {
  repo: string;
  total_count: number;
  results: [
    {
      label: string;
      url: string;
    }
  ];
}
interface GithubData {
  lastUpdated: string;
  formattedDate: string;
  formattedTime: string;
  classData: {
    [key: string]: {
      searchDataArr: GithubDataItem[];
    };
  };
}

function createSection(config: Section) {
  const { type, name, id, depth, description, location } = config;
  return config;
}

async function createItem(
  config: Item,
  modifiers: KSSModifier[] | undefined,
  usageInfo: GithubData
) {
  let modifierData: Modifier[] = [];
  let modifierList: string[] = [];
  if (modifiers) {
    modifierList = modifiers.map((modifier) =>
      stripSelector(modifier.data.name)
    );
    modifierData = await Promise.all(
      modifiers.map((modifier: KSSModifier) =>
        createModifier({
          name: modifier.data.name,
          className: stripSelector(modifier.data.name),
          description: modifier.data.description,
          type: 'modifier',
          location: config.location,
          template: config.template,
          usage: findUsageInfo(usageInfo, modifier.data.name),
        })
      )
    );
  }
  config.usage = findUsageInfo(usageInfo, config.className);
  config.modifiers = modifierData;
  config.modifierList = modifierList;
  return config;
}

async function createModifier(config: Modifier) {
  config.preview = await renderTemplate(config.template, config);
  return config;
}

function createColor(config: Color) {
  config.check = {
    aa: passesWcagAa(config.value, '#fff'),
    aaLargeText: passesWcagAaLargeText(config.value, '#fff'),
    aaa: passesWcagAaa(config.value, '#fff'),
  };
  return config;
}

function createColorMap(config: ColorMap) {
  return config;
}

async function createAll(section: KSSData, usageInfo: GithubData) {
  const { meta, data } = section;
  const ref = data.reference[0];
  const id = Number(ref);
  const { depth } = meta;
  const { modifiers, header, description, source, colors, markup } = data;
  const location = `${GITHUB_URL}/${source.path}#L${source.line}`;
  const base = { name: header, description, location };
  if (colors && colors.length > 0) {
    // create a color map
    const colorMap = colors.map((color) => {
      const { name, description } = color;
      return createColor({
        type: 'color',
        name,
        description,
        location,
        value: color.color,
      });
    });
    return createColorMap({
      ...base,
      type: 'colorMap',
      list: colorMap,
    });
  } else if (meta.depth < 3) {
    // create a section
    return createSection({
      ...base,
      type: 'section',
      id,
      depth,
    });
  } else {
    const className = generateClassName(base.name);
    const config = {
      ...base,
      label: generateName(base.name),
      type: 'item',
      id,
      depth: 2,
      className,
      template: await generateTemplate(markup),
      preview: await renderTemplate(markup, className),
    };
    return await createItem(config, modifiers, usageInfo);
  }
}

function sortByType(arr: (Item | ColorMap | Section)[]) {
  const sections: Section[] = [];
  const items: Item[] = [];
  const itemsSlim: Item[] = [];
  const colorMaps: ColorMap[] = [];
  const modifiers: Modifier[] = [];
  arr.forEach((entry: Item | ColorMap | Section) => {
    const { type } = entry;
    switch (type) {
      case 'section':
        sections.push(entry as Section);
        break;
      case 'item':
        items.push(entry as Item);
        break;
      case 'colorMap':
        colorMaps.push(entry as ColorMap);
        break;
    }
  });
  // pull out modifiers
  items.forEach((item) => {
    if (item.modifiers) {
      // modifiers.push(item.modifiers as Modifier);
      item.modifiers.forEach((modifier: Modifier) => {
        modifiers.push(modifier as Modifier);
      });
      // modifiers.push(item as Modifier);
      const itemSlim = {
        ...item,
      };
      delete itemSlim.modifiers;
      itemsSlim.push(itemSlim as Item);
    }
  });

  const sorted: Sorted = { sections, items: itemsSlim, colorMaps, modifiers };
  return sorted;
}

const processComments = async (directory: string) => {
  const { data } = await kss.traverse(directory, { markdown: true });
  // github data from s3
  const usageInfo = await readUsageInfo();

  const all: (Section | Item | ColorMap)[] = await Promise.all(
    data.sections.map((section: KSSData) => createAll(section, usageInfo))
  );

  // separate by type
  const sorted = sortByType(all);
  await fs.outputFile(
    './docs/dist/data-sorted.json',
    JSON.stringify(sorted, null, 2)
  );
};

processComments('./assets/scss/');
