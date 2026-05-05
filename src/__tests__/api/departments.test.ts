import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createUser, createDepartment } from '../mocks/factories';
import { buildChain } from '../mocks/drizzle';

vi.mock('@/db', () => ({
  db: { select: vi.fn(), insert: vi.fn() },
}));

vi.mock('@/lib/auth', () => ({
  getDbUser: vi.fn(),
}));

import { db } from '@/db';
import { getDbUser } from '@/lib/auth';
import { GET, POST } from '@/app/api/departments/route';

const mockDb = vi.mocked(db);
const mockGetDbUser = vi.mocked(getDbUser);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetDbUser.mockResolvedValue(createUser({ role: 'admin' }));
});

describe('GET /api/departments', () => {
  it('returns all departments', async () => {
    const depts = [createDepartment(), createDepartment({ id: 'dept_2', name: 'Sanitation' })];
    mockDb.select.mockReturnValue(buildChain(depts));

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
  });
});

describe('POST /api/departments', () => {
  it('returns 403 for non-admin users', async () => {
    mockGetDbUser.mockResolvedValue(createUser({ role: 'staff' }));
    const req = new NextRequest('http://localhost/api/departments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Parks', emailAlias: 'parks@city.gov' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('returns 403 when unauthenticated', async () => {
    mockGetDbUser.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/departments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Parks', emailAlias: 'parks@city.gov' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('returns 400 when name or emailAlias are missing', async () => {
    const req = new NextRequest('http://localhost/api/departments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Parks' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('creates and returns the department for an admin', async () => {
    const newDept = createDepartment({ name: 'Parks', emailAlias: 'parks@city.gov' });
    mockDb.insert.mockReturnValue(buildChain([newDept]));

    const req = new NextRequest('http://localhost/api/departments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Parks', emailAlias: 'parks@city.gov' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe('Parks');
  });
});
