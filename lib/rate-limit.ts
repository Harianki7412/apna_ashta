// Limits are process-local; use shared storage to enforce them across instances.
const hits = new Map<string, { count: number; resetAt: number }>();
const MAX_TRACKED_KEYS = 50_000;
let callsSinceCleanup = 0;

export function rateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  if (++callsSinceCleanup >= 256 || hits.size >= MAX_TRACKED_KEYS) {
    callsSinceCleanup = 0;
    for (const [trackedKey, record] of hits) {
      if (record.resetAt <= now) hits.delete(trackedKey);
    }
  }

  const rec = hits.get(key);
  if (!rec || rec.resetAt < now) {
    if (!rec && hits.size >= MAX_TRACKED_KEYS) {
      return { allowed: false, remaining: 0 };
    }
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (rec.count >= limit) return { allowed: false, remaining: 0 };
  rec.count++;
  return { allowed: true, remaining: limit - rec.count };
}

export function clientIP(req: Request) {
  return clientIPFromHeaders(req.headers);
}

export function clientIPFromHeaders(
  headers: Headers | Record<string, unknown>,
) {
  const get = (name: string) => {
    if (headers instanceof Headers) return headers.get(name);
    const value = headers[name];
    return typeof value === 'string' ? value : null;
  };
  return (
    get('x-forwarded-for')?.split(',')[0].trim() ||
    get('x-real-ip') ||
    'unknown'
  );
}