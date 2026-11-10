import { describe, expect, it } from 'vitest';
import { hasEntitlement, type SessionUser } from '../contexts/AuthContext';

describe('hasEntitlement', () => {
  it('detects active INSTITUTE entitlement', () => {
    const user: SessionUser = {
      role: 'organiser',
      id: '1',
      name: 'A',
      email: 'a@x.com',
      entitlements: [{ code: 'INSTITUTE', status: 'ACTIVE' }],
    };
    expect(hasEntitlement(user, 'INSTITUTE')).toBe(true);
  });

  it('hides institute for seminars-only lecturer', () => {
    const user: SessionUser = {
      role: 'organiser',
      id: '1',
      name: 'L',
      email: 'l@x.com',
      entitlements: [{ code: 'SEMINARS', status: 'ACTIVE' }],
    };
    expect(hasEntitlement(user, 'INSTITUTE')).toBe(false);
  });
});
