import type { Metadata, Viewport } from 'next';
import { Hind_Siliguri, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import './globals.css';
import { cn } from "@/lib/utils";


/**
 * Two font families, swapped by the active locale.
 *
 * Hind Siliguri carries Bengali properly; Inter is a better Latin face. Only
 * the weights actually used are requested — the reference project documented
 * this subsetting carefully and it is worth keeping, since a landing page's
 * first paint is its conversion rate.
 */
const bengali = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-bengali',
});

const latin = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-latin',
});

export const metadata: Metadata = {
  title: { default: 'UniLanding', template: '%s' },
  description: 'Landing pages and order management for growing businesses.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Pinch-zoom must stay available: tenants' customers read dense Bangla copy
  // on small phones.
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      // Next 16 no longer overrides scroll-behavior during navigation unless
      // asked, and smooth in-page scrolling is what every CTA relies on.
      data-scroll-behavior="smooth"
      className={cn(bengali.variable, latin.variable, 'font-sans')}
      style={{ ['--font-ui' as string]: locale === 'bn' ? 'var(--font-bengali)' : 'var(--font-latin)' }}
    >
      <body>
        {/* Required in next-intl v4 for any client component using useTranslations. */}
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
