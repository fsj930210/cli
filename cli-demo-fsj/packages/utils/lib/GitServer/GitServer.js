import path from 'node:path';
import { homedir} from 'node:os'
import { pathExistsSync } from 'path-exists';
import fse from 'fs-extra';
import {execa} from 'execa'
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

function getProjectPath (cwd, fullName) {
  const projectName = fullName.split('/')[1];
  const projectPath = path.resolve(cwd, projectName);
  return projectPath;
}

function getPkg (cwd, fullName) {
  const projectPath = getProjectPath(cwd, fullName);
  const pkgPath = path.resolve(projectPath, 'package.json');
  if (pathExistsSync(pkgPath)) {
    return fse.readJSONSync(pkgPath);
  }
  return null
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
    this.platform = platform;
    log.verbose('platform path', platformPath, platform);
    fse.ensureFileSync(platformPath);
    fse.writeFileSync(platformPath, platform);
  }
  getPlatform() {
    return this.platform;
  }
  getRepoUrl(fullName) {
    return `https://${this.platform}.com/${fullName}.git`;
  }
  cloneGitRepo(fullName, tag) {
    if (tag){
      return execa('git', ['clone', this.getRepoUrl(fullName), '-b', tag])
    } else {
      return execa('git', ['clone', this.getRepoUrl(fullName)]);
    }
  }
  installDependencies(cwd, fullName) {
    const projectPath = getProjectPath(cwd, fullName)
    log.verbose('prjectPath', projectPath);
    if (pathExistsSync(projectPath)){
      return execa('npm', ['install'], { cwd: projectPath })
    }
    return null;
  }
  bootstarpProject(cwd, fullName) {
    const projectPath = getProjectPath(cwd, fullName)
    log.verbose('prjectPath', projectPath);
    const pkg = getPkg(cwd, fullName);
    if (pkg) {
      const { scripts, bin, name } = pkg;
      if (bin) {
        execa('npm', ['install' ,'-g', name], {cwd: projectPath, stdout: 'inherit'})
      }
      if (scripts && scripts.dev) {
        return execa('npm', ['run', 'dev'], { cwd: projectPath, stdout: 'inherit' })
      } else if (scripts && scripts.start) {
        return execa('npm', ['run', 'start'], { cwd: projectPath, stdout: 'inherit' })
      } else {
        log.warn('未找到启动命令')
      }
    }
  }
}

export {
  GitServer,
  getGitPlatform
} 
