import { AxiosInstance } from 'axios';
import { LoginResponse, MeResponse, RegisterInput } from './auth.types';

export async function login(api: AxiosInstance, email: string, password: string) {
  // POST /api/v1/auth/login
  const res = await api.post<LoginResponse>('/auth/login', { email, password });
  return res.data;
}

export async function me(api: AxiosInstance) {
  // GET /api/v1/auth/me
  const res = await api.get<MeResponse>('/auth/me');
  return res.data.payload;
}

export async function register(api: AxiosInstance, input: RegisterInput) {
  // assumes POST /api/v1/auth/register
  const res = await api.post<LoginResponse>('/auth/register', input);
  return res.data;
}

export async function fetchAuthObject(api: AxiosInstance, id: string) {
  // GET /api/v1/auth/{id}
  const res = await api.get(`/auth/${id}`);
  return res.data.payload;
}
