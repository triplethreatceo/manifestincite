'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer
      className="border-t px-6 py-12"
      style={{ background: '#0F1B2D', borderColor: '#1A2E4A' }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-bold" style={{ color: '#C41E3A' }}>
              Manifest
            </span>
            <span className="text-xl font-bold text-white">Incite</span>
          </div>
          <p className="mt-2 text-sm" style={{ color: '#8FA8C0' }}>
            Build Smarter. Move Stronger. Protect the Business.
          </p>
          <p className="mt-1 text-xs" style={{ color: '#5B7A9E' }}>
            by GrowthIncite
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5B7A9E' }}>
              Platform
            </p>
            <div className="space-y-2">
              {[
                { label: 'Growth Formula', href: '#platform' },
                { label: 'Compliance Intel', href: '#intelligence' },
                { label: 'Benchmarks', href: '#benchmarks' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-sm transition-colors"
                  style={{ color: '#8FA8C0' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#8FA8C0')}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5B7A9E' }}>
              Legal
            </p>
            <div className="space-y-2">
              <Link
                href="/privacy"
                className="block text-sm transition-colors"
                style={{ color: '#8FA8C0' }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block text-sm transition-colors"
                style={{ color: '#8FA8C0' }}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Company */}
        <div>
          <p className="mb-1 text-xs uppercase" style={{ color: '#5B7A9E' }}>
            Built by
          </p>
          <a
            href="https://manifestgl.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-bold transition-colors"
            style={{ color: '#C41E3A' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#E53E3E')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#C41E3A')}
          >
            Manifest Global Logistics
          </a>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: '#5B7A9E' }}>
            Exclusive to active Manifest Global clients.
          </p>
          <a
            href="https://manifestgl.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs font-medium transition-colors"
            style={{ color: '#C41E3A' }}
          >
            Start with a Manifest Diagnostic &rarr;
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="mx-auto mt-10 max-w-6xl border-t pt-6 text-center"
        style={{ borderColor: '#1A2E4A' }}
      >
        <p className="text-xs" style={{ color: '#5B7A9E' }}>
          &copy; {new Date().getFullYear()} Manifest Global Logistics. All rights reserved. Part of the GrowthIncite Suite.
        </p>
      </div>
    </footer>
  );
}