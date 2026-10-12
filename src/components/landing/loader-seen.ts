/**
 * Shared by the server page (which inlines the script) and the client loader
 * (which writes the flag) — so it must not live in the 'use client' module.
 */

export const loaderSeenKey = (slug: string) => `ul_loader:${slug}`;

/**
 * Runs before the loader is parsed: a visitor who already saw it this session
 * gets `data-ul-loaded` on <html>, and globals.css hides `.ul-loader` — so a
 * repeat page view never flashes the overlay. The slug is a validated tenant
 * slug ([a-z0-9-]), and JSON.stringify quotes it.
 */
export function loaderSeenScript(slug: string) {
  return `try{if(sessionStorage.getItem(${JSON.stringify(loaderSeenKey(slug))}))document.documentElement.setAttribute('data-ul-loaded','')}catch(e){}`;
}
