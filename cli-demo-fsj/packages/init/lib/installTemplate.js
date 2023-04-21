import path from 'node:path';
import fse from 'fs-extra';
import { pathExistsSync } from 'path-exists';
import ora from 'ora';
import ejs from 'ejs';
import {glob} from 'glob';
import { log, printErrorLog, makeInput, makeList } from '@fengshaojian/utils';

function getCacheFilePath(targetPath, template) {
	return path.resolve(targetPath, 'node_modules', template.npmName, 'template');
}
function getPluginsPath(targetPath, template) {
	return path.resolve(targetPath, 'node_modules', template.npmName, 'plugins', 'index.js');
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

async function ejsRender(targetPath,finalDir, template, name) {
	log.verbose('ejsRender', finalDir, template, name);
	const { ignore} = template
	const files =  await glob('**', {
		cwd: finalDir,
		nodir: true,
		ignore: [
			...ignore,
			"**/node_modules/**"
		]
	});
	let data = {};
	const pluginsPath = getPluginsPath(targetPath, template);
	log.verbose('pluginsPath',pluginsPath)

	if (pathExistsSync(pluginsPath)) {
		const pluginFn = (await import(pluginsPath)).default;
    const api = {
      makeList,
      makeInput,
    }
    data = await pluginFn(api);
		log.verbose('data', data)
	}
	const ejsData = {
    data: {
      name, // 项目名称
      ...data,
    }
  }
	try {
		files.forEach( file => {
			const filePath = path.join(finalDir, file);
			log.verbose('filePath', filePath);
			
			ejs.renderFile(filePath, ejsData ,( err, renderedFile) => {
				if (!err) {
					fse.writeFileSync(filePath, renderedFile);
				} else {
					printErrorLog(err);
				}
			});
			
		});
	} catch (error) {
		printErrorLog(error)
	}
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
	ejsRender(targetPath,finalDir, template, name)
}
