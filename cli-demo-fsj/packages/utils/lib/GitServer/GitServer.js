import path from 'node:path';
import { homedir} from 'node:os'
import { pathExistsSync } from 'path-exists';
import fse from 'fs-extra';
import { makePassword, log } from '../index.js'

const TEMP_HOME = '.cli-demo-fsj';
const TEMP_TOKEN = '.token';
const TEMP_GIT_PLATFORM = '.git_platform';

function getTokenPath () {
  return path.resolve(`${homedir()}/${TEMP_HOME}`, TEMP_TOKEN);
}

function getGitPlatformPath () {
  return path.resolve(`${homedir()}/${TEMP_HOME}`, TEMP_GIT_PLATFORM);
}

function getGitPlatform () {
  const platformPath = getGitPlatformPath()
  if (pathExistsSync(platformPath)) {
    return fse.readFileSync(platformPath).toString()
  }
  return null;
}
class GitServer {
  constructor() {
  }
  async init () {
    const tokenPath = getTokenPath();
    log.verbose('token path', tokenPath);
    if (pathExistsSync(tokenPath)) {
      const token = fse.readFileSync(tokenPath).toString();
      log.verbose('token', token);
      this.token = token;
    } else {
      this.token = await this.getToken();
      log.verbose('token', this.token);
      
      fse.writeFileSync(tokenPath, this.token);
    }
  }
  getToken() {
    return makePassword({
      message: '请输入token'
    }).then(ans => {
      log.verbose('token', ans);
      return ans;
    })
  }
  savePlatform (platform) {
    const platformPath = getGitPlatformPath();
    log.verbose('platform path', platformPath, platform);
    fse.ensureFileSync(platformPath);
    fse.writeFileSync(platformPath, platform);
  }
  getPlatform() {
    return this.platform;
  }
}

export {
  GitServer,
  getGitPlatform
} 
