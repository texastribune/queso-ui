import {
  KssSection,
  KssModifier,
  KssParameter,
} from 'kss';

import {
  Color,
  ColorMap,
  CSSClass,
  Modifier,
  Section,
  Sorted,
  TokenMap,
  // eslint-disable-next-line import/extensions
} from './types';

import {
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
} from './utils';

const fs = require('fs-extra');
const kss = require('kss');
const ora = require('ora');
const {
  passesWcagAaLargeText,
  passesWcagAa,
  passesWcagAaa,
} = require('passes-wcag');


const GITHUB_URL = 'https://github.com/texastribune/queso-ui/blob/main';

async function createModifier(config: Modifier) {
  const modifier = config;
  modifier.preview = await renderTemplate(config.template, config);
  return modifier;
}

async function createCSSClass(
  config: CSSClass,
  modifiers: KssModifier[]
) {
  const cssClass = config;
  let modifierData: Modifier[] = [];
  let modifierList: string[] = [];
  if (modifiers) {
    modifierList = modifiers.map((modifier) =>
      stripSelector(modifier.name())
    );
    modifierData = await Promise.all(
      modifiers.map((modifier: KssModifier) =>
        createModifier({
          name: modifier.name(),
          className: stripSelector(modifier.name()),
          description: modifier.description(),
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
async function createEntry(section: KssSection) {
  const { header, source, markup, depth, reference, colors } = section.toJSON();
  const id = Number(reference[0]);
  const location = `${GITHUB_URL}/${source.path}#L${source.line}`;
  const { details, description } = getDetails(section.description(), header);
  const base = {
    name: header,
    description,
    location,
  };
  // colorMaps and colors
  if (colors && colors.length > 0) {
    const colorMap = colors.map((color: { color: string; name: string; description: string; }) => {
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
  const parameters = section.parameters();
  if (parameters && parameters.length > 0) {
    const tokenMap = parameters.map((token: KssParameter) => {
      return {
        type: 'token',
        name: token.name(),
        description: token.description(),
        value: token.defaultValue(),
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
  if (depth < 3) {
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
    modifiers: [],
    modifierList: [],
    preview: await renderTemplate(template, className),
  };
  return createCSSClass(config, section.modifiers());
}

async function sortByType(arr: (CSSClass | ColorMap | Section | TokenMap)[]) {
  const usageInfo = await readUsageInfo();
  const sections: Section[] = [];
  const cssClasses: CSSClass[] = [];
  const colorMaps: ColorMap[] = [];
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
  const classesWithModifiers = cssClasses.map(cssClass => cssClass).filter(cssClass => cssClass.modifiers.length > 0);
  const modifiers = classesWithModifiers.map(cssClass => cssClass.modifiers).flat();

  // add classes to sections
  cssClasses.forEach((cssClass) => {
    if (sectionMap[cssClass.id]) {
      sections.forEach((section) => {
        if (section.id === cssClass.id) {
          const { className } = cssClass;
          if (section.list) {
            section.list.push({
            className,
            name: cssClass.name
          });
          }
        }
      });
    }
  });


  const cssClassesSlim = cssClasses.map(cssClass => {
    const current = cssClass
    if (current.details.isHelper) {
      delete current.preview;
    }
    delete current.modifiers;
    return {
      ...current,
      section: sectionMap[current.id].name,
    }
  })
  const cssClassesNoHelpers = cssClasses.map(cssClass => cssClass).filter(cssClass => !cssClass.details.isHelper && !cssClass.details.isRecipe)
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
    data.sections.map((section: KssSection) => createEntry(section))
  );
  // separate by type
  const sorted = await sortByType(all);

  // create json files of style data
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(sorted)) {
    fs.outputFileSync(
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
