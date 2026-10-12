'use client';

import { ApiRequestError } from './api-client';

export type MediaAsset = {
  id: string;
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  bytes: number;
  format: string;
  originalFilename: string;
  createdAt: string;
};

const readCookie = (name: string) =>
  document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? '';

export const MAX_UPLOAD_MB = 10;
export const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml';

/**
 * Uploads one image to the tenant's media library.
 *
 * multipart, so it cannot go through the JSON api client; it sends the same
 * double-submit CSRF header and tenant hint by hand.
 */
export async function uploadImage(file: File, tenantSlug: string): Promise<MediaAsset> {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new ApiRequestError({ message: `Images must be ${MAX_UPLOAD_MB} MB or smaller`, status: 413 });
  }

  const body = new FormData();
  body.append('file', file);

  const res = await fetch('/api/t/media', {
    method: 'POST',
    body,
    credentials: 'same-origin',
    headers: { 'x-csrf-token': readCookie('ul_csrf'), 'x-tenant-slug': tenantSlug },
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new ApiRequestError({
      message: json?.error || `Upload failed (${res.status})`,
      code: json?.code,
      status: res.status,
    });
  }
  return json.data as MediaAsset;
}
