export default () => {
	return process.argv.includes('--debug') || process.argv.includes('-d');
};
