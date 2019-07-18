# @texastribune/queso-ui
> Centralizing styles for product development at The Texas Tribune

This repo contains a library of styles and icons available to import via npm.

Along with the library, we set up a few tools that help document updates. CSS comments are parsed to create a JSON object of documentation. That data is rendered with nunjucks to give us a visual representation of the various components and rule-sets we're building.

Our goal is that as we iterate upon the design of our products, we document everything along the way. This keeps our **style docs current and allows for continuous optimization our CSS.**

We named it "queso" because we wanted a Texas-esque name and an easy way to refer to it internally. Also as we all know, everything is better with queso 🧀. 

## Install

```sh
yarn add @texastribune/queso-ui --dev
```
```sh
npm install @texastribune/queso-ui --save-dev
```

## Folders
| directory          | description              |
| -----------       | --------------------|
| assets/scss       | Various SASS files establishing our CSS framework |
| assets/icons      | Sets of individual SVG icons used throughout our products            |
| docs      | Tools and templates to statically render documentation, code examples, and usage info for our design system         |

## Adding to the CSS Framework

When you add a new class, component, scss variable, mixin, etc., you'll want to add a short bit of syntax to enable it to appear in the docs. Use the boilerplate below to get started.


### SCSS docs boilerplate
> How to document a new CSS class

We use a comment parser along with some [extra logic](https://github.com/texastribune/queso-ui/blob/master/tasks/style-doc.js) to generate our docs. To add a new section of documentation, add a boilerplate above your CSS rules like the one below: 

```scss
// Title of Section (root-class-name)
//
// Description {{isWide}} {{isHelper}}
//
// root-class-name-modifier - desc
//
// Markup: 6-components/test/test.html
//
// Styleguide 6.0.1
//
.root-class-name {
  
}
```
- `{{isWide}}` is used to display the demo of each modifier at full width
- `{{isHelper}}` is used to hide main demo and only display modifiers
- `// Deprecated` is used to signify a class to be removed. See _Deprecating a CSS class_ for details.


### Naming and organization

When building CSS dispersed on a variety of platforms, it can be difficult to know where certain style rules should live and what to call them. We use the following guideline to help with those decisions as we scale our framework.

#### ITCSS
We organize our SCSS files with the [inverted triangle](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/) approach in mind. We put our own spin on it by adding a `typography` and `layouts` folder, but the general idea is all the same; increased specificity as you move down the stylesheet.

#### BEM
We closely follow the BEM (Block Element Modifier) class naming convention in our `components` folder, but we break BEM rules in other places. This is a deliberate attempt to create a hybrid approach of using BEM when scoped to a component and helper classes when styling globally in a more ad hoc context.

#### Namespacing
Use namespacing for quick reference of the function of a CSS class. The following key can be used as a guideline for naming your class:

---

Components
```css
.c-component-name[__<element>|--<-modifier>] {}
```
_Example: `c-button`_

---

Typography
```css
.t-type-util {}
```
_Example: `t-headline`_

---

Layout
```css
.l-layout-util {}
```
_Example: `l-container`_

---

Utilities
```css
.[is|has]-state {}
```
_Example: `has-bg-yellow`_

---


## Using this system in our products
This system is experimental and under rapid development. Use it in situations where it makes sense for the scope of your task.

**Do** use this system when...
- Coding a new template from scratch (new landing pages)
- Creating something in a isolated environment outside of legacy systems (newsletters, new static sites, UMP)

**Don't** use this system when...
- Making a small CSS change to the legacy system (tiny visual tweak to our main repo)
- The system creates an unnecessarily layer of complexity (take the path of least resistance)


## Publishing

Make sure you're authenticated for npm publishing.

1. `npm login` - then follow the prompts
2. `npm run release` - There's a [bug](https://github.com/sindresorhus/np/issues/420#issuecomment-499273013) in the `np` publishing tool we use where `yarn` commands don't seem to work.



##  Features/Wishlist

* [x] Watch task
* [x] Pre commit linting
* [x] Fix code preview
* [x] Allow for hiding main demo
* [x] GitHub search feature (needs automation)
* [x] Cache busting hash options for assets
* [ ] File size tracker
* [ ] Component status tracker
* [ ] Accessibility compliance checking
* [ ] VS code comment snippet
* [ ] Way to easily build universal stylesheet
* [ ] Way to easily build universal sprite
* [ ] Establish a merge to master deployment flow
