'use client';

import { useEffect, useRef } from 'react';

const alerts = [
  {
    severity: 'CRITICAL',
    severityColor: '#EF4444',
    pillar: 'Protect',
    pillarColor: '#1A4A8A',
    headline: 'Driver A. Williams — CDL expires in 7 days',
    action: 'View driver profile →',
  },
  {
    severity: 'WARNING',
    severityColor: '#EAB308',
    pillar: 'Protect',
    pillarColor: '#1A4A8A',
    headline: 'Vehicle Unit #204 — Registration expires in 28 days',
    action: 'View vehicle →',
  },
  {
    severity: 'WARNING',
    severityColor: '#EAB308',
    pillar: 'Move',
    pillarColor: '#C41E3A',
    headline: 'Deadhead % trending up — 18.3% this week vs 11.2% last week',
    action: 'View analytics →',
  },
  {
    severity: 'INSIGHT',
    severityColor: '#22C55E',
    pillar: 'Grow',
    pillarColor: '#22C55E',
    headline: 'Lane NC → GA averaging $3.45 RPM — 21% above fleet average',
    action: 'View lane analysis →',
  },
  {
    severity: 'INSIGHT',
    severityColor: '#22C55E',
    pillar: 'Move',
    pillarColor: '#C41E3A',
    headline: 'Broker "TQL" delivered 12 loads this month — highest volume partner',
    action: 'View broker breakdown →',
  },
  {
    severity: 'INFO',
    severityColor: '#8FA8C0',
    pillar: 'Grow',
    pillarColor: '#22C55E',
    headline: 'Revenue up 12% month-over-month — 34 loads delivered, $48,200 total',
    action: 'View revenue report →',
  },
];

export function IntelligenceFeedSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = el.querySelectorAll('[data-animate]');
            items.forEach((item, i) => {
              setTimeout(() => {
                (item as HTMLElement).style.opacity = '1';
                (item as HTMLElement).style.transform = 'translateY(0)';
              }, i * 80);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="intelligence" className="py-20 px-6" style={{ background: '#0A1420' }}>
      <div ref={ref} className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Compliance Intelligence Feed
          </h2>
          <p className="mx-auto max-w-2xl text-base" style={{ color: '#8FA8C0' }}>
            ManifestIncite surfaces the issues that matter most — ranked by severity, organized by
            pillar — so you fix critical problems first and spot growth opportunities as they appear.
          </p>
        </div>

        {/* Alert Feed */}
        <div
          className="mb-12 overflow-hidden rounded-xl border"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0F1B2D' }}
        >
          <div
            className="border-b px-5 py-3"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8FA8C0' }}>
              Active Intelligence — This Week
            </span>
          </div>

          {alerts.map((alert, i) => (
            <div
              key={i}
              data-animate
              className="flex items-center gap-4 border-b px-5 py-4 last:border-0"
              style={{
                borderColor: 'rgba(255,255,255,0.04)',
                borderLeft: `3px solid ${alert.severityColor}`,
                opacity: 0,
                transform: 'translateY(12px)',
                transition: 'all 0.4s ease-out',
              }}
            >
              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      background: `${alert.pillarColor}15`,
                      color: alert.pillarColor,
                    }}
                  >
                    {alert.pillar}
                  </span>
                  <span className="text-sm text-white">{alert.headline}</span>
                </div>
                <span className="text-xs" style={{ color: alert.pillarColor }}>
                  {alert.action}
                </span>
              </div>
              <span
                className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase"
                style={{
                  background: `${alert.severityColor}15`,
                  color: alert.severityColor,
                }}
              >
                {alert.severity}
              </span>
            </div>
          ))}
        </div>

        {/* Feature callouts */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Ranked by Severity',
              desc: 'Critical violations surface first. Info-level insights wait their turn. You always know what to fix now.',
            },
            {
              title: 'Cross-Pillar Intelligence',
              desc: 'Compliance risks, dispatch performance, and growth signals — all in one feed, not three different tools.',
            },
            {
              title: 'One-Click Resolution',
              desc: 'Every alert links directly to the driver, vehicle, load, or report that needs attention. No hunting.',
            },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <h4 className="mb-2 text-sm font-bold text-white">{f.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: '#8FA8C0' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}