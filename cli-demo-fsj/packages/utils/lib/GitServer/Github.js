import axios from 'axios';
import { GitServer } from './GitServer.js';


const BASE_URL = 'https://api.github.com';

class Github extends GitServer {
  constructor(){
    super();
    this.service = axios.create({
      timeout: 5000,
	    baseURL: BASE_URL
    });
    this.service.interceptors.request.use(
      config => {
      config.headers['Authorization'] = `Bearer ${this.token}`;
      config.headers['accept'] = 'application/vnd.github+json';
      return config;
    }, 
    error => {
      return Promise.reject(error);
    }
    );
    this.service.interceptors.response.use(response => {
      return response.data;
    },error => {
      return Promise.reject(error);
    })
  }
  get(url, params, headers) {
    return this.service({
      url,
      params,
      method: 'GET',
      headers
    })
  }
  searchRepositories(params) {
    return this.get('/search/repositories', params)
  }
  searchCode(params) {
    return this.get('/search/code', params)
  }
  searchTags(fullName,params) {
    return this.get(`/repos/${fullName}/tags`, params)
  }
}

export default Github;
