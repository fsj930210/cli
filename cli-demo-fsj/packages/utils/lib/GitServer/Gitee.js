import axios from 'axios';
import { GitServer } from './GitServer.js';


const BASE_URL = 'https://gitee.com/api/v5';

class Gitee extends GitServer {
  constructor(){
    super();
    this.service = axios.create({
      timeout: 5000,
	    baseURL: BASE_URL
    });
    this.service.interceptors.response.use(response => {
      return response.data;
    },error => {
      return Promise.reject(error);
    })
  }
  get(url, params, headers) {
    return this.service({
      url,
      params: {
        ...params,
        // access_token: this.token
      },
      method: 'GET',
      headers
    })
  }
  searchRepositories(params) {
    return this.get('/search/repositories', params)
  }
  searchTags(fullName, params) {
    return this.get(`/repos/${fullName}/tags`, params)
  }
}

export default Gitee;
