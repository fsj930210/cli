import urlJoin from 'url-join';
import request from './request.js';
import log from './log.js';

async function getNpmInfo(npmName) {
	// 淘宝镜像源 https://registry.npm.taobao.org
	const registry = 'https://registry.npmjs.org';
	const url = urlJoin(registry, npmName);
	const res = await request.get(url);
	return res;
}

export async function getLatestVersion(npmName) {
	const data = await getNpmInfo(npmName);
	if (!data['dist-tags'] || !data['dist-tags'].latest) {
		log.error('没有latest版本号');
		return Promise.reject(new Error('没有latest版本号'));
	}
	return data['dist-tags'].latest;
}
