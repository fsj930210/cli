'use strict';

import log from './log.js';
import isDebugMode from './isDebugMode.js';
import checkNodeVersion from './checkNodeVersion.js';
import { makeInput, makeList, makePassword } from './inquirer.js';
import { getLatestVersion } from './npm.js';
import request from './request.js'
import printErrorLog from './printErrorLog.js';
import Github from './GitServer/Github.js';
import Gitee from './GitServer/Gitee.js';
import {getGitPlatform} from './GitServer/GitServer.js'
export { 
  log, 
  checkNodeVersion,
  isDebugMode, 
  makeInput, 
  makeList,
  makePassword,
  getLatestVersion,
  printErrorLog,
  getGitPlatform,
  Github,
  Gitee,
  request
};
