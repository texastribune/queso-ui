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

## Structure
This repo consists of three sections:
- `/assets`: All of our SCSS and icons needed to get up a running with a new landing page or template. The assets are available as an [npm package](https://www.npmjs.com/package/@texastribune/ds-toolbox-assets).
- `/docs`: Static site files that output the data grabbed from assets
- `/tasks`: Node task runners used to compile SCSS, build SVGs, and whatever else we want JS to do for us. The tasks are available as an [npm package](https://www.npmjs.com/package/@texastribune/ds-toolbox-tasks).

## Publishing to npm
This project is split into two packages published under the `@texastribune` organization on npm. You'll an npm account and that account will need to be added our org in order to publish. Once your privileges are all set, follow these steps to add updates.

1. Create a branch and make your desired changes.
2. Commit and push those changes to your branch.
3. If you've made changes to the `/assets` folder, navigate to that folder in your terminal `cd assets`.
4. Next run `yarn publish` to step through the publishing prompt created by the [np helper package](https://www.npmjs.com/package/np).
5. Once you've published, test out your changes by updating the `@texastribune/ds-toolbox-assets` dependency in the various repos it's used in our ecosystem. (This is a very important step to ensure you didn't in advertently disrupt any styles or icons.)
6. If you've made changes to one of the JS tasks in `/tasks`, the process is exactly the same, but you'll want `/tasks` as your current directory when you run the `yarn publish` command. Also you'll also be checking that our various builds are executing as well as style/icon review.

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
