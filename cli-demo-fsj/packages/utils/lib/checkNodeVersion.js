import semver from 'semver';
import log from './log.js';

export default (lowestVersion) => {
	if (!semver.gte(process.version, lowestVersion)) {
		log.verbose('your node version', process.version);
		throw new Error(`cli-demo-fsj 需要安装${lowestVersion}以上版本的Node.js`);
	}
};
