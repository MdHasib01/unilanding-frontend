import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Locale comes from a cookie, not a URL segment — see src/i18n/request.ts for
// why that matters for multi-tenancy.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const backend =
  process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000';

const nextConfig: NextConfig = {
  /**
   * The API is proxied same-origin on EVERY tenant domain. That is what makes
   * the session cookie first-party and host-only: milkready.com/admin calling
   * /api/... is same-site, so no SameSite=None third-party cookie is needed
   * (which Safari ITP would block outright).
   *
   * /api/internal/* is deliberately NOT rewritten — those routes are for the
   * proxy only and must be unreachable from a browser.
   */
  async rewrites() {
    return [
      { source: '/api/auth/:path*', destination: `${backend}/api/auth/:path*` },
      { source: '/api/platform/:path*', destination: `${backend}/api/platform/:path*` },
      { source: '/api/t/:path*', destination: `${backend}/api/t/:path*` },
      { source: '/api/public/:path*', destination: `${backend}/api/public/:path*` },
      // Locally stored uploads (used when Cloudinary is not configured).
      { source: '/api/media/:path*', destination: `${backend}/api/media/:path*` },
      { source: '/api/health', destination: `${backend}/api/health` },
    ];
  },

  images: {
    // images.domains is deprecated in Next 16; remotePatterns is the supported form.
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    // Next 16 defaults qualities to [75]; 90 is for hero imagery where
    // compression artefacts are most visible.
    qualities: [75, 90],
  },

  // Tenant content is user-authored; a stray console.log in production noise
  // is not worth shipping.
  compiler: { removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false },

  typedRoutes: false,
};

export default withNextIntl(nextConfig);
