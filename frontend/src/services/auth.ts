import api from './api'; // 👈 Importamos la instancia de axios directamente

// Tipos para los datos que enviamos
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
  totp_code?: string;
}

// Tipos exactos de lo que responde tu backend de Rails
export interface RegisterResponse {
  user: any;
  token: string;
  otp_secret: string;
}

export interface LoginResponse {
  user: any;
  token: string;
}

// Las llamadas a tu API
export const registerGuest = async (data: RegisterPayload): Promise<RegisterResponse> => {
  // Axios hace el post y nosotros extraemos el .data para devolverlo limpio
  const response = await api.post<RegisterResponse>('/register', data);
  return response.data; 
};

export const loginGuest = async (data: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/login', data);
  return response.data;
};