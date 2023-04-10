import path from 'node:path';
import { homedir } from 'node:os';
import { makeList, log, makeInput, getLatestVersion } from '@fengshaojian/utils';

const TEMPLATE_PAGE_TYPE = 'page';
const TEMPLATE_PROJECT_TYPE = 'project';
const TEMPLATE_LIST = [
	{
		name: 'vue3项目模板',
		version: '0.0.1',
		value: 'vue-template',
		npmName: '@fengshaojian/vue-template',
	},
	{
		name: 'react18项目模板',
		version: '0.0.1',
		value: 'react-template',
		npmName: '@fengshaojian/react-template',
	},
];

const TEMPLATE_TYPE = [
	{
		name: '项目',
		value: TEMPLATE_PROJECT_TYPE,
	},
	{
		name: '页面',
		value: TEMPLATE_PAGE_TYPE,
	},
];

const TEMP_HOME = '.cli-demo-fsj';

function getTemplateType() {
	return makeList({
		message: '请选择模板类型',
		choices: TEMPLATE_TYPE,
		defaultValue: TEMPLATE_PROJECT_TYPE,
	});
}

function getName() {
	return makeInput({
		message: '请输入项目名称',
		defaultValue: '',
		validate(v) {
			if (v.length > 0) {
				return true;
			}
			return '项目名称必须输入';
		},
	});
}

function getTemplate() {
	return makeList({
		choices: TEMPLATE_LIST,
		message: '请选择项目模板',
	});
}

function makeTargetPath() {
	return path.resolve(`${homedir()}/${TEMP_HOME}`, 'addTemplate');
}
export default async function createTemplate(name, opts) {
	const { type = null, template = null } = opts;

	let addType; // 创建项目类型
	let addName; // 项目名称
	let selectedTemplate; // 项目模板

	if (type) {
		addType = type;
	} else {
		addType = await getTemplateType();
	}
	log.verbose('选择的项目是', addType);

	if (addType === TEMPLATE_PROJECT_TYPE) {
		if (name) {
			addName = name;
		} else {
			addName = await getName();
		}
		log.verbose('项目名称是', addName);
		if (template) {
			selectedTemplate = TEMPLATE_LIST.find((tp) => tp.value === template);
			if (!selectedTemplate) {
				throw new Error(`项目模板 ${template} 不存在！`);
			}
		} else {
			const tp = await getTemplate();
			selectedTemplate = TEMPLATE_LIST.find((_) => _.value === tp);
		}
		log.verbose('选择的项目模板是', selectedTemplate);
		// 获取最新版本号
		const latestVersion = await getLatestVersion(selectedTemplate.npmName);
		log.verbose('latestVersion', latestVersion);
		selectedTemplate.version = latestVersion;
		const targetPath = makeTargetPath();
		return {
			type: addType,
			name: addName,
			template: selectedTemplate,
			targetPath,
		};
	} else {
		throw new Error('占不支持该类型');
	}
}
