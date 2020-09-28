interface Base {
  name: string;
  description: string;
  type: string;
  location?: string;
}

export interface Details {
  isHelper: boolean;
  isRecipe: boolean;
  isTool: boolean;
  keywords?: string[];
}

export interface Modifier extends Base {
  className: string;
  preview?: string;
  template?: string;
}

export interface CSSClass extends Base {
  depth: number;
  id: number;
  className: string;
  details: Details;
  template?: string;
  preview: string;
  label: string;
  modifiers: Modifier[];
  modifierList?: string[];
  section?: string;
}

export interface Color extends Base {
  value: string;
  check?: {
    aa: boolean;
    aaa: boolean;
    aaLargeText: boolean;
  };
}

export interface ColorMap extends Base {
  list: Color[];
}

export interface Token extends Base {
  value: string;
}

export interface TokenMap extends Base {
  list: Token[];
  details: Details;
}

export interface Section extends Base {
  depth: number;
  slug?: string;
  id: number;
  list?: {
    className: string;
    name: string;
  }[];
}
export interface GithubDataItem {
  repo: string;
  totalCount: number;
  results: [
    {
      label: string;
      url: string;
    }
  ];
}
export interface GithubData {
  lastUpdated: string;
  formattedDate: string;
  formattedTime: string;
  classData: {
    [key: string]: {
      searchDataArr: GithubDataItem[];
    };
  };
}


// Main data
export interface Sorted {
  sections: Section[];
  cssClasses: CSSClass[];
  colorMaps: ColorMap[];
  modifiers: Modifier;
  modifierMap: Modifier[];
  tokenMaps: TokenMap[];
  usage: GithubDataItem;
  fullList: string[];
  tokens: Token[];
  colors: Color[];
}