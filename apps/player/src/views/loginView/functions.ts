import type { AxiosError } from "axios";

export function isValidEmail(email: string) {
  // MVP-simple email validation. Good enough for gating submit.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getLoginErrorMessage(err: unknown): string {
  // Works with react-query + axios errors
  const ax = err as AxiosError<any>;

  // If your API returns { message: "..."} on error:
  const apiMsg =
    ax?.response?.data?.message ??
    ax?.response?.data?.error ??
    ax?.response?.data?.payload?.message;

  if (typeof apiMsg === "string" && apiMsg.trim().length > 0) return apiMsg;

  // Otherwise use status
  const status = ax?.response?.status;
  if (status === 401) return "Invalid email or password.";
  if (status === 403) return "You don’t have access to this area.";

  // Fallback
  return "Login failed. Please try again.";
}