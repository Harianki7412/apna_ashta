import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ApiFailure, ApiSuccess } from '@/types';

export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data }, { status });
}

export function fail(
  message: string,
  status = 400,
  details?: unknown,
): NextResponse<ApiFailure> {
  return NextResponse.json({ error: message, details }, { status });
}

export function handleError(err: unknown): NextResponse<ApiFailure> {
  console.error('[API]', err);
  if (err instanceof ZodError) return fail('Validation failed', 400);
  if (err instanceof Error) {
    if (err.message.includes('E11000')) return fail('Duplicate entry', 409);
    if (err instanceof SyntaxError) return fail('Invalid JSON body', 400);
  }
  return fail('Server error', 500);
}

export function paginate(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(50, Number(searchParams.get('limit') || 12));
  return { page, limit, skip: (page - 1) * limit };
}