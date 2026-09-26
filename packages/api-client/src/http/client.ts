import axios, { AxiosInstance } from 'axios';
import { clearSessionId, getOrCreateSessionId } from './sessionId';

export function createApiClient(opts: {
  apiOrigin: string; // e.g. http://localhost:5000
  apiPrefix?: string; // default /api/v1
  serviceName?: string; // "player" | "admin"
}): AxiosInstance {
  const apiPrefix = opts.apiPrefix ?? '/api/v1';
  const api = axios.create({
    baseURL: `${opts.apiOrigin?.replace(/\/+$/, '')}${apiPrefix}`,
    headers: { 'Content-Type': 'application/json' },
  });

  if (opts.serviceName) {
    api.defaults.headers.common['X-Service-Name'] = opts.serviceName;
  }

  return api;
}

export function setAuthToken(api: AxiosInstance, token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const sessionId = getOrCreateSessionId();
    if (sessionId) {
      api.defaults.headers.common['x-session-id'] = sessionId;
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['x-session-id'];
    clearSessionId();
  }
}
