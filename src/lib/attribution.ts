'use client';

/**
 * First-touch attribution capture, ported from the reference.
 *
 * Why first-touch and why localStorage: a visitor often arrives from an ad,
 * leaves, and returns directly days later to order. If attribution were read
 * at order time from the current URL, that sale would be credited to "direct"
 * and the ad that actually produced it would look unprofitable. Captured once
 * on first arrival and attached to every later order.
 */

const KEY = 'ul_attr_v1';

const CLICK_IDS = ['fbclid', 'gclid', 'gbraid', 'wbraid', 'ttclid', 'msclkid'] as const;
const UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export type Attribution = {
  fbclid?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  ttclid?: string;
  msclkid?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingUrl?: string;
  landingPath?: string;
  firstSeenAt?: string;
};

const safeGet = (): Attribution | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    // Private windows, blocked storage, or a quota error. Attribution is a
    // nice-to-have; it must never break an order.
    return null;
  }
};

/** Runs once per visitor. A second call never overwrites the first touch. */
export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') return {};

  const existing = safeGet();
  if (existing?.firstSeenAt) {
    // Already captured. Still fill in a click id if this visit has one and the
    // first touch did not — that is new information, not a re-attribution.
    const params = new URLSearchParams(window.location.search);
    let changed = false;
    for (const id of CLICK_IDS) {
      const v = params.get(id);
      if (v && !existing[id]) {
        existing[id] = v;
        changed = true;
      }
    }
    if (changed) {
      try {
        localStorage.setItem(KEY, JSON.stringify(existing));
      } catch {
        /* ignore */
      }
    }
    return existing;
  }

  const params = new URLSearchParams(window.location.search);
  const attr: Attribution = {
    referrer: document.referrer || '',
    landingUrl: window.location.href,
    landingPath: window.location.pathname,
    firstSeenAt: new Date().toISOString(),
  };

  for (const id of CLICK_IDS) {
    const v = params.get(id);
    if (v) attr[id] = v;
  }
  for (const utm of UTMS) {
    const v = params.get(utm);
    if (!v) continue;
    const key = ('utm' + utm.slice(4, 5).toUpperCase() + utm.slice(5)) as keyof Attribution;
    attr[key] = v as never;
  }

  try {
    localStorage.setItem(KEY, JSON.stringify(attr));
  } catch {
    /* ignore */
  }
  return attr;
}

export const readAttribution = (): Attribution => safeGet() ?? {};

/** Meta's browser cookies, used as Conversions API match keys. */
export function readMetaCookies(): { fbp: string; fbc: string } {
  if (typeof document === 'undefined') return { fbp: '', fbc: '' };
  const read = (name: string) =>
    document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${name}=`))
      ?.split('=')[1] ?? '';
  return { fbp: read('_fbp'), fbc: read('_fbc') };
}
