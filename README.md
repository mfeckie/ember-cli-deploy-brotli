[![Build Status](https://travis-ci.org/mfeckie/ember-cli-deploy-brotli.svg?branch=master)](https://travis-ci.org/mfeckie/ember-cli-deploy-brotli)

ember-cli-deploy-brotli
==============================================================================

This plugin is heavily influenced by https://github.com/ember-cli-deploy/ember-cli-deploy-gzip, but provides brotli compression.

Compatibility
------------------------------------------------------------------------------

* Ember CLI v2.13 or above
* Node.js v10 or above

Usage
------------------------------------------------------------------------------

## What is an ember-cli-deploy plugin?

A plugin is an addon that can be executed as a part of the ember-cli-deploy pipeline. A plugin will implement one or more of the ember-cli-deploy's pipeline hooks.

## Quick Start

To get up and running quickly, do the following:

- Ensure [ember-cli-deploy](https://github.com/ember-cli-deploy/ember-cli-deploy) is installed and configured.

- Ensure [ember-cli-deploy-build](https://github.com/ember-cli-deploy/ember-cli-deploy-build) is installed and configured.

- Install this plugin

```bash
$ ember install ember-cli-deploy-brotli
```

- Run the pipeline

```bash
$ ember deploy
```


Run the following command in your terminal:

```bash
ember install ember-cli-deploy-brotli
```

## ember-cli-deploy Hooks Implemented

For detailed information on what plugin hooks are and how they work, please refer to the [Plugin Documentation][1].

- `configure`
- `willUpload`

## Configuration Options

For detailed information on how configuration of plugins works, please refer to the [Plugin Documentation][1].

### filePattern

Files matching this pattern will be compressed.
Note: image files such as `.png`, `.jpg` and `.gif` should not be compressed, as they already are compressed.

*Default:* `'**/*.{js,css,json,ico,map,xml,txt,svg,eot,ttf,woff,woff2}'`

### ignorePattern

Files matching this pattern will *not* be compressed even if they match filePattern

*Default:* null

### distDir

The root directory where the files matching `filePattern` will be searched for. By default, this option will use the `distDir` property of the deployment context, provided by [ember-cli-deploy-build][2].

*Default:* `context.distDir`

### distFiles

The list of built project files. This option should be relative to `distDir` and should include the files that match `filePattern`. By default, this option will use the `distFiles` property of the deployment context, provided by [ember-cli-deploy-build][2].

*Default:* `context.distDir`

### keep

Keep original file and write compressed data to `originalFile.br`

*Default:* `false`

### compressionQuality

Set the user specified compression quality level for Brotli.

*Default:* `11`

## Prequisites

The following properties are expected to be present on the deployment `context` object:

- `distDir`      (provided by [ember-cli-deploy-build][2])
- `distFiles`    (provided by [ember-cli-deploy-build][2])

## Plugins known to work well with this one

[ember-cli-deploy-build][2]
[ember-cli-deploy-s3][3]

Contributing
------------------------------------------------------------------------------
See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------
This project is licensed under the [MIT License](LICENSE.md).
