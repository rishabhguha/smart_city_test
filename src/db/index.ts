import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

function neonWithRetry(connectionString: string) {
  const sql = neon(connectionString);
  return new Proxy(sql, {
    apply: async (target, thisArg, args) => {
      try {
        return await Reflect.apply(target as (...a: unknown[]) => unknown, thisArg, args);
      } catch {
        await new Promise((r) => setTimeout(r, 800));
        return Reflect.apply(target as (...a: unknown[]) => unknown, thisArg, args);
      }
    },
  }) as typeof sql;
}

let _db: Db | null = null;

function getDb(): Db {
  if (!_db) {
    _db = drizzle(neonWithRetry(process.env.DATABASE_URL!), { schema });
  }
  return _db;
}

// Proxy defers neon() initialization to first request, avoiding build-time errors.
export const db = new Proxy({} as Db, {
  get(_, prop: string | symbol) {
    return Reflect.get(getDb(), prop);
  },
});
