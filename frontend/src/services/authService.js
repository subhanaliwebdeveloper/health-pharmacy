import { request } from './api';

export const login    = (data) => request('/auth/login',    { method: 'POST', body: JSON.stringify(data) });
export const register = (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const logout   = ()     => request('/auth/logout',   { method: 'POST' });
export const me       = ()     => request('/auth/me');
