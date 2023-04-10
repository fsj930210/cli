import axios from 'axios';

const service = axios.create({
	timeout: 5000,
});

function onSuccess(response) {
	return response.data;
}
function onFailed(error) {
	return Promise.reject(error);
}

service.interceptors.response.use(onSuccess, onFailed);

export default service;
