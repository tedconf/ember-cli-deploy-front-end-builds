/* jshint node: true */

var CoreObject = require('core-object');
var Promise    = require('ember-cli/lib/ext/promise');
var fs         = require('fs');
var crypto     = require('crypto');
var execSync12 = require('child_process').execSync;
var execSync10 = require('sync-exec');
var _          = require('underscore');
var request    = require('request');

module.exports = CoreObject.extend({
  _plugin: null,

  init: function(options) {
    this._plugin = options.plugin;
    this.context = options.context;
  },

  readConfig: function(key) {
    return this._plugin.readConfig(key);
  },

  log: function(text) {
    return this._plugin.log(text);
  },

  gitInfo: function() {
    var sha, branch;

    if (typeof execSync12 === 'function') {
      // node 0.12.x+
      sha = execSync12('git rev-parse HEAD').toString().trim();
      branch = execSync12('git rev-parse --abbrev-ref HEAD').toString().trim();
    } else {
      // node 0.10.x
      sha = execSync10('git rev-parse HEAD').stdout.trim();
      branch = execSync10('git rev-parse --abbrev-ref HEAD').stdout.trim();
    }

    return {
      sha: sha,
      branch: branch
    };
  },

  notify: function() {
    var endpoint = this.readConfig('endpoint'),
        index = this.getIndexContent(),
        git = this.gitInfo(),
        signature = this.sign(index),
        data = {
          app_name: this.readConfig('app'),
          branch: git.branch,
          sha: git.sha,
          signature: signature,
          html: index
        },
        plugin = this;

    // notify the backend
    return new Promise(function(resolve, reject) {
      var requestOptions = _.extend({
        method: 'POST',
        uri: endpoint,
        form: data
      }, plugin.readConfig('requestOptions'));

      plugin.log('Notifying ' + endpoint + '...');

      request(requestOptions, function(error, response, body) {
        if (error) {
          plugin.log('Unable to reach endpoint ' + endpoint + ': ' + error.message, { color: 'red' });
          plugin.log(body, { color: 'red' });
          reject(error.message);
        } else {
          var code = response.statusCode;

          if (code.toString().charAt(0) === '4') {
            return reject('Rejected with code ' + code + '\n' + body);
          }

          plugin.log('Successfully deployed to front end builds server', { color: 'green' });
          resolve(body);
        }
      });
    });
  },

  sign: function(index) {
    var algo = 'RSA-SHA256',
        keyFile = this.readConfig('privateKey');

    return crypto
      .createSign(algo)
      .update(index)
      .sign(fs.readFileSync(keyFile), 'base64');
  },

  getIndexContent: function() {
    var distDir = this.context.distDir,
        index = distDir + '/index.html';

    return fs.readFileSync(index).toString();
  },
});
