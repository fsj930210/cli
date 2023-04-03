#! /usr/bin/env node

'use strict';

import path from 'node:path';
import { program } from 'commander';
import { dirname } from 'dirname-filename-esm';
import fse from 'fs-extra';
import { log, checkNodeVersion, isDebugMode } from '@fengshaojian/utils';
import createInitCommand from '@fengshaojian/init';

const __dirname = dirname(import.meta);
const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = fse.readJSONSync(pkgPath);
const LOWEST_NODE_VERSION = '14.0.0';

function preAction() {
	checkNodeVersion(LOWEST_NODE_VERSION);
}

process.on('uncaughtException', (e) => {
	if (isDebugMode()) {
		console.log(e);
	} else {
		log.error(e.message);
	}
});

export default (args) => {
	log.info('version', pkg.version);
	program
		.name(Object.keys(pkg.bin)[0])
		.usage('<command> [options]')
		.version(pkg.version)
		.option('-d, --debug', '是否开启调试模式')
		.hook('preAction', preAction);
	createInitCommand(program);

	program.parse(process.argv);
};
