const TEMPLATE_PAGE_TYPE = 'page';
const TEMPLATE_PROJECT_TYPE = 'project';
const TEMPLATE_LIST = [
	{
		name: 'vue3项目模板',
		version: '0.0.1',
		npmName: '@fengshaojian/vue-template',
	},
	{
		name: 'react18项目模板',
		version: '0.0.1',
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

function getTemplateType() {}
export default function createTemplate(name, opts) {
	// 获取创建类型，是创建项目还是页面
	const type = getTemplateType();
}
