import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function ok(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(message: string, status = 400, details?: any) {
  return NextResponse.json({ error: message, details }, { status });
}

export function handleError(err: unknown) {
  console.error('[API]', err);
  if (err instanceof ZodError) return fail('Validation failed', 400, err.flatten());
  if (err instanceof Error) {
    if (err.message.includes('E11000')) return fail('Duplicate entry', 409);
    return fail(err.message, 500);
  }
  return fail('Server error', 500);
}

export function paginate(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(50, Number(searchParams.get('limit') || 12));
  return { page, limit, skip: (page - 1) * limit };
}