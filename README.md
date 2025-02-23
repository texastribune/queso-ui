# @texastribune/queso-ui
> Centralizing styles for product development at The Texas Tribune

This repo contains a library of styles and icons available to import via npm.

Along with the library, we set up a few tools that help document updates. CSS comments are parsed to create a JSON object of documentation. That data is rendered with nunjucks to give us a visual representation of the various components and rule-sets we're building.

Our goal is that as we iterate upon the design of our products, we document everything along the way. This keeps our **style docs current and allows for continuous optimization our CSS.**

We named it "queso" because we wanted a Texas-esque name and an easy way to refer to it internally. Also as we all know, everything is better with queso 🧀.



## Getting started

### 1. Add the assets as a dependency
```sh
npm install @texastribune/queso-ui --save-dev
```

### 2. Create an imports file

You'll rarely need all of the [components](https://texastribune.github.io/queso-ui/pages/components/index.html) or [layouts](https://texastribune.github.io/queso-ui/pages/layout/index.html) so just take what you need for your project and override as you please.

Example:
```scss
// styles.scss

@import '@texastribune/queso-ui/assets/scss/1-settings/all';
// Optional: Add overrides to queso SCSS variables or new variables here
// @import 'settings/all';
// @import 'settings/my-custom-vars';

@import '@texastribune/queso-ui/assets/scss/2-tools/all';
@import '@texastribune/queso-ui/assets/scss/3-resets/all';
@import '@texastribune/queso-ui/assets/scss/4-elements/all';
@import '@texastribune/queso-ui/assets/scss/5-typography/all';

// components
@import '@texastribune/queso-ui/assets/scss/6-components/icon/icon';
@import '@texastribune/queso-ui/assets/scss/6-components/navbar/navbar';
@import '@texastribune/queso-ui/assets/scss/6-components/site-footer/site-footer';

// Optional: Add overrides to queso components or new components here
// @import 'components/navbar';
// @import 'components/site-footer';
// @import 'components/my-custom-component';

// layout
@import '@texastribune/queso-ui/assets/scss/7-layout/align';
@import '@texastribune/queso-ui/assets/scss/7-layout/container';
@import '@texastribune/queso-ui/assets/scss/7-layout/content-grid';
@import '@texastribune/queso-ui/assets/scss/7-layout/display';
@import '@texastribune/queso-ui/assets/scss/7-layout/width';

// utilities
@import '@texastribune/queso-ui/assets/scss/utilities/all';

```

Note: You may need to adjust the paths on the @imports to something like `@import 'node_modules/@texastribune/queso-ui/assets/scss/1-settings/all';`


### 3. Compile SCSS into CSS

In many projects, we use [queso-tools](https://github.com/texastribune/queso-tools) to handle compiling assets.

Alternatively, [dart-sass](https://www.npmjs.com/package/sass) is a great, low-dependency compiler.

---

[Contributing to this CSS Framework](/contributing.md)

## Using a CDN link
A version of [/assets/scss/all.scss](https://github.com/texastribune/queso-ui/blob/57947f66069d9e90d01eb08f6fe1fe0218a846b6/assets/scss/all.scss) is compiled and hosted in s3 at
https://cdn.texastribune.org/css/queso.min.css

To use that, add this to your HTML:

```
<link rel="stylesheet" href="https://cdn.texastribune.org/css/queso.min.css">
```