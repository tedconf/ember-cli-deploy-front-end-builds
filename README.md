# Front end builds (Ember.JS)

If you are deploying an Ember.JS application to a front end builds
server then you should probably check out the [Front end builds
pack](https://github.com/tedconf/ember-cli-deploy-front-end-builds-pack).

## Configuration

`config/deploy.js` has the following options.

Property | Type | Required | Example | Notes
--- | --- | --- | --- | ---
`app` |  `string` | Yes | `my-blog` | The name of your application on the front end builds server.
`endpoint` | `string` | Yes | `http://www.ted.com` | The hostname where you front end builds server lives.
`privateKey` | `string` | No | `/home/me/feb.key` | The path to the private key used to sign your builds.
`requestOptions` | `object` | No | `{}` | Additional params to pass to the [request](https://github.com/request/request) object.

### Example config

```javascript
// config/deploy.js

ENV['front-end-builds'] = {
  app: 'my-blog',
  endpoint: 'http://www.ted.com',
  privateKey: process.env.FEB_DEPLOY_KEY
};
```

