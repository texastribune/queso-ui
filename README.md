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
* [ ] Actions/Versioning and Deploy visual output to URL[https://medium.com/devopslinks/automate-your-npm-publish-with-github-actions-dfe8059645dd] rules
* [x] Pre commit linting
* [ ] File size tracker
* [ ] Component status tracker
* [ ] Accessibility compliance checking
* [ ] Make VS code comment snippet
* [x] Fix code preview
* [ ] GitHub search feature
* [ ] Way to easily build universal stylesheet
* [ ] Way to easily build universal sprite
* [ ] Allow for hiding main demo



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