/*eslint-env node*/
'use strict';

const RSVP   = require('rsvp');
const fs        = require('fs');
const path      = require('path');
const minimatch = require('minimatch');
const zlib = require('zlib');
const denodeify = require('rsvp').denodeify;
const renameFile  = denodeify(fs.rename);

const DeployPluginBase = require('ember-cli-deploy-plugin');

module.exports = {
  name: require('./package').name,

  createDeployPlugin: function(options) {
    var fs = require('fs');

    var DeployPlugin = DeployPluginBase.extend({
      name: options.name,
      defaultConfig: {
        filePattern: '**/*.{js,css,json,ico,map,xml,txt,svg,eot,ttf,woff,woff2}',
        ignorePattern: null,
        keep: false,
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
          .then(function(brotliCompressedFiles) {
            self.log('Compressed with brotli ' + brotliCompressedFiles.length + ' files ok', { verbose: true });
            if (keep) {
              self.log('keep is enabled, added brotli-compressed files to `context.distFiles`', { verbose: true });
              return {
                distFiles: [].concat(brotliCompressedFiles), // needs to be a copy
                brotliCompressedFiles
              };
            } else {
              return { brotliCompressedFiles };
            }
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
          const brotli = zlib.createBrotliCompress({ params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 8,
          } });
          var inp = fs.createReadStream(fullPath);
          var out = fs.createWriteStream(outFilePath);

          inp.pipe(brotli).pipe(out);
          inp.on('error', function(err){
            reject(err);
          });
          out.on('error', function(err){
            reject(err);
          });
          out.on('finish', function(){
            resolve(filePath + '.br');
          });
        }).then(function(){
          if (!keep) {
            return renameFile(fullPath + '.br', fullPath).then(function () {
              return filePath;
            });
          } else {
            return filePath + '.br';
          }
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
