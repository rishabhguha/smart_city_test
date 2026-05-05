import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createUser, createCategory, createDepartment, createRequest, createStatusHistory } from '../mocks/factories';
import { buildChain } from '../mocks/drizzle';

vi.mock('@/db', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getDbUser: vi.fn(),
}));

import { db } from '@/db';
import { auth } from '@clerk/nextjs/server';
import { getDbUser } from '@/lib/auth';
import { GET, PATCH } from '@/app/api/requests/[id]/route';

const mockDb = vi.mocked(db);
const mockAuth = vi.mocked(auth);
const mockGetDbUser = vi.mocked(getDbUser);

const params = { params: Promise.resolve({ id: 'req_test' }) };

function makePatchRequest(body: unknown) {
  return new NextRequest('http://localhost/api/requests/req_test', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ userId: 'user_staff' } as never);
  mockGetDbUser.mockResolvedValue(createUser({ role: 'staff', departmentId: 'dept_test' }));
});

describe('GET /api/requests/[id]', () => {
  it('returns the request enriched with categoryName, departmentName, and history', async () => {
    const request = createRequest();
    const category = createCategory();
    const department = createDepartment();
    const history = createStatusHistory();

    mockDb.select
      .mockReturnValueOnce(buildChain([request]))
      .mockReturnValueOnce(buildChain([category]))
      .mockReturnValueOnce(buildChain([department]))
      .mockReturnValueOnce(buildChain([history]));

    const req = new NextRequest('http://localhost/api/requests/req_test');
    const res = await GET(req, params);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('req_test');
    expect(data.categoryName).toBe('Pothole');
    expect(data.departmentName).toBe('Public Works');
    expect(data.history).toHaveLength(1);
  });

  it('returns 404 when the request does not exist', async () => {
    mockDb.select.mockReturnValue(buildChain([]));
    const req = new NextRequest('http://localhost/api/requests/req_test');
    const res = await GET(req, params);
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/requests/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);
    const res = await PATCH(makePatchRequest({ status: 'in_progress' }), params);
    expect(res.status).toBe(401);
  });

  it('returns 403 when the user is a citizen', async () => {
    mockGetDbUser.mockResolvedValue(createUser({ role: 'citizen' }));
    const res = await PATCH(makePatchRequest({ status: 'in_progress' }), params);
    expect(res.status).toBe(403);
  });

  it('updates the request and creates a statusHistory entry when status changes', async () => {
    const existing = createRequest({ status: 'open' });
    const updated = createRequest({ status: 'in_progress' });

    mockDb.select.mockReturnValue(buildChain([existing]));
    mockDb.update.mockReturnValue(buildChain([updated]));
    mockDb.insert.mockReturnValue(buildChain([createStatusHistory({ newStatus: 'in_progress' })]));

    const res = await PATCH(makePatchRequest({ status: 'in_progress', note: 'On it' }), params);
    expect(res.status).toBe(200);
    expect(mockDb.insert).toHaveBeenCalledOnce();
  });

  it('does NOT create a statusHistory entry when only priority changes', async () => {
    const existing = createRequest({ status: 'open', priority: 'low' });
    const updated = createRequest({ priority: 'high' });

    mockDb.select.mockReturnValue(buildChain([existing]));
    mockDb.update.mockReturnValue(buildChain([updated]));

    const res = await PATCH(makePatchRequest({ priority: 'high' }), params);
    expect(res.status).toBe(200);
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('allows assignedTo to be set to null (unassign)', async () => {
    const existing = createRequest({ assignedTo: 'user_staff' });
    const updated = createRequest({ assignedTo: null });

    mockDb.select.mockReturnValue(buildChain([existing]));
    mockDb.update.mockReturnValue(buildChain([updated]));

    const res = await PATCH(makePatchRequest({ assignedTo: null }), params);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.assignedTo).toBeNull();
  });

  it('returns 404 when the request does not exist', async () => {
    mockDb.select.mockReturnValue(buildChain([]));
    const res = await PATCH(makePatchRequest({ status: 'in_progress' }), params);
    expect(res.status).toBe(404);
  });
});
