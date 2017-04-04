/*eslint-env node*/
'use strict';

var RSVP = require('rsvp');
var assert  = require('./helpers/assert');
var fs  = require('fs');
var path  = require('path');
var rimraf  = RSVP.denodeify(require('rimraf'));

describe('brotli plugin', function() {
  var subject, mockUi, config;

  beforeEach(function() {
    subject = require('../index');
    mockUi = {
      verbose: true,
      messages: [],
      write: function() { },
      writeLine: function(message) {
        this.messages.push(message);
      }
    };
  });

  it('has a name', function() {
    var result = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.equal(result.name, 'test-plugin');
  });

  it('implements the correct hooks', function() {
    var result = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.equal(typeof result.configure, 'function');
    assert.equal(typeof result.willUpload, 'function');
  });
  describe('configure hook', function() {
    var plugin, context;
    describe('without providing config', function () {
      beforeEach(function() {
        config = { };
        plugin = subject.createDeployPlugin({
          name: 'brotli'
        });
        context = {
          ui: mockUi,
          config: config
        };
        plugin.beforeHook(context);
      });

      it('adds default config to the config object', function() {
        plugin.configure(context);
        assert.isDefined(config.brotli.filePattern);
        assert.isDefined(config.brotli.ignorePattern);
        assert.isDefined(config.brotli.distDir);
        assert.isDefined(config.brotli.distFiles);
      });
    });
  });
  describe('willUpload hook', function() {
    var plugin;
    var context;

    beforeEach(function () {
      plugin = subject.createDeployPlugin({
        name: 'brotli'
      });

      context = {
        distDir: 'tmp/test-dist',
        distFiles: [
          'assets/foo.js',
          'assets/notjs.notjs',
          'assets/ignore.js'
        ],
        ui: mockUi,
        project: {name: function () { return 'test-project'; } },
        config: {
          brotli: {
            filePattern: '**/*.js',
            ignorePattern: '**/ignore.*',
            distDir: function(context) { return context.distDir; },
            distFiles: function(context) { return context.distFiles; }
          }
        }
      };

      if (!fs.existsSync('tmp')) { fs.mkdirSync('tmp'); }
      if (!fs.existsSync(context.distDir)) { fs.mkdirSync(context.distDir); }
      if (!fs.existsSync(path.join(context.distDir, 'assets'))) { fs.mkdirSync(path.join(context.distDir, 'assets')); }
      fs.writeFileSync(path.join(context.distDir, context.distFiles[0]), 'alert("Hello foo world!");', 'utf8');
      fs.writeFileSync(path.join(context.distDir, context.distFiles[1]), 'alert("Hello bar world!");', 'utf8');
      fs.writeFileSync(path.join(context.distDir, context.distFiles[2]), 'alert("Hello ignore world!");', 'utf8');
      plugin.beforeHook(context);
    });

    afterEach(function(){
      return rimraf(context.distDir);
    });

    it('adds the br suffix to the distFiles', function(done) {
      plugin.willUpload(context)
        .then(function(result) {
          assert.include(result.distFiles, 'assets/foo.js.br');
          done();
        }).catch(function(reason){
          done(reason);
        });
    });
  });
});
