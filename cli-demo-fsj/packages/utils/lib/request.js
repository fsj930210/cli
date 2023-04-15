import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:7001'
const service = axios.create({
	timeout: 5000,
	baseURL: BASE_URL
});

function onSuccess(response) {
	return response.data;
}
function onFailed(error) {
	return Promise.reject(error);
}

service.interceptors.response.use(onSuccess, onFailed);

export default service;
