import { vi } from 'vitest';

/**
 * Builds a chainable Drizzle query mock that resolves to `result`.
 *
 * Supports:
 *   await db.select().from(t).where(...)     → result
 *   await db.insert(t).values({}).returning() → result
 *   await db.update(t).set({}).where(...).returning() → result
 */
export function buildChain<T>(result: T[] = []) {
  const p = Promise.resolve(result);

  const chain: Record<string, unknown> = {
    from: vi.fn(),
    where: vi.fn(),
    leftJoin: vi.fn(),
    values: vi.fn(),
    set: vi.fn(),
    returning: vi.fn().mockResolvedValue(result),
    onConflictDoNothing: vi.fn(),
    // Make the chain itself awaitable (for select chains without .returning())
    then: p.then.bind(p),
    catch: p.catch.bind(p),
    finally: p.finally.bind(p),
  };

  for (const m of ['from', 'where', 'leftJoin', 'values', 'set', 'onConflictDoNothing']) {
    (chain[m] as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  }

  return chain as {
    from: ReturnType<typeof vi.fn>;
    where: ReturnType<typeof vi.fn>;
    leftJoin: ReturnType<typeof vi.fn>;
    values: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    returning: ReturnType<typeof vi.fn>;
    onConflictDoNothing: ReturnType<typeof vi.fn>;
  } & Promise<T[]>;
}
