import { describe, it, expect } from 'vitest';
import { mockRequest, mockRegister, score, EVENTS } from './mockApi.js';

describe('recommendations', () => {
  it('ranks React.js events first when React.js is selected', async () => {
    const { data } = await mockRequest('/api/events/recommendations', { interests: 'React.js' });
    expect(data[0].skills).toContain('React.js');
    expect(data[0].reasons[0]).toBe('Matches your React.js interest');
  });
  it('gives every event a reason', () => {
    EVENTS.forEach((e) => expect(score(e, ['PostgreSQL']).reasons.length).toBeGreaterThan(0));
  });
  it('rejects invalid filters', async () => {
    await expect(mockRequest('/api/events/recommendations', { format: 'hybrid' })).rejects.toThrow('invalid');
  });
  it('returns an empty list for impossible combinations', async () => {
    const r = await mockRequest('/api/events/recommendations', { technology: 'Docker', format: 'in-person' });
    expect(r.data).toEqual([]);
  });
});

describe('registration', () => {
  const ok = { fullName: 'Asha Kumar', email: 'asha@example.com', phone: '', experience: 'Beginner', consent: true };
  it('registers once and rejects a duplicate email', async () => {
    const r = await mockRegister(1, ok);
    expect(r.data.email).toBe('asha@example.com');
    await expect(mockRegister(1, ok)).rejects.toThrow('already registered');
  });
  it('rejects invalid fields', async () => {
    await expect(mockRegister(2, { ...ok, email: 'nope' })).rejects.toThrow('invalid');
  });
});
