#! /usr/bin/env node

'use strict';

import createInitCommand from '@fengshaojian/init';
import createCLI from './createCLI.js';
import './exception.js';

export default (args) => {
	const program = createCLI();
	createInitCommand(program);
	program.parse(process.argv);
};
