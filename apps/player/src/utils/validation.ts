/**
 * Validates if a string is a valid email address format.
 * Uses a simple regex pattern for basic email validation.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
