'use client';

import { useEffect, useRef } from 'react';

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 px-6" style={{ background: '#0D1E35' }}>
      <div
        ref={ref}
        className="mx-auto max-w-4xl text-center"
        style={{
          opacity: 0,
          transform: 'translateY(24px)',
          transition: 'all 0.6s ease-out',
        }}
      >
        <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          Move More. Protect Everything.
          <br />
          <span style={{ color: '#C41E3A' }}>Grow Relentlessly.</span>
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-base" style={{ color: '#8FA8C0' }}>
          Manifest Global clients don&apos;t guess. They see every load, every credential, every
          dollar — and they make decisions that compound. ManifestIncite is how.
        </p>

        {/* Growth Formula */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          {[
            { label: 'Move', color: '#C41E3A' },
            { label: 'Protect', color: '#1A4A8A' },
            { label: 'Grow', color: '#22C55E' },
          ].map((p, i) => (
            <div key={p.label} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-lg font-light" style={{ color: '#5B7A9E' }}>
                  +
                </span>
              )}
              <div className="h-3 w-3 rounded-sm" style={{ background: p.color }} />
              <span className="text-sm font-semibold text-white">{p.label}</span>
            </div>
          ))}
          <span className="text-lg font-light" style={{ color: '#5B7A9E' }}>
            =
          </span>
          <span className="text-sm font-bold" style={{ color: '#C41E3A' }}>
            Growth Formula
          </span>
        </div>

        <a
          href="https://manifestgl.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md px-10 py-3.5 text-sm font-semibold text-white transition-colors"
          style={{ background: '#C41E3A' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#A51830')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#C41E3A')}
        >
          Start with a Manifest Diagnostic
        </a>

        {/* Trust bar */}
        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            'FMCSA Compliant',
            'DOT Audit-Ready',
            'Multi-Carrier',
            'Owner-Operator Friendly',
          ].map((badge) => (
            <span
              key={badge}
              className="text-[11px] font-medium uppercase tracking-wider"
              style={{ color: '#5B7A9E' }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}