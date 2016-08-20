/* jshint node: true */
'use strict';
var compress = require('brotli/compress');
var Promise   = require('ember-cli/lib/ext/promise');
var fs        = require('fs');
var path      = require('path');
var minimatch = require('minimatch');

var denodeify = require('rsvp').denodeify;
var renameFile  = denodeify(fs.rename);

var DeployPluginBase = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-brotli',

  createDeployPlugin: function(options) {
    var fs = require('fs');

    var DeployPlugin = DeployPluginBase.extend({
      name: options.name,
      defaultConfig: {
        filePattern: '**/*.{js,css,json,ico,map,xml,txt,svg,eot,ttf,woff,woff2}',
        ignorePattern: null,
        keep: true,
        distDir: function(context){
          return context.distDir;
        },
        distFiles: function(context){
          return context.distFiles;
        }
      },
      willUpload: function(context) {
        var self = this;

        var filePattern     = this.readConfig('filePattern');
        var ignorePattern   = this.readConfig('ignorePattern');
        var distDir         = this.readConfig('distDir');
        var distFiles       = this.readConfig('distFiles') || [];
        var keep            = this.readConfig('keep');

        this.log('gzipping `' + filePattern + '`', { verbose: true });
        this.log('ignoring `' + ignorePattern + '`', { verbose: true });
        return this._gzipFiles(distDir, distFiles, filePattern, ignorePattern, keep)
          .then(function(compressedFiles) {
            self.log('gzipped ' + compressedFiles.length + ' files ok', { verbose: true });
              self.log('keep is enabled, added gzipped files to `context.distFiles`', { verbose: true });
              return {
                distFiles: [].concat(compressedFiles), // needs to be a copy
                compressedFiles: compressedFiles
              };
          })
          .catch(this._errorMessage.bind(this));
      },
      _gzipFiles: function(distDir, distFiles, filePattern, ignorePattern, keep) {
        var filesToGzip = distFiles.filter(minimatch.filter(filePattern, { matchBase: true }));
        if (ignorePattern != null) {
            filesToGzip = filesToGzip.filter(function(path){
              return !minimatch(path, ignorePattern, { matchBase: true });
            });
        }
        return Promise.map(filesToGzip, this._gzipFile.bind(this, distDir, keep));
      },
      _gzipFile: function(distDir, keep, filePath) {
        var self = this;
        var fullPath = path.join(distDir, filePath);
        var outFilePath = fullPath + '.br';
        return new Promise(function(resolve, _reject) {
          var compressed = compress(fs.readFileSync(fullPath));
          fs.writeFileSync(outFilePath, compressed);
          resolve(filePath + '.br');
        }).then(function(outFilePath) {
          self.log('✔  ' + outFilePath, { verbose: true });
          return outFilePath;
        });
      },
      _errorMessage: function(error) {
        this.log(error, { color: 'red' });
        return Promise.reject(error);
      }
    });
    return new DeployPlugin();
  }
};
