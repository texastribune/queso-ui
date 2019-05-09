# DS Toolbox

> This is just a test for a proof of concept of centralizing our design base for our sites

[This is for demo purposes only] We'll use this repo to house the base of our shared styling system. CSS comments are parsed to create a JSON object of documentation. That data is rendered with nunjucks for now to give us a visual representation of the various components and rule-sets we're building.


```sh
yarn
```

```sh
yarn start
```




## To Dos
* [x] Watch task
* [x] Pre commit linting
* [x] Fix code preview
* [x] Allow for hiding main demo
* [ ] File size tracker
* [ ] Component status tracker
* [ ] Accessibility compliance checking
* [ ] Make VS code comment snippet
* [ ] GitHub search feature
* [ ] Way to easily build universal stylesheet
* [ ] Way to easily build universal sprite
* [ ] Add cache busting hash options for assets
* [ ] Establish a merge to master deployment flow



## SCSS docs boilerplate

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