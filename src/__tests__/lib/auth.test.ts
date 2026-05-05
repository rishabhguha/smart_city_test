import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser } from '../mocks/factories';
import { buildChain } from '../mocks/drizzle';

vi.mock('@/db', () => ({
  db: { select: vi.fn(), insert: vi.fn() },
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

import { db } from '@/db';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDbUser, requireRole, syncUser } from '@/lib/auth';

const mockDb = vi.mocked(db);
const mockAuth = vi.mocked(auth);
const mockCurrentUser = vi.mocked(currentUser);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getDbUser', () => {
  it('returns null when there is no authenticated userId', async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);
    const result = await getDbUser();
    expect(result).toBeNull();
  });

  it('returns the DB user row when authenticated', async () => {
    const user = createUser({ role: 'staff' });
    mockAuth.mockResolvedValue({ userId: 'user_test' } as never);
    mockDb.select.mockReturnValue(buildChain([user]));

    const result = await getDbUser();
    expect(result?.id).toBe('user_test');
    expect(result?.role).toBe('staff');
  });

  it('returns null when authenticated but user does not exist in DB', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_ghost' } as never);
    mockDb.select.mockReturnValue(buildChain([]));

    const result = await getDbUser();
    expect(result).toBeNull();
  });
});

describe('requireRole', () => {
  it('throws when the user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);
    await expect(requireRole('admin')).rejects.toThrow('Unauthorized');
  });

  it('throws when the user has the wrong role', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_test' } as never);
    mockDb.select.mockReturnValue(buildChain([createUser({ role: 'citizen' })]));
    await expect(requireRole('admin')).rejects.toThrow('Unauthorized');
  });

  it('passes and returns the user when the role matches', async () => {
    const admin = createUser({ role: 'admin' });
    mockAuth.mockResolvedValue({ userId: 'user_test' } as never);
    mockDb.select.mockReturnValue(buildChain([admin]));

    const result = await requireRole('admin');
    expect(result.role).toBe('admin');
  });

  it('passes when any one of multiple allowed roles matches', async () => {
    const staff = createUser({ role: 'staff' });
    mockAuth.mockResolvedValue({ userId: 'user_test' } as never);
    mockDb.select.mockReturnValue(buildChain([staff]));

    const result = await requireRole('staff', 'admin');
    expect(result.role).toBe('staff');
  });
});

describe('syncUser', () => {
  it('returns null when there is no authenticated userId', async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);
    const result = await syncUser();
    expect(result).toBeNull();
  });

  it('returns the existing user without inserting a duplicate', async () => {
    const existing = createUser();
    mockAuth.mockResolvedValue({ userId: 'user_test' } as never);
    mockCurrentUser.mockResolvedValue({ id: 'user_test', username: 'testuser', firstName: 'Test', lastName: 'User' } as never);
    mockDb.select.mockReturnValue(buildChain([existing]));

    const result = await syncUser();
    expect(result?.id).toBe('user_test');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('creates and returns a new user when none exists', async () => {
    const newUser = createUser({ id: 'user_new' });
    mockAuth.mockResolvedValue({ userId: 'user_new' } as never);
    mockCurrentUser.mockResolvedValue({ id: 'user_new', username: 'newuser', firstName: 'New', lastName: 'User' } as never);
    mockDb.select.mockReturnValue(buildChain([]));
    mockDb.insert.mockReturnValue(buildChain([newUser]));

    const result = await syncUser();
    expect(result?.id).toBe('user_new');
    expect(mockDb.insert).toHaveBeenCalledOnce();
  });
});
