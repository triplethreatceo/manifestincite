'use client';

import { useEffect, useRef } from 'react';

const benchmarks = [
  {
    pillar: 'Move',
    pillarColor: '#C41E3A',
    metric: 'Revenue Per Mile',
    target: '$2.50+',
    explanation: 'Minimum RPM across all loaded miles to cover costs and generate margin.',
  },
  {
    pillar: 'Move',
    pillarColor: '#C41E3A',
    metric: 'Deadhead Percentage',
    target: 'Under 15%',
    explanation: 'Empty miles eat profit. Top carriers keep deadhead below 15% consistently.',
  },
  {
    pillar: 'Move',
    pillarColor: '#C41E3A',
    metric: 'Load Acceptance Rate',
    target: '85%+',
    explanation: 'High acceptance signals strong broker relationships and reliable capacity.',
  },
  {
    pillar: 'Protect',
    pillarColor: '#1A4A8A',
    metric: 'Compliance Score',
    target: '100%',
    explanation: 'Zero expired credentials, zero missing documents. Non-negotiable.',
  },
  {
    pillar: 'Protect',
    pillarColor: '#1A4A8A',
    metric: 'Alert Resolution',
    target: 'Under 24hr',
    explanation: 'Critical compliance alerts resolved within one business day, every time.',
  },
  {
    pillar: 'Protect',
    pillarColor: '#1A4A8A',
    metric: 'Document Currency',
    target: '100%',
    explanation: 'Every CDL, medical card, registration, and insurance certificate current and filed.',
  },
  {
    pillar: 'Grow',
    pillarColor: '#22C55E',
    metric: 'Revenue Growth',
    target: '10%+ QoQ',
    explanation: 'Quarter-over-quarter revenue growth through better lanes and higher-value freight.',
  },
  {
    pillar: 'Grow',
    pillarColor: '#22C55E',
    metric: 'Driver Retention',
    target: '90%+',
    explanation: 'Keep good drivers. Turnover kills growth faster than any market downturn.',
  },
  {
    pillar: 'Grow',
    pillarColor: '#22C55E',
    metric: 'Client Satisfaction',
    target: '95%+',
    explanation: 'Repeat business from satisfied shippers and brokers compounds revenue over time.',
  },
];

export function BenchmarksSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = el.querySelectorAll('[data-animate]');
            cards.forEach((card, i) => {
              setTimeout(() => {
                (card as HTMLElement).style.opacity = '1';
                (card as HTMLElement).style.transform = 'translateY(0)';
              }, i * 80);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="benchmarks" className="py-20 px-6" style={{ background: '#F4F6FB' }}>
      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2
            className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl"
            style={{ color: '#0F1B2D' }}
          >
            The Carrier Standard
          </h2>
          <p className="mx-auto max-w-2xl text-base" style={{ color: '#4A5568' }}>
            These are the benchmarks Manifest Global uses to evaluate carrier health. ManifestIncite
            tracks every one of them automatically — so you always know where you stand.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {benchmarks.map((b) => (
            <div
              key={b.metric}
              data-animate
              className="rounded-lg border bg-white p-5 shadow-sm"
              style={{
                borderColor: '#E2E8F0',
                opacity: 0,
                transform: 'translateY(16px)',
                transition: 'all 0.4s ease-out',
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: b.pillarColor }}
                />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: b.pillarColor }}
                >
                  {b.pillar}
                </span>
              </div>
              <p
                className="mb-1 text-xs font-bold uppercase tracking-wider"
                style={{ color: '#0F1B2D' }}
              >
                {b.metric}
              </p>
              <p
                className="mb-2 text-3xl font-extrabold"
                style={{ color: b.pillarColor }}
              >
                {b.target}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#4A5568' }}>
                {b.explanation}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#access"
            className="inline-block rounded-md px-8 py-3 text-sm font-semibold text-white transition-colors"
            style={{ background: '#C41E3A' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#A51830')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#C41E3A')}
          >
            See How Your Operation Compares — Start with a Manifest Diagnostic
          </a>
        </div>
      </div>
    </section>
  );
}