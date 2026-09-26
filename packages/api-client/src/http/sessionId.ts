const SESSION_STORAGE_KEY = 'tapestry.sessionId';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const sessionId =
    typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : [...crypto.getRandomValues(new Uint8Array(16))].map((byte) => byte.toString(16).padStart(2, '0')).join('');

  sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export function clearSessionId(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}
