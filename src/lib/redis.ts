import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined;
}

function createRedis(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL environment variable is not set.");
  }

  const isTls = url.startsWith("rediss://");

  return new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,         // don't connect until first command
    ...(isTls ? { tls: {} } : {}),
  });
}

function getRedis(): Redis {
  // Cache across all invocations (even in production on Vercel —
  // the same container may handle multiple requests)
  if (globalThis._redis) return globalThis._redis;
  globalThis._redis = createRedis();
  return globalThis._redis;
}

// Lazy proxy — the actual connection is only established the first time
// a method is called at runtime (not during module evaluation / build).
export const redis = new Proxy({} as Redis, {
  get(_target, prop: string) {
    const client = getRedis();
    const value = (client as unknown as Record<string, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
