import { describe, it, expect } from 'vitest';
import { validateRegistration } from './registration.js';

const levels = ['Beginner', 'Intermediate', 'Advanced'];
const ok = { fullName: 'Asha Kumar', email: 'asha@example.com', phone: '', experience: 'Beginner', consent: true };

describe('validateRegistration', () => {
  it('accepts a valid form', () => expect(validateRegistration(ok, levels)).toEqual({}));
  it('rejects a bad email', () => expect(validateRegistration({ ...ok, email: 'nope' }, levels).email).toBeTruthy());
  it('rejects a level that is not in the list from the API', () => expect(validateRegistration({ ...ok, experience: 'Expert' }, levels).experience).toBeTruthy());
  it('requires consent', () => expect(validateRegistration({ ...ok, consent: false }, levels).consent).toBeTruthy());
});
