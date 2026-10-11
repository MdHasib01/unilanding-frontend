/**
 * Env access in one place, so a missing variable is a clear startup error
 * rather than an `undefined` that surfaces as a broken tenant lookup.
 *
 * NEXT_PUBLIC_* values are inlined at build time and visible in the browser;
 * everything else is server-only. Nothing secret belongs in the public group.
 */

const required = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See client/.env.example.`
    );
  }
  return value;
};

/** Server-only. Reading these from a client component would be a bug. */
export const serverEnv = {
  get platformHost() {
    return required('PLATFORM_HOST', process.env.PLATFORM_HOST);
  },
  get internalApiUrl() {
    return process.env.INTERNAL_API_URL || 'http://127.0.0.1:5000';
  },
  get internalApiKey() {
    return required('INTERNAL_API_KEY', process.env.INTERNAL_API_KEY);
  },
  get backendUrl() {
    return process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:5000';
  },
};

/** Safe to reference from the browser. */
export const publicEnv = {
  platformHost: process.env.NEXT_PUBLIC_PLATFORM_HOST || 'unilanding.local:3000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'UniLanding',
};

/** Hostname only, for comparing against a Host header. */
export const platformHostname = () => publicEnv.platformHost.split(':')[0].toLowerCase();
