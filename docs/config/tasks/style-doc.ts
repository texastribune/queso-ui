import {
  Color,
  ColorMap,
  CSSClass,
  Modifier,
  Section,
  Sorted,
  TokenMap,
  KSSData,
  KSSModifier,
} from './types';

const fs = require('fs-extra');
const kss = require('kss');
const ora = require('ora');
const {
  passesWcagAaLargeText,
  passesWcagAa,
  passesWcagAaa,
} = require('passes-wcag');
const {
  generateName,
  generateClassName,
  generateTemplate,
  readUsageInfo,
  stripSelector,
  findUsageInfo,
  renderTemplate,
  getDetails,
  convertArrayToObject,
  buildTokenArr,
} = require('./utils');



const GITHUB_URL = 'https://github.com/texastribune/queso-ui/blob/main';

async function createModifier(config: Modifier) {
  const modifier = config;
  modifier.preview = await renderTemplate(config.template, config);
  return modifier;
}

async function createCSSClass(
  config: CSSClass,
  modifiers: KSSModifier[] | undefined
) {
  const cssClass = config;
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
          template: config.template,
        })
      )
    );
  }
  cssClass.modifiers = modifierData;
  cssClass.modifierList = modifierList;
  return cssClass;
}

function createColor(config: Color) {
  const color = config;
  color.check = {
    aa: passesWcagAa(config.value, '#fff'),
    aaLargeText: passesWcagAaLargeText(config.value, '#fff'),
    aaa: passesWcagAaa(config.value, '#fff'),
  };
  return color;
}

// create a color, color map, section or item
async function createEntry(section: KSSData) {
  const { meta, data } = section;
  const ref = data.reference[0];
  const id = Number(ref);
  const { depth } = meta;
  const { modifiers, header, source, colors, markup, parameters } = data;
  const location = `${GITHUB_URL}/${source.path}#L${source.line}`;
  const { details, description } = getDetails(data.description, header);
  const base = {
    name: header,
    description,
    location,
  };
  // colorMaps and colors
  if (colors && colors.length > 0) {
    const colorMap = colors.map((color) => {
      const { name } = color;
      return createColor({
        type: 'color',
        name,
        description: color.description,
        value: color.color,
      });
    });
    return {
      ...base,
      type: 'colorMap',
      list: colorMap,
    };
  }
  // tokenMaps and tokens
  if (parameters && parameters.length > 0) {
    const tokenMap = parameters.map((token) => {
      const tokenData = token.data;
      const { defaultValue, name } = tokenData;
      return {
        type: 'token',
        name,
        description: tokenData.description,
        value: defaultValue,
      };
    });
    return {
      ...base,
      details,
      type: 'tokenMap',
      list: tokenMap,
    };
  }
  // section
  if (meta.depth < 3) {
    return {
      ...base,
      type: 'section',
      id,
      depth,
      list: [],
    };
  }
  // cssClass
  const className = generateClassName(base.name);
  const template = await generateTemplate(markup);
  const config = {
    ...base,
    label: generateName(base.name),
    type: 'cssClass',
    id,
    depth: 2,
    className,
    details,
    template,
    preview: await renderTemplate(template, className),
  };
  return createCSSClass(config, modifiers);
}

async function sortByType(arr: (CSSClass | ColorMap | Section | TokenMap)[]) {
  const usageInfo = await readUsageInfo();
  const sections: Section[] = [];
  const cssClasses: CSSClass[] = [];
  const cssClassesSlim: CSSClass[] = [];
  const cssClassesNoHelpers: CSSClass[] = [];
  const colorMaps: ColorMap[] = [];
  const modifiers: Modifier[] = [];
  const tokenMaps: TokenMap[] = [];
  arr.forEach((entry: CSSClass | ColorMap | Section) => {
    const { type } = entry;
    switch (type) {
      case 'colorMap':
        colorMaps.push(entry as ColorMap);
        break;
      case 'tokenMap':
        tokenMaps.push(entry as TokenMap);
        break;
      case 'section':
        sections.push(entry as Section);
        break;
      case 'cssClass':
      default:
        cssClasses.push(entry as CSSClass);
        break;
    }
  });
  const sectionMap = convertArrayToObject(sections, 'id');

  // clean up css class data
  cssClasses.forEach((cssClass) => {
    const { details } = cssClass;
    // get section
    const { name } = sectionMap[cssClass.id];
    const cssClassSlim = {
      ...cssClass,
      section: name,
    };

    // append class to section
    if (sectionMap[cssClass.id]) {
      sections.forEach((section) => {
        if (section.id === cssClass.id) {
          const { className } = cssClass;
          section.list?.push({
            className,
            name: cssClass.name
          });
        }
      });
    }

    // extract modifiers separately
    if (cssClass.modifiers) {
      cssClass.modifiers.forEach((modifier: Modifier) => {
        modifiers.push(modifier as Modifier);
      });
      delete cssClassSlim.modifiers;
    }

    // previews aren't relevant in helpers (found in modifiers)
    if (details.isHelper) {
      delete cssClassSlim.preview;
    }

    //  used for full list
    if (!details.isHelper && !details.isRecipe) {
      cssClassesNoHelpers.push(cssClass);
    }

    cssClassesSlim.push(cssClassSlim as CSSClass);
  });

  const allClasses = [...cssClassesNoHelpers, ...modifiers];
  const fullList = allClasses.map((cssClass) => cssClass.className);
  const usage = fullList.map((cssClass) => findUsageInfo(usageInfo, cssClass));
  const sorted: Sorted = {
    sections,
    cssClasses: cssClassesSlim,
    colorMaps,
    modifiers: convertArrayToObject(modifiers, 'className'),
    modifierMap: modifiers,
    tokenMaps,
    fullList,
    usage: convertArrayToObject(usage, 'className'),
    tokens: buildTokenArr(tokenMaps),
    colors: buildTokenArr(colorMaps),
  };
  return sorted;
}

const processComments = async (directory: string) => {
  // use KSS library to parse comments
  const { data } = await kss.traverse(directory, { markdown: true });

  // compile KSS data as various types of entries
  const all: (Section | CSSClass | ColorMap | TokenMap)[] = await Promise.all(
    data.sections.map((section: KSSData) => createEntry(section))
  );

  // separate by type
  const sorted = await sortByType(all);

  // create json files of style data
  for (const [key, value] of Object.entries(sorted)) {
    await fs.outputFileSync(
      `./docs/dist/data/${key}.json`,
      JSON.stringify({ [key]: value }, null, 2)
    );
  }
  // directory of endpoints
  const dataKeys = Object.keys(sorted);
  const dataMap = dataKeys.map((key) => `/data/${key}.json`);
  await fs.outputFile(
    `./docs/dist/data/index.json`,
    JSON.stringify({ dataMap }, null, 2)
  );
  return sorted;
};

module.exports = async (dir: string) => {
  const spinner = ora('Parsing SCSS comments').start();
  const docs = await processComments(dir);

  spinner.succeed();
  return docs;
};
