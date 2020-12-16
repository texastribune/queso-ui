## Contributing to this CSS Framework

### Previewing the docs
To preview these assets and accompanying docs locally, run the following commands:
```sh
npm install
```

```sh
npm run dev
```
Visit http://localhost:3000

This spins up a browsersync server and watch task for all SCSS and HTML files.

**Requirements**
- node >=8.11.3 (to be replaced with a docker container)


### Organization
| directory          | description              |
| -----------       | --------------------|
| assets/scss       | Various SASS files establishing our CSS framework |
| assets/icons      | Sets of individual SVG icons used throughout our products            |
| docs      | Tools and templates to statically render documentation, code examples, and usage info for our design system         |


### SCSS docs boilerplate

When you add a new class, component, scss variable, mixin, etc., you'll want to add a short bit of syntax to enable it to appear in the docs. Use the boilerplate below to get started.

> How to document a new CSS class

We use a comment parser along with some [extra logic](https://github.com/texastribune/queso-ui/blob/main/tasks/style-doc.js) to generate our docs. To add a new section of documentation, add a boilerplate above your CSS rules like the one below:

```scss
// Title of Section (root-class-name)
//
// Description {{isWide}} {{isHelper}}
//
// root-class-name-modifier - desc
//
// Markup: 6-components/test/test.html
//
// Keywords: category1, category2
//
// Styleguide 6.0.1
//
.root-class-name {
  // your styles
}
```
- `{{isWide}}` is used to display the demo of each modifier at full width
- `{{isHelper}}` is used to hide main demo and only display modifiers
- `{{isRecipe}}` is used to document standard design element that doesn't need any extra CSS. This signifies that it's a section of the docs that's used as a handy recipe of helper classes that accomplish a commonly used look.
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

### Publishing

Make sure you're authenticated for npm publishing.

1. `npm login` - then follow the prompts
2. `npm run release` - Then use semantic versioning to release your change.

#### Semantic versioning
The npm helper we use for versioning simplifies matching version numbers with the various `MAJOR`, `MINOR`, `PATCH` increment types. For guidance on what type of release you're making, refer to [https://semver.org/](https://semver.org/)

Generally, you could base your increment type on the following list:

- MAJOR version = CSS changes that visually break layouts where `queso-ui` is used on production
- MINOR version = CSS changes that have subtle or no visual effects on production
- PATCH version = CSS changes that fix a previous bug introduced on production or in development

#### Steps to test breaking changes:

## Using this system in our products
This system is experimental and under rapid development. Use it in situations where it makes sense for the scope of your task.

**Do** use this system when...
- Coding a new template from scratch (new landing pages)
- Creating something in a isolated environment outside of legacy systems (newsletters, new static sites, UMP)

**Don't** use this system when...
- Making a small CSS change to the legacy system (tiny visual tweak to our main repo)
- The system creates an unnecessarily layer of complexity (take the path of least resistance)



1. Publish these changes on npm: `npm run release`. Copy the version number.
2. Create a new branch in the repo in question.
3. `npm install @texastribune/queso-ui@VERSION`
4. Compile the CSS
5. Scan the various places where queso-ui is used. At the time of writing, that's most of texastribune.org.

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
* [x] Establish a merge to main deployment flow