import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createCategory, createRequest, createStatusHistory } from '../mocks/factories';
import { buildChain } from '../mocks/drizzle';

vi.mock('@/db', () => ({
  db: { select: vi.fn(), insert: vi.fn() },
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

import { db } from '@/db';
import { auth } from '@clerk/nextjs/server';
import { POST, GET } from '@/app/api/requests/route';

const mockDb = vi.mocked(db);
const mockAuth = vi.mocked(auth);

function makeRequest(body: unknown, method = 'POST') {
  return new NextRequest('http://localhost/api/requests', {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ userId: null } as never);
});

describe('POST /api/requests', () => {
  const validBody = {
    citizenName: 'Jane Doe',
    categoryId: 'cat_test',
    title: 'Pothole on Main St',
    description: 'About 6 inches deep',
    address: '123 Main St',
    lat: '40.71',
    lng: '-74.00',
  };

  it('creates a request and statusHistory entry for a valid payload', async () => {
    const category = createCategory();
    const newRequest = createRequest();
    const history = createStatusHistory();

    mockDb.select.mockReturnValue(buildChain([category]));
    mockDb.insert
      .mockReturnValueOnce(buildChain([newRequest]))
      .mockReturnValueOnce(buildChain([history]));

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe('req_test');
  });

  it('auto-assigns departmentId from the category, not from the request body', async () => {
    const category = createCategory({ departmentId: 'dept_works' });
    const newRequest = createRequest({ departmentId: 'dept_works' });

    mockDb.select.mockReturnValue(buildChain([category]));
    mockDb.insert
      .mockReturnValueOnce(buildChain([newRequest]))
      .mockReturnValueOnce(buildChain([createStatusHistory()]));

    await POST(makeRequest(validBody));

    // The insert chain's .values() should have been called with dept from category
    const insertChain = mockDb.insert.mock.results[0].value;
    const insertedValues = insertChain.values.mock.calls[0][0];
    expect(insertedValues.departmentId).toBe('dept_works');
  });

  it('sets citizenId from auth when user is signed in', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' } as never);
    const category = createCategory();
    mockDb.select.mockReturnValue(buildChain([category]));
    mockDb.insert
      .mockReturnValueOnce(buildChain([createRequest()]))
      .mockReturnValueOnce(buildChain([createStatusHistory()]));

    await POST(makeRequest(validBody));

    const insertChain = mockDb.insert.mock.results[0].value;
    const insertedValues = insertChain.values.mock.calls[0][0];
    expect(insertedValues.citizenId).toBe('user_123');
  });

  it('sets citizenId to null for guest submissions', async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);
    const category = createCategory();
    mockDb.select.mockReturnValue(buildChain([category]));
    mockDb.insert
      .mockReturnValueOnce(buildChain([createRequest()]))
      .mockReturnValueOnce(buildChain([createStatusHistory()]));

    await POST(makeRequest(validBody));

    const insertChain = mockDb.insert.mock.results[0].value;
    expect(insertChain.values.mock.calls[0][0].citizenId).toBeNull();
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ citizenName: 'Jane' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when categoryId does not exist', async () => {
    mockDb.select.mockReturnValue(buildChain([])); // no category found
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(400);
  });
});

describe('GET /api/requests', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);
    const req = new NextRequest('http://localhost/api/requests');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns sorted requests for authenticated users', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as never);
    const older = createRequest({ id: 'req_1', createdAt: new Date('2024-01-01') });
    const newer = createRequest({ id: 'req_2', createdAt: new Date('2024-06-01') });
    mockDb.select.mockReturnValue(buildChain([older, newer]));

    const req = new NextRequest('http://localhost/api/requests');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data[0].id).toBe('req_2'); // newest first
  });
});
