/* jshint node: true */
'use strict';

var BasePlugin = require('ember-cli-deploy-plugin');
var passwdUser = require('passwd-user');

var FrontEndBuildsNotifier = require('./lib/front-end-builds-notifier');


module.exports = {
  name: 'ember-cli-deploy-front-end-builds',

  createDeployPlugin: function(options) {
    var homedir = passwdUser.sync(process.getuid()).homedir;

    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        privateKey: homedir + '/.ssh/id_rsa',
        requestOptions: {}
      },

      requiredConfig: [
        'app',
        'endpoint'
      ],

      didUpload: function(context) {
        var notifier = new FrontEndBuildsNotifier({
          plugin: this,
          context: context
        });

        return notifier.notify();
      }
    });

    return new DeployPlugin();
  }
};
