const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Central fetch wrapper for Admin panel.
 * Uses HttpOnly cookie auth (`credentials: 'include'`).
 * No manual localStorage token header is needed.
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
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export { API };
