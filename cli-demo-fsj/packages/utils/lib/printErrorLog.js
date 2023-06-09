import isDebugMode from './isDebugMode.js';
import log from './log.js';

export default function printErrorLog(e, type) {
	if (isDebugMode()) {
		log.error(type, e);
	} else {
		log.error(type, e.message);
	}
}
