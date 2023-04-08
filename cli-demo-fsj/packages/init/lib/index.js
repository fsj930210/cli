'use strict';

import Command from '@fengshaojian/command';
import { log } from '@fengshaojian/utils';
import createTemplate from './createTemplate.js';
class InitCommand extends Command {
	get command() {
		return 'init [name]';
	}
	get description() {
		return 'init a project';
	}
	get options() {
		return [['-f, --force', '是否强制更新', false]];
	}
	async action([name, opts]) {
		log.verbose('init....', name, opts);
		// 拿到模板信息
		const selectedTemplate = await createTemplate(name, opts);
		// 下载模板到缓存目录

		// 将模板拷贝到真正的项目中
	}
	preAction() {
		log.info('pre');
	}
	postAction() {
		log.info('post');
	}
}
function createInitCommand(program) {
	return new InitCommand(program);
}

export default createInitCommand;
