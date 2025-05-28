import axios from 'axios';
import server from '../environment';

const API = axios.create({
    baseURL: `${server}/api/v1`,
    withCredentials: true,
});

export const signup = (data) => API.post('/users/register', data);

export const login = (data) => API.post('/users/login', data);

export const logout = () => API.post('/users/logout');  // Usually logout doesn't need data

