import { createApiClient, createTokenStore, setAuthToken } from "@tapestry/api-client";

export const tokenStore = createTokenStore("tapestry_token", "local");

export const api = createApiClient({
  apiOrigin: process.env.NEXT_PUBLIC_API_ORIGIN!,
  apiPrefix: "/api/v1",
  serviceName: "admin"
});

// On initial load, attach token if present
setAuthToken(api, tokenStore.get());