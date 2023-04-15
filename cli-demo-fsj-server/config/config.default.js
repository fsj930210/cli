/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1681540269181_4730';
config.security = {
  csrf: {
    enable: false
  }
}
  // add your middleware config here
  config.middleware = [];
  config.mongoose = {
    url: 'mongodb://fsj:123456@127.0.0.1:27017/cli-demo-fsj'
  }

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
