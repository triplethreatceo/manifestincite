'use client';

import { useEffect, useRef } from 'react';

function DispatchMockup() {
  return (
    <div
      className="w-full overflow-hidden rounded-xl border shadow-2xl"
      style={{ background: '#0F1B2D', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#EF4444' }} />
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#EAB308' }} />
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#22C55E' }} />
        </div>
        <span className="ml-2 text-xs font-medium" style={{ color: '#8FA8C0' }}>
          Growth Formula Dashboard
        </span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {[
          { label: 'MOVE', value: '$48,200', sub: 'Weekly Revenue', color: '#C41E3A' },
          { label: 'PROTECT', value: '98%', sub: 'Compliance Score', color: '#1A4A8A' },
          { label: 'GROW', value: '+12%', sub: 'Revenue Growth MoM', color: '#22C55E' },
        ].map((kpi) => (
          <div key={kpi.label} className="p-4" style={{ background: '#0F1B2D' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="h-2 w-2 rounded-sm" style={{ background: kpi.color }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: kpi.color }}
              >
                {kpi.label}
              </span>
            </div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-[11px]" style={{ color: '#8FA8C0' }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Grid */}
      <div
        className="grid grid-cols-4 gap-px border-t"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {[
          { label: 'Loads Delivered', value: '34' },
          { label: 'Avg RPM', value: '$2.85' },
          { label: 'DH %', value: '11.2%' },
          { label: 'Dispatch Fees', value: '$3,856' },
        ].map((m) => (
          <div key={m.label} className="p-3" style={{ background: '#0F1B2D' }}>
            <div className="text-[10px] uppercase" style={{ color: '#5B7A9E' }}>
              {m.label}
            </div>
            <div className="text-sm font-bold text-white">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Alert Preview */}
      <div
        className="mx-3 my-3 flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5"
        style={{
          borderLeftColor: '#EAB308',
          background: 'rgba(234,179,8,0.06)',
        }}
      >
        <div>
          <span
            className="mr-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
            style={{ background: 'rgba(234,179,8,0.15)', color: '#EAB308' }}
          >
            Warning
          </span>
          <span className="text-xs" style={{ color: '#8FA8C0' }}>
            Driver M. Johnson — CDL expires in 14 days
          </span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = '1';
      ref.current.style.transform = 'translateY(0)';
    }
  }, []);

  return (
    <section
      className="relative overflow-hidden pt-24"
      style={{ background: 'linear-gradient(180deg, #0F1B2D 0%, #0A1420 100%)' }}
    >
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:py-24 lg:grid-cols-[55%_45%] lg:items-center lg:gap-16"
        style={{
          opacity: 0,
          transform: 'translateY(24px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Left — Copy */}
        <div>
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: '#C41E3A' }}
          >
            Exclusive to Manifest Global Clients
          </p>

          <h1
            className="mb-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Move More.
            <br />
            Protect Everything.
            <br />
            <span style={{ color: '#C41E3A' }}>Grow Relentlessly.</span>
          </h1>

          <p
            className="mb-8 max-w-lg text-base font-light leading-relaxed md:text-lg"
            style={{ color: '#8FA8C0' }}
          >
            ManifestIncite is the operating system behind every Manifest Global engagement.
            Dispatch intelligence, FMCSA/DOT compliance, and growth analytics — unified in one
            platform built for carriers who refuse to stay small.
          </p>

          {/* Growth Formula Visual */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
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

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <a
              href="#access"
              className="rounded-md px-6 py-3 text-sm font-semibold text-white transition-colors"
              style={{ background: '#C41E3A' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#A51830')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#C41E3A')}
            >
              Start with a Manifest Diagnostic
            </a>
            <a
              href="#platform"
              className="rounded-md border px-6 py-3 text-sm font-medium transition-colors"
              style={{ borderColor: '#1A2E4A', color: '#8FA8C0' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C41E3A';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1A2E4A';
                e.currentTarget.style.color = '#8FA8C0';
              }}
            >
              See the Growth Formula
            </a>
          </div>

          {/* Trust Bar */}
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
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

        {/* Right — Dashboard Mockup */}
        <div className="hidden lg:block">
          <DispatchMockup />
        </div>
      </div>
    </section>
  );
}