import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:6001/api/v1', // Replace with your backend URL
    withCredentials: true,
});

export const signup = (data) => API.post('/users/register', data);

export const login = (data) => API.post('/users/login', data);

export const logout = () => API.post('/users/logout');  // Usually logout doesn't need data

