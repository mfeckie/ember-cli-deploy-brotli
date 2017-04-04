/*eslint-env node*/
'use strict';

var compressStream  = require('iltorb').compressStream;
var RSVP   = require('rsvp');
var path      = require('path');
var minimatch = require('minimatch');

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
      willUpload: function() {
        var self = this;

        var filePattern     = this.readConfig('filePattern');
        var ignorePattern   = this.readConfig('ignorePattern');
        var distDir         = this.readConfig('distDir');
        var distFiles       = this.readConfig('distFiles') || [];
        var keep            = this.readConfig('keep');

        this.log('Compressing with brotli `' + filePattern + '`', { verbose: true });
        this.log('ignoring `' + ignorePattern + '`', { verbose: true });
        return this._compressedFiles(distDir, distFiles, filePattern, ignorePattern, keep)
          .then(function(compressedFiles) {
            self.log('Compressed with brotli ' + compressedFiles.length + ' files ok', { verbose: true });
              return {
                distFiles: [].concat(compressedFiles), // needs to be a copy
                compressedFiles: compressedFiles
              };
          })
          .catch(this._errorMessage.bind(this));
      },
      _compressedFiles: function(distDir, distFiles, filePattern, ignorePattern, keep) {
        var filesToCompress = distFiles.filter(minimatch.filter(filePattern, { matchBase: true }));
        if (ignorePattern != null) {
            filesToCompress = filesToCompress.filter(function(path){
              return !minimatch(path, ignorePattern, { matchBase: true });
            });
        }
        return RSVP.map(filesToCompress, this._compressFile.bind(this, distDir, keep));
      },
      _compressFile: function(distDir, keep, filePath) {
        var self = this;
        var fullPath = path.join(distDir, filePath);
        var outFilePath = fullPath + '.br';
        return new RSVP.Promise(function(resolve, reject) {
          var brotliParams = {
            quality: 11
          };
          var inp = fs.createReadStream(fullPath);
          var out = fs.createWriteStream(outFilePath);

          inp.pipe(compressStream(brotliParams)).pipe(out);
          inp.on('error', function(err){
            reject(err);
          });
          out.on('error', function(err){
            reject(err);
          });
          out.on('finish', function(){
            resolve(filePath + '.br');
          });
        }).then(function(outFilePath){
          self.log('✔  ' + outFilePath, { verbose: true });

          return outFilePath;
        });
      },
      _errorMessage: function(error) {
        this.log(error, { color: 'red' });
        return RSVP.reject(error);
      }
    });
    return new DeployPlugin();
  }
};
