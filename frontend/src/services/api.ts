import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types';

// URL Base sincronizada con el backend de Rails
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Permite estados de éxito estándar (útil para el flujo de 2FA)
  validateStatus: (status) => status >= 200 && status < 300,
});

// Interceptor de Peticiones (Request) — Inyecta el token JWT real
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

// Interceptor de Respuestas (Response) — Control de errores global (401 y 403)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const data = error.response?.data;

    // 401 — Token expirado o inválido: Limpieza de sesión y redirección
    if (status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    // 403 — Evento de Bloqueo / Prohibido: Dispara un evento personalizado global
    if (status === 403) {
      const forbiddenEvent = new CustomEvent('ft:forbidden', {
        detail: {
          url: url,
          blocked_id: data?.blocked_id ?? null,
          message: data?.error ?? 'Access forbidden',
        },
      });
      window.dispatchEvent(forbiddenEvent);
    }

    return Promise.reject(error);
  }
);

// Métodos auxiliares HTTP tipados con vuestra ApiResponse general
export const get = <T>(url: string): Promise<ApiResponse<T>> =>
  api.get<ApiResponse<T>>(url).then((res) => res.data);

export const post = <T, B = unknown>(
  url: string,
  body: B
): Promise<ApiResponse<T>> =>
  api.post<ApiResponse<T>>(url, body).then((res) => res.data);

export const put = <T, B = unknown>(
  url: string,
  body: B
): Promise<ApiResponse<T>> =>
  api.put<ApiResponse<T>>(url, body).then((res) => res.data);

export const del = <T>(url: string): Promise<ApiResponse<T>> =>
  api.delete<ApiResponse<T>>(url).then((res) => res.data);

// Hook / Oyente para capturar los eventos 403 (ej. gestión de usuarios bloqueados) en componentes
export const onForbidden = (
  handler: (detail: { url: string; blocked_id: number | null; message: string }) => void
): (() => void) => {
  const listener = (e: Event) => handler((e as CustomEvent).detail);
  window.addEventListener('ft:forbidden', listener);
  return () => window.removeEventListener('ft:forbidden', listener);
};

export default api;