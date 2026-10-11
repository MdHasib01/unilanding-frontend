/**
 * Host arithmetic shared by the proxy and anything else that needs to know
 * which tenant a request is for.
 *
 * The platform is reachable under SEVERAL names, and getting this wrong is
 * loud: a host that is not recognised as the platform falls through to the
 * custom-domain branch, finds no tenant, and renders "domain not configured" —
 * which is exactly what happens on http://localhost:3000 if localhost is not
 * in this list.
 */

/** Strip port and trailing dot; lowercase. Dev hosts carry :3000. */
export function normalizeHost(raw: string | null | undefined): string {
  if (!raw) return '';
  let h = String(raw).trim().toLowerCase();

  // IPv6 literal: [::1]:3000 -> ::1
  if (h.startsWith('[')) {
    const close = h.indexOf(']');
    if (close !== -1) return h.slice(1, close);
  }

  // A bare IPv6 literal (::1) has several colons and no port to strip.
  // Splitting it like a host:port would reduce it to an empty string.
  const colons = (h.match(/:/g) ?? []).length;
  if (colons <= 1) {
    const colon = h.lastIndexOf(':');
    if (colon !== -1 && /^\d+$/.test(h.slice(colon + 1))) h = h.slice(0, colon);
  }
  if (h.endsWith('.')) h = h.slice(0, -1);
  return h;
}

/**
 * Every hostname that means "the platform itself", normalized.
 *
 * `localhost`, `127.0.0.1` and `::1` are included by default in development so
 * the app works the moment it boots, with no hosts-file editing. Production
 * should set PLATFORM_HOST_ALIASES to '' (or just omit the loopback names).
 */
export function platformHosts(
  platformHost: string,
  aliases?: string | string[]
): string[] {
  const primary = normalizeHost(platformHost);
  const extra = (Array.isArray(aliases) ? aliases : (aliases ?? '').split(','))
    .map((a) => normalizeHost(a))
    .filter(Boolean);

  const all = new Set<string>([primary, ...extra]);
  // www.<platform> is the platform too, not a tenant called "www".
  if (primary) all.add(`www.${primary}`);
  all.delete('');
  return [...all];
}

export const isPlatformHost = (host: string, hosts: string[]): boolean =>
  hosts.includes(host);

/**
 * If `host` is a subdomain of any platform host, returns the label.
 *
 *   demo.unilanding.local -> 'demo'
 *   demo.localhost        -> 'demo'   (browsers resolve *.localhost to loopback,
 *                                      so subdomain mode works with no setup)
 *   unilanding.local      -> null     (that is the platform, not a tenant)
 *   a.b.unilanding.local  -> null     (one label only; a nested name is not a slug)
 */
export function tenantLabelFromHost(host: string, hosts: string[]): string | null {
  for (const base of hosts) {
    if (!host.endsWith(`.${base}`)) continue;
    const label = host.slice(0, -(base.length + 1));
    if (!label || label.includes('.')) continue;
    return label;
  }
  return null;
}
