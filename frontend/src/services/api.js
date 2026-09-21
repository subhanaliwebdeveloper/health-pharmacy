const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Central fetch wrapper. Sends credentials (cookie) on every request.
 * No manual token header — auth is handled by the HttpOnly cookie.
 */
export async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...(options.headers || {}) }
    : { 'Content-Type': 'application/json', ...(options.headers || {}) };

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export { API };
