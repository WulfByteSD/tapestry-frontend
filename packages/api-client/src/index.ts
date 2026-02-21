import axios, { AxiosInstance } from "axios";

export type StorageKind = "local" | "session";

export function createTokenStore(key: string, kind: StorageKind = "local") {
  const getStore = () => (kind === "local" ? window.localStorage : window.sessionStorage);

  return {
    get(): string | null {
      if (typeof window === "undefined") return null;
      return getStore().getItem(key);
    },
    set(token: string) {
      if (typeof window === "undefined") return;
      getStore().setItem(key, token);
    },
    clear() {
      if (typeof window === "undefined") return;
      getStore().removeItem(key);
    },
  };
}

export function createApiClient(opts: {
  apiOrigin: string; // e.g. http://localhost:5000
  apiPrefix?: string; // default /api/v1
  serviceName?: string; // "player" | "admin"
}): AxiosInstance {
  const apiPrefix = opts.apiPrefix ?? "/api/v1";
  const api = axios.create({
    baseURL: `${opts.apiOrigin.replace(/\/+$/, "")}${apiPrefix}`,
    headers: { "Content-Type": "application/json" },
  });

  if (opts.serviceName) {
    api.defaults.headers.common["X-Service-Name"] = opts.serviceName;
  }

  return api;
}

export function setAuthToken(api: AxiosInstance, token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// ---- Auth endpoints (matches your API exactly) ----

export type LoginResponse = {
  message: string;
  token: string;
  isEmailVerified?: boolean;
  profileRefs?: Record<string, string | null>;
};

export type MeResponse = {
  payload: {
    _id: string;
    email: string;
    fullName?: string;
    roles: string[] | string;
    acceptedPolicies?: Record<string, any>;
    notificationSettings?: Record<string, any>;
  };
};

export async function login(api: AxiosInstance, email: string, password: string) {
  // POST /api/v1/auth/login
  const res = await api.post<LoginResponse>("/auth/login", { email, password });
  return res.data;
}

export async function me(api: AxiosInstance) {
  // GET /api/v1/auth/me
  const res = await api.get<MeResponse>("/auth/me");
  return res.data.payload;
}

export function normalizeRoles(roles: string[] | string) {
  return Array.isArray(roles) ? roles : [roles];
}

export type RegisterInput = {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles?: string[];
  displayName?: string;
};

export async function register(api: AxiosInstance, input: RegisterInput) {
  // assumes POST /api/v1/auth/register
  const res = await api.post<LoginResponse>("/auth/register", input);
  return res.data;
}
