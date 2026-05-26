import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined;
}

function getRedis(): Redis {
  if (globalThis._redis) return globalThis._redis;

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL environment variable is not set.");
  }

  // Upstash (and other cloud Redis) uses rediss:// (TLS). ioredis needs
  // explicit tls options when the URL scheme is rediss://.
  const isTls = url.startsWith("rediss://");

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    ...(isTls ? { tls: {} } : {}),
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis._redis = client;
  }

  return client;
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
