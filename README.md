# DS Toolbox

> Centralizing styles for product development at The Texas Tribune

We use this design system toolbox to establish a base for our shared styling system. CSS comments are parsed to create a JSON object of documentation. That data is rendered with nunjucks for now to give us a visual representation of the various components and rule-sets we're building. 

The spirit of the project is that _iterating is documenting_ so that our **docs remain current and our CSS optimized.**


## Getting started

Install dependencies
```sh
yarn
```

Spin up docs preview (to see what you're styling)
```sh
yarn dev-docs
```


## SCSS docs boilerplate
> How to document a new CSS class

We use a comment parser along with some [extra logic](https://github.com/texastribune/ds-toolbox/blob/master/tasks/style-doc.js) to generate our docs. To add a new section of documentation, add a boilerplate above your CSS rules like the one below: 

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

## Naming and organization

### ITCSS
We organize our SCSS files with the [inverted triangle](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/) approach in mind. We put our own spin on it by adding a `typography` and `layouts` folder, but the general idea is all the same; increased specificity as you move down the stylesheet.

### BEM
We closely follow the BEM (Block Element Modifier) class naming convention in our `components` folder, but we break BEM rules in other places. This is a deliberate attempt to create a hybrid approach of using BEM when scoped to a component and helper classes when styling globally in a more ad hoc context.

### Namespacing
Use namespacing for quick reference of the function of a CSS class. The following key can be used a guideline for naming your class:

Components
```css
.c-component-name[__<element>|--<-modifier>] {}
```
_Example: `c-button`_

Typography
```css
.t-type-util {}
```
_Example: `t-headline`_

Layout
```css
.l-layout-util {}
```
_Example: `l-container`_

Utilities
```css
.[is|has]-state {}
```
_Example: `has-bg-yellow`_


## Legacy styles

This toolbox is a living system and we use it to keep a vigilant eye on how we're using CSS throughout our various products. As an outcome, there are times we will need to deprecate naming conventions, class names, and approaches within our system.

### Deprecating a CSS class

We denote any class not to be used moving forward in our commenting boilerplate with the following syntax:
```scss
// Title of Section (root-class-name)
//
// Deprecated: Description of old usage and why it's being removed
//
// ...
```
As we phase out classes, we must be mindful of where those classes are relied upon in our various repos and ultimately our public-facing products. 

**Steps for removing a class:**
1. Add the deprecation notice to the comment. `// Deprecated: This class was used for x, but were phasing it out for y because...`

2. Note where the classes appear according to the docs. (You should see a repo name and count signifying potential HTML usages in the docs interface.)

3. Push your changes to a branch in this repo.

4. Go to the repo(s) where the class was used.

5. In your dev environment, run `yarn add https://github.com/<REPO>/ds-toolbox.git#your-new-branch` to import your toolbox changes.

6. Run the correct `yarn build` or whatever task compiles the CSS.

7. Preview the page using the HTML with the classes you altered. Does it break a style? Does it reference a class no longer attached to any CSS? Update the HTML accordingly.

8. Once everything is looking stable, merge your branch in this repo with master.

9. In the repos where you've made HTML edits, yarn add the toolbox again, this time with `yarn add https://github.com/<REPO>/ds-toolbox.git#master`.

10. Compile the new CSS and perform one last round of all your visual checks and follow the PR procedure for that repo.


## Using this system in our products
This system is experimental and under rapid development. Use it in situations where it makes sense for the scope of your task.

**Do** use this system when...
- Coding a new template from scratch (new landing pages)
- Creating something in a isolated environment outside of legacy systems (newsletters, new static sites, UMP)

**Don't** use this system when...
- Making a small CSS change to the legacy system (tiny visual tweak to our main repo)
- The system creates an unnecessarily layer of complexity (take the path of least resistance)


 Add feature requests to this wishlist/todo list.

* [x] Watch task
* [x] Pre commit linting
* [x] Fix code preview
* [x] Allow for hiding main demo
* [x] GitHub search feature
* [x] Cache busting hash options for assets
* [ ] File size tracker
* [ ] Component status tracker
* [ ] Accessibility compliance checking
* [ ] VS code comment snippet
* [ ] Way to easily build universal stylesheet
* [ ] Way to easily build universal sprite
* [ ] Establish a merge to master deployment flow
