import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createUser } from '../mocks/factories';
import { buildChain } from '../mocks/drizzle';

vi.mock('@/db', () => ({
  db: { select: vi.fn(), insert: vi.fn() },
}));

import { db } from '@/db';
import { POST } from '@/app/api/webhooks/clerk/route';

const mockDb = vi.mocked(db);

function makeWebhookRequest(payload: unknown) {
  return new NextRequest('http://localhost/api/webhooks/clerk', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
}

const userCreatedPayload = {
  type: 'user.created',
  data: {
    id: 'user_clerk_123',
    username: 'jdoe',
    first_name: 'Jane',
    last_name: 'Doe',
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/webhooks/clerk', () => {
  it('creates a citizen user on user.created event', async () => {
    mockDb.select.mockReturnValue(buildChain([])); // user doesn't exist yet
    mockDb.insert.mockReturnValue(buildChain([createUser({ id: 'user_clerk_123' })]));

    const res = await POST(makeWebhookRequest(userCreatedPayload));
    expect(res.status).toBe(200);
    expect(mockDb.insert).toHaveBeenCalledOnce();
  });

  it('does not insert when the user already exists (idempotent)', async () => {
    mockDb.select.mockReturnValue(buildChain([createUser({ id: 'user_clerk_123' })]));

    const res = await POST(makeWebhookRequest(userCreatedPayload));
    expect(res.status).toBe(200);
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('ignores events other than user.created', async () => {
    const res = await POST(makeWebhookRequest({ type: 'user.deleted', data: {} }));
    expect(res.status).toBe(200);
    expect(mockDb.insert).not.toHaveBeenCalled();
    expect(mockDb.select).not.toHaveBeenCalled();
  });
});
