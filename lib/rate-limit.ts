const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || rec.resetAt < now) {
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