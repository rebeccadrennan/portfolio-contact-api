'use strict';

const packageJson = require('../../package.json');

module.exports = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  appDescription: packageJson.description,
};
