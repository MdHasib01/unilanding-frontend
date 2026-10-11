import Link from 'next/link';

/** The unilanding.com marketing home. Placeholder until the real one is designed. */
export default function PlatformHome() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          UniLanding
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Landing pages that take orders
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          One dashboard to launch a branded landing page on your own domain, edit
          it section by section, and work the orders that come in.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link
            href="/platform"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Platform dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
