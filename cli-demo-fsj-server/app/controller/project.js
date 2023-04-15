'use strict';

const { Controller } = require('egg');

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
	{
		name: 'vue-element-admin项目模板',
		version: '0.0.1',
		value: 'vue-element-admin-template',
		npmName: '@fengshaojian/vue-element-admin-template',
	},
];


class ProjectController extends Controller {
  async template() {
    const { ctx } = this;
    ctx.body = TEMPLATE_LIST;
  }
}

module.exports = ProjectController;
