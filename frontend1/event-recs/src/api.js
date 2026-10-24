import { mockRequest, mockRegister } from './mockApi.js';

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const USING_MOCK = !BASE;

export class ApiError extends Error {
  constructor(message, status = 0, details = []) { super(message); this.status = status; this.details = details; }
}

async function request(path, params = {}, signal) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
  if (USING_MOCK) return mockRequest(path, clean);
  let res;
  try { res = await fetch(`${BASE}${path}?${new URLSearchParams(clean)}`, { signal }); }
  catch (e) { if (e.name === 'AbortError') throw e; throw new ApiError('Cannot reach the server. Check your connection and try again.'); }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(body?.error?.message || 'Something went wrong on the server.', res.status, body?.error?.details || []);
  return body;
}

export const getFilters = (signal) => request('/api/filters', {}, signal);
export const getRecommendations = (f, signal) =>
  request('/api/events/recommendations', { ...f, interests: f.interests.join(',') }, signal);

export async function registerForEvent(eventId, payload) {
  if (USING_MOCK) return mockRegister(eventId, payload);
  let res;
  try {
    res = await fetch(`${BASE}/api/events/${eventId}/registrations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } catch { throw new ApiError('Cannot reach the server. Check your connection and try again.'); }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(body?.error?.message || 'Registration failed. Please try again.', res.status, body?.error?.details || []);
  return body;
}
