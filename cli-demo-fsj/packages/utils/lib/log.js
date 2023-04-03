import log from 'npmlog';
import isDebugMode from './isDebugMode.js';

if (isDebugMode()) {
	log.level = 'verbose';
} else {
	log.info = 'info';
}

log.heading = 'cli-demo-fsj';
log.addLevel('success', 2000, { fg: 'green', bold: true });

export default log;
