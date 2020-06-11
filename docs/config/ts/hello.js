var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var fs = require('fs-extra');
var kss = require('kss');
var _a = require('../tasks/utils'), slugify = _a.slugify, generateName = _a.generateName, generateClassName = _a.generateClassName, generateTemplate = _a.generateTemplate, readUsageInfo = _a.readUsageInfo, stripSelector = _a.stripSelector, findUsageInfo = _a.findUsageInfo, renderTemplate = _a.renderTemplate;
var _b = require('../../config/paths.js'), docsStyles = _b.docsStyles, siteURL = _b.siteURL;
var _c = require('passes-wcag'), passesWcagAaLargeText = _c.passesWcagAaLargeText, passesWcagAa = _c.passesWcagAa, passesWcagAaa = _c.passesWcagAaa;
var GITHUB_URL = 'https://github.com/texastribune/queso-ui/blob/master';
function createSection(config) {
    var type = config.type, name = config.name, id = config.id, depth = config.depth, description = config.description, location = config.location;
    return config;
}
function createItem(config, modifiers, usageInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var modifierData, modifierList;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    modifierData = [];
                    modifierList = [];
                    if (!modifiers) return [3 /*break*/, 2];
                    modifierList = modifiers.map(function (modifier) {
                        return stripSelector(modifier.data.name);
                    });
                    return [4 /*yield*/, Promise.all(modifiers.map(function (modifier) {
                            return createModifier({
                                name: modifier.data.name,
                                className: stripSelector(modifier.data.name),
                                description: modifier.data.description,
                                type: 'modifier',
                                location: config.location,
                                template: config.template,
                                usage: findUsageInfo(usageInfo, modifier.data.name)
                            });
                        }))];
                case 1:
                    modifierData = _a.sent();
                    _a.label = 2;
                case 2:
                    config.usage = findUsageInfo(usageInfo, config.className);
                    config.modifiers = modifierData;
                    config.modifierList = modifierList;
                    return [2 /*return*/, config];
            }
        });
    });
}
function createModifier(config) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = config;
                    return [4 /*yield*/, renderTemplate(config.template, config)];
                case 1:
                    _a.preview = _b.sent();
                    return [2 /*return*/, config];
            }
        });
    });
}
function createColor(config) {
    config.check = {
        aa: passesWcagAa(config.value, '#fff'),
        aaLargeText: passesWcagAaLargeText(config.value, '#fff'),
        aaa: passesWcagAaa(config.value, '#fff')
    };
    return config;
}
function createColorMap(config) {
    return config;
}
function createAll(section, usageInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var meta, data, ref, id, depth, modifiers, header, description, source, colors, markup, location, base, colorMap, className, config, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    meta = section.meta, data = section.data;
                    ref = data.reference[0];
                    id = Number(ref);
                    depth = meta.depth;
                    modifiers = data.modifiers, header = data.header, description = data.description, source = data.source, colors = data.colors, markup = data.markup;
                    location = GITHUB_URL + "/" + source.path + "#L" + source.line;
                    base = { name: header, description: description, location: location };
                    if (!(colors && colors.length > 0)) return [3 /*break*/, 1];
                    colorMap = colors.map(function (color) {
                        var name = color.name, description = color.description;
                        return createColor({
                            type: 'color',
                            name: name,
                            description: description,
                            location: location,
                            value: color.color
                        });
                    });
                    return [2 /*return*/, createColorMap(__assign(__assign({}, base), { type: 'colorMap', list: colorMap }))];
                case 1:
                    if (!(meta.depth < 3)) return [3 /*break*/, 2];
                    // create a section
                    return [2 /*return*/, createSection(__assign(__assign({}, base), { type: 'section', id: id,
                            depth: depth }))];
                case 2:
                    className = generateClassName(base.name);
                    _a = [__assign({}, base)];
                    _b = { label: generateName(base.name), type: 'item', id: id, depth: 2, className: className };
                    return [4 /*yield*/, generateTemplate(markup)];
                case 3:
                    _b.template = _c.sent();
                    return [4 /*yield*/, renderTemplate(markup, className)];
                case 4:
                    config = __assign.apply(void 0, _a.concat([(_b.preview = _c.sent(), _b)]));
                    return [4 /*yield*/, createItem(config, modifiers, usageInfo)];
                case 5: return [2 /*return*/, _c.sent()];
            }
        });
    });
}
function sortByType(arr) {
    var sections = [];
    var items = [];
    var itemsSlim = [];
    var colorMaps = [];
    var modifiers = [];
    arr.forEach(function (entry) {
        var type = entry.type;
        switch (type) {
            case 'section':
                sections.push(entry);
                break;
            case 'item':
                items.push(entry);
                break;
            case 'colorMap':
                colorMaps.push(entry);
                break;
        }
    });
    // pull out modifiers
    items.forEach(function (item) {
        if (item.modifiers) {
            // modifiers.push(item.modifiers as Modifier);
            item.modifiers.forEach(function (modifier) {
                modifiers.push(modifier);
            });
            // modifiers.push(item as Modifier);
            var itemSlim = __assign({}, item);
            delete itemSlim.modifiers;
            itemsSlim.push(itemSlim);
        }
    });
    var sorted = { sections: sections, items: itemsSlim, colorMaps: colorMaps, modifiers: modifiers };
    return sorted;
}
var processComments = function (directory) { return __awaiter(_this, void 0, void 0, function () {
    var data, usageInfo, all, sorted;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, kss.traverse(directory, { markdown: true })];
            case 1:
                data = (_a.sent()).data;
                return [4 /*yield*/, readUsageInfo()];
            case 2:
                usageInfo = _a.sent();
                return [4 /*yield*/, Promise.all(data.sections.map(function (section) { return createAll(section, usageInfo); }))];
            case 3:
                all = _a.sent();
                sorted = sortByType(all);
                return [4 /*yield*/, fs.outputFile('./docs/dist/data-sorted.json', JSON.stringify(sorted, null, 2))];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
processComments('./assets/scss/');
