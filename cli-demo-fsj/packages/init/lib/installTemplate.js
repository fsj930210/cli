import path from 'node:path';
import fse from 'fs-extra';
import { pathExistsSync } from 'path-exists';
import ora from 'ora';
import { log } from '@fengshaojian/utils';

function getCacheFilePath(targetPath, template) {
	return path.resolve(targetPath, 'node_modules', template.npmName, 'template');
}

function copyFile(targetPath, template, targetDir) {
	const originFile = getCacheFilePath(targetPath, template);
	const fileList = fse.readdirSync(originFile);
	const spinner = ora('正在拷贝模板文件...').start();
	fileList.map((file) => {
		fse.copySync(`${originFile}/${file}`, `${targetDir}/${file}`);
	});
	spinner.stop();
	log.success('模板拷贝成功');
}

export default async function installTemplate(selectedTemplate, opts) {
	const { force } = opts;
	const { targetPath, name, template } = selectedTemplate;
	const rootDir = process.cwd();
	fse.ensureDirSync(targetPath);
	const finalDir = path.resolve(`${rootDir}/${name}`);
	if (pathExistsSync(finalDir)) {
		if (!force) {
			log.error(`当前目录下已存在 ${finalDir} 文件夹`);
			return;
		} else {
			fse.removeSync(finalDir);
			fse.ensureDirSync(finalDir);
		}
	} else {
		fse.ensureDirSync(finalDir);
	}
	copyFile(targetPath, template, finalDir);
}
