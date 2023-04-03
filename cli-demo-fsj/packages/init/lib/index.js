'use strict';

import Command from '@fengshaojian/command';

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
	action([name, opts]) {
		console.log('init....', name, opts);
	}
	preAction() {
		console.log('pre');
	}
	postAction() {
		console.log('post');
	}
}
function createInitCommand(program) {
	return new InitCommand(program);
}

export default createInitCommand;
