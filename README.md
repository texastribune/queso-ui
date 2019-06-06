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

## Tools
This repo consists of three sections:
- `/assets`: All of our SCSS and icons needed to get up a running with a new landing page or template. The assets are available as an [npm package](https://www.npmjs.com/package/@texastribune/ds-toolbox-assets).
- `/docs`: Static site files that output the data grabbed from assets
- `/tasks`: Node task runners used to compile SCSS, build SVGs, and whatever else we want JS to do for us. The tasks are available as an [npm package](https://www.npmjs.com/package/@texastribune/ds-toolbox-tasks).


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
