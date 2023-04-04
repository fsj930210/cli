import path from 'node:path';
import { program } from 'commander';
import { dirname } from 'dirname-filename-esm';
import fse from 'fs-extra';
import { log, checkNodeVersion } from '@fengshaojian/utils';

const __dirname = dirname(import.meta);
const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = fse.readJSONSync(pkgPath);

const LOWEST_NODE_VERSION = '14.0.0';

function preAction() {
	checkNodeVersion(LOWEST_NODE_VERSION);
}

export default function createCLI() {
	log.info('version', pkg.version);
	program
		.name(Object.keys(pkg.bin)[0])
		.usage('<command> [options]')
		.version(pkg.version)
		.option('-d, --debug', '是否开启调试模式')
		.hook('preAction', preAction);
	program.on('option:debug', () => {
		if (program.opts().debug) {
			log.verbose('debug', '调试模式打开');
		}
	});
	program.on('command:*', (obj) => {
		log.error('未知的命令', obj[0]);
	});
	return program;
}
