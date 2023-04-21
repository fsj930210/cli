'use strict';
import Command from '@fengshaojian/command';
import { log } from '@fengshaojian/utils';
import createTemplate from './createTemplate.js';
import downloadTemplate from './downloadTemplate.js';
import installTemplate from './installTemplate.js';
class InitCommand extends Command {
	get command() {
		return 'init [name]';
	}
	get description() {
		return 'init a project';
	}
	get options() {
		return [
			['-f, --force', '是否强制更新', false],
			['-t, --type <type>', '项目类型(值：project/page)'],
			['-tp, --template <template>', '模板名称'],
		];
	}
	async action([name, opts]) {
		log.verbose('init....', name, opts);
		// 拿到模板信息
		const selectedTemplate = await createTemplate(name, opts);
		log.verbose('selectedTemplate', selectedTemplate);
		// 下载模板到缓存目录
		await downloadTemplate(selectedTemplate);
		// 将模板拷贝到真正的项目中
		await installTemplate(selectedTemplate, opts);
	}
	preAction() {
		// log.info('pre');
	}
	postAction() {
		// log.info('post');
	}
}
function createInitCommand(program) {
	return new InitCommand(program);
}

export default createInitCommand;
