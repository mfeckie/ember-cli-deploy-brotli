[![Build Status](https://travis-ci.org/mfeckie/ember-cli-deploy-brotli.svg?branch=master)](https://travis-ci.org/mfeckie/ember-cli-deploy-brotli)

# Ember-cli-deploy-brotli

This plugin is heavily influenced by https://github.com/ember-cli-deploy/ember-cli-deploy-gzip, but provides brotli compression.

## Quick Start

To get up and running quickly, do the following:

- Ensure [ember-cli-deploy-build](https://github.com/ember-cli-deploy/ember-cli-deploy-build) is installed and configured.

- Install this plugin

```bash
$ ember install ember-cli-deploy-brotli
```

- Run the pipeline

```bash
$ ember deploy
```

## Configuration

This plugin does not require any configuration, it will simply add a brotli compressed version of relevant assets (js, css, images etc.)
