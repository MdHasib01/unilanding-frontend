'use client';

/**
 * Browser API client.
 *
 * Talks to /api/* on the CURRENT origin, which the Next rewrite forwards to
 * Express. That same-origin arrangement is what lets the session be a
 * host-only first-party cookie on every tenant domain, so there is no bearer
 * token in localStorage for an XSS to steal — the reference project's weakest
 * point.
 */

const CSRF_COOKIE = 'ul_csrf';

export type ApiError = {
  message: string;
  code?: string;
  status: number;
  details?: { path: string; message: string }[];
};

export class ApiRequestError extends Error implements ApiError {
  code?: string;
  status: number;
  details?: { path: string; message: string }[];

  constructor(e: ApiError) {
    super(e.message);
    this.name = 'ApiRequestError';
    this.code = e.code;
    this.status = e.status;
    this.details = e.details;
  }
}

const readCookie = (name: string): string => {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${name}=`))
      ?.slice(name.length + 1) ?? ''
  );
};

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Needed for tenant-scoped calls in path mode, where the host is the platform. */
  tenantSlug?: string;
  signal?: AbortSignal;
};

async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const method = opts.method ?? 'GET';
  const headers: Record<string, string> = { accept: 'application/json' };

  if (opts.body !== undefined) headers['content-type'] = 'application/json';

  // Double-submit CSRF: echo back the readable cookie. SameSite=Lax already
  // blocks cross-site form posts; this is the second lock.
  if (method !== 'GET') {
    const csrf = readCookie(CSRF_COOKIE);
    if (csrf) headers['x-csrf-token'] = csrf;
  }

  if (opts.tenantSlug) headers['x-tenant-slug'] = opts.tenantSlug;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    // The cookie is same-origin, but be explicit.
    credentials: 'same-origin',
    signal: opts.signal,
  });

  let json: {
    success?: boolean;
    data?: T;
    error?: string;
    code?: string;
    details?: { path: string; message: string }[];
    pagination?: unknown;
  } | null = null;

  try {
    json = await res.json();
  } catch {
    // A non-JSON body here almost always means the proxy answered with HTML —
    // say so plainly rather than surfacing "Unexpected token <".
    throw new ApiRequestError({
      message: `The server returned a non-JSON response (${res.status}).`,
      status: res.status,
    });
  }

  if (!res.ok || !json?.success) {
    throw new ApiRequestError({
      message: json?.error || `Request failed (${res.status})`,
      code: json?.code,
      status: res.status,
      details: json?.details,
    });
  }

  return json.data as T;
}

export const api = {
  get: <T>(path: string, o?: Omit<Options, 'method' | 'body'>) =>
    request<T>(path, { ...o, method: 'GET' }),
  post: <T>(path: string, body?: unknown, o?: Omit<Options, 'method' | 'body'>) =>
    request<T>(path, { ...o, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, o?: Omit<Options, 'method' | 'body'>) =>
    request<T>(path, { ...o, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, o?: Omit<Options, 'method' | 'body'>) =>
    request<T>(path, { ...o, method: 'PUT', body }),
  del: <T>(path: string, o?: Omit<Options, 'method' | 'body'>) =>
    request<T>(path, { ...o, method: 'DELETE' }),
};

/** Pulls a field-level message out of a validation failure for a form. */
export function fieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof ApiRequestError) || !err.details) return {};
  return Object.fromEntries(err.details.map((d) => [d.path, d.message]));
}
