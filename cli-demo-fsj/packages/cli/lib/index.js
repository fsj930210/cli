#! /usr/bin/env node

'use strict';

const command = require('commander');
const pkg = require('../package.json');
const createInitCommand = require('@fengshaojian/init');

const { program } = command;

module.exports = (args) => {
  program
  .name(Object.keys(pkg.bin)[0])
  .usage('<command> [options]')
  .version(pkg.version)
  .option('-d, --debug', '是否开启调试模式')

  createInitCommand(program);
  
  program.parse(process.argv)
}