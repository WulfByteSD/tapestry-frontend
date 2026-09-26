import { AxiosInstance } from 'axios';
import { ForgotPasswordResponse, LoginResponse, MeResponse, RegisterInput, ResetPasswordResponse } from './auth.types';

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
  // GET /api/v1/auth/users/{id}
  const res = await api.get(`/auth/users/${id}`);
  return res.data.payload;
}

export async function forgotPassword(api: AxiosInstance, email: string) {
  // POST /api/v1/auth/forgot-password
  const res = await api.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword(api: AxiosInstance, token: string, newPassword: string) {
  // PUT /api/v1/auth/reset-password/:token
  const res = await api.put<ResetPasswordResponse>(`/auth/reset-password/${token}`, { password: newPassword });
  return res.data;
}
