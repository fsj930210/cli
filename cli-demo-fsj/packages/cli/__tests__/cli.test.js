'use strict';

// jest 是以commonjs运行的 所以需要babel来转换

import path from 'node:path';
import { execa } from 'execa';

const CLI = path.join(__dirname, '../bin/cli.js');
const bin =
	() =>
	(...args) =>
		execa(CLI, args);

// 测试错误命令
test('run error command', async () => {
	const { stderr } = await bin()('iii');
	expect(stderr).toContain('未知的命令 iii');
});

// 测试help命令不报错
test('should not throw error, when use --help', async () => {
	let err = null;
	try {
		await bin()('--help');
	} catch (e) {
		err = e;
	}
	expect(err).toBe(null);
});

// 测试version正确显示
test('show crroect version', async () => {
	const { stdout } = await bin()('-V');
	expect(stdout).toContain(require('../package.json').version);
});

// 测试是否正确开启debug模式
test('open debug mode', async () => {
	let err = null;
	try {
		await bin()('--debug');
	} catch (e) {
		err = e;
	}
	expect(err.message).toContain('调试模式打开');
});
