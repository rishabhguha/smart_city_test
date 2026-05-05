import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createUser } from '../mocks/factories';
import { buildChain } from '../mocks/drizzle';

vi.mock('@/db', () => ({
  db: { update: vi.fn() },
}));

vi.mock('@/lib/auth', () => ({
  getDbUser: vi.fn(),
}));

import { db } from '@/db';
import { getDbUser } from '@/lib/auth';
import { PATCH } from '@/app/api/users/[id]/route';

const mockDb = vi.mocked(db);
const mockGetDbUser = vi.mocked(getDbUser);

const params = { params: Promise.resolve({ id: 'user_target' }) };

function makePatchRequest(body: unknown) {
  return new NextRequest('http://localhost/api/users/user_target', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetDbUser.mockResolvedValue(createUser({ id: 'user_admin', role: 'admin' }));
});

describe('PATCH /api/users/[id]', () => {
  it('returns 403 when the caller is not an admin', async () => {
    mockGetDbUser.mockResolvedValue(createUser({ role: 'staff' }));
    const res = await PATCH(makePatchRequest({ role: 'admin' }), params);
    expect(res.status).toBe(403);
  });

  it('returns 403 when unauthenticated', async () => {
    mockGetDbUser.mockResolvedValue(null);
    const res = await PATCH(makePatchRequest({ role: 'staff', departmentId: 'dept_1' }), params);
    expect(res.status).toBe(403);
  });

  it('returns 400 when assigning staff role without a departmentId', async () => {
    const res = await PATCH(makePatchRequest({ role: 'staff' }), params);
    expect(res.status).toBe(400);
  });

  it('successfully updates role to staff when departmentId is provided', async () => {
    const updated = createUser({ id: 'user_target', role: 'staff', departmentId: 'dept_1' });
    mockDb.update.mockReturnValue(buildChain([updated]));

    const res = await PATCH(makePatchRequest({ role: 'staff', departmentId: 'dept_1' }), params);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.role).toBe('staff');
    expect(data.departmentId).toBe('dept_1');
  });

  it('allows setting admin role without a department', async () => {
    const updated = createUser({ id: 'user_target', role: 'admin', departmentId: null });
    mockDb.update.mockReturnValue(buildChain([updated]));

    const res = await PATCH(makePatchRequest({ role: 'admin' }), params);
    expect(res.status).toBe(200);
  });

  it('returns 404 when the target user does not exist', async () => {
    mockDb.update.mockReturnValue(buildChain([]));
    const res = await PATCH(makePatchRequest({ role: 'citizen' }), params);
    expect(res.status).toBe(404);
  });
});
