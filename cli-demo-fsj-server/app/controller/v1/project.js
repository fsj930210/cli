'use strict';

const { Controller } = require('egg');


class ProjectController extends Controller {
  // 查询项目模板
  async index() {
    const { ctx } = this;
    const res = await ctx.model.Project.find({});
    ctx.body = res;
  }
  // 查询某一个项目模板
  async show() {
    const { ctx } = this;
    const {id} = ctx.params;
    const tp = await ctx.model.Project.find({  value: id});
    if (tp.length > 0) {
      ctx.body = tp
    } else {
      ctx.body = null
    }
  }

  // 新增一个项目模板
  async create() {
    const { ctx } = this;
    const data = ctx.request.body;
    console.log(data);
    ctx.body = 'create'
  }

  // 更新某一个模板
  async update() {
    const { ctx } = this;
    const {id} = ctx.params; 
    console.log(id)
    ctx.body = 'update';
  }

  // 删除某一个模板
  async destory () {
    const { ctx } = this;
    const {id} = ctx.params; 
    console.log(id)
    ctx.body = 'destory';
  }
}

module.exports = ProjectController;
