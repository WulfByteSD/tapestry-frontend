import type { AxiosError } from "axios";

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string) {
  // MVP: accept digits, spaces, (), -, +. Require at least 10 digits.
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 10;
}

export function getRegisterErrorMessage(err: unknown) {
  const ax = err as AxiosError<any>;
  const apiMsg = ax?.response?.data?.message ?? ax?.response?.data?.error;
  if (typeof apiMsg === "string" && apiMsg.trim()) return apiMsg;

  const status = ax?.response?.status;
  if (status === 409) return "That email is already in use.";
  if (status === 400) return "Please check your details and try again.";
  return "Registration failed. Please try again.";
}
