# How To Contribute

## Installation

* `git clone <repository-url>`
* `cd ember-cli-deploy-brotli`
* `yarn install`

## Linting

* `yarn lint:js`
* `yarn lint:js --fix`

## Running tests

* `yarn test`

### Why `ember build` and `ember test` don't work

Since this is a node-only ember-cli addon, this package does not include many files and dependencies which are part of ember-cli's typical `ember build` and `ember test` processes.

[1]: http://ember-cli-deploy.github.io/ember-cli-deploy/plugins/ "Plugin Documentation"
[2]: https://github.com/zapnito/ember-cli-deploy-build "ember-cli-deploy-build"
[3]: https://github.com/zapnito/ember-cli-deploy-s3 "ember-cli-deploy-s3"
