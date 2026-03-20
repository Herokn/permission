import { describe, it, expect } from 'vitest';
import { sanitizeUserForStorage, encodeUserForSession, decodeUserFromSession } from './userStorage';

describe('userStorage', () => {
  it('sanitizeUserForStorage keeps allowlisted fields only', () => {
    const u = sanitizeUserForStorage({
      userId: 'u1',
      userName: 'n',
      permissions: ['A'],
      extra: 'leak',
    });
    expect(u).toEqual({ userId: 'u1', userName: 'n', permissions: ['A'] });
    expect(u && 'extra' in u).toBe(false);
  });

  it('roundtrips JSON when VITE_USER_STORAGE_SECRET is unset or too short', () => {
    const payload = { userId: 'u1', userName: 'n', permissions: ['P'] };
    const enc = encodeUserForSession(payload);
    expect(enc.startsWith('pc1:')).toBe(false);
    expect(decodeUserFromSession(enc)).toEqual(payload);
  });
});
