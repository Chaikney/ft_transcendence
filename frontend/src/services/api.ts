import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'; // <-- ¡AÑADIDO EL TYPE AQUÍ!
import type { ApiResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// REQUEST interceptor — attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const get = <T>(url: string): Promise<ApiResponse<T>> =>
  api.get<ApiResponse<T>>(url).then((res) => res.data);

export const post = <T, B = unknown>(url: string, body: B): Promise<ApiResponse<T>> =>
  api.post<ApiResponse<T>>(url, body).then((res) => res.data);

export const patch = <T, B = unknown>(url: string, body: B): Promise<ApiResponse<T>> =>
  api.patch<ApiResponse<T>>(url, body).then((res) => res.data);

export default api;
