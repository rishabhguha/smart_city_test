import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser } from '../mocks/factories';

vi.mock('@/lib/auth', () => ({
  getDbUser: vi.fn(),
  syncUser: vi.fn(),
}));

import { getDbUser, syncUser } from '@/lib/auth';
import { GET, POST } from '@/app/api/me/route';

const mockGetDbUser = vi.mocked(getDbUser);
const mockSyncUser = vi.mocked(syncUser);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/me', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetDbUser.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns the user record for authenticated requests', async () => {
    const user = createUser({ role: 'staff' });
    mockGetDbUser.mockResolvedValue(user);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('user_test');
    expect(data.role).toBe('staff');
  });
});

describe('POST /api/me', () => {
  it('returns 401 when sync returns null (unauthenticated)', async () => {
    mockSyncUser.mockResolvedValue(null);
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it('syncs and returns the user record', async () => {
    const user = createUser({ role: 'citizen' });
    mockSyncUser.mockResolvedValue(user);
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('user_test');
  });
});
