'use client';

import { useState, useEffect, useRef } from 'react';

const pillars = [
  {
    id: 'move',
    label: 'Move',
    color: '#C41E3A',
    tagline: 'Maximize the revenue every mile earns',
    modules: [
      {
        name: 'Dispatch Dashboard',
        headline: 'See every load, driver, and dollar — live.',
        bullets: [
          'Real-time load pipeline with 11-stage status tracking',
          'Active loads, today\'s pickups, today\'s deliveries at a glance',
          'Available driver visibility by company for instant assignment',
          'Load-scoped messaging between dispatchers and drivers',
          'Full trip lifecycle from booking through proof of delivery',
        ],
        rows: [
          { label: 'Active Loads', value: 12, max: 20 },
          { label: 'Pickups Today', value: 4, max: 10 },
          { label: 'Deliveries Today', value: 6, max: 10 },
          { label: 'Unread Messages', value: 3, max: 15 },
          { label: 'Available Drivers', value: 8, max: 12 },
        ],
      },
      {
        name: 'Load Management',
        headline: 'Every load, every detail, every dollar tracked.',
        bullets: [
          'Full origin/destination with facility hours and contact info',
          'Broker name, email, phone — tracked per load for relationship intelligence',
          'Auto-calculated RPM, dispatch fee, and rate per mile',
          'Equipment type and freight classification on every shipment',
          'BOL, rate confirmation, and invoice workflow tracking',
        ],
        rows: [
          { label: 'Avg Rate', value: 3200, max: 5000 },
          { label: 'Avg RPM', value: 2.85, max: 4 },
          { label: 'Dispatch Fee', value: 256, max: 500 },
          { label: 'Driver Pay', value: 1800, max: 3000 },
          { label: 'DH Miles', value: 45, max: 200 },
        ],
      },
      {
        name: 'Revenue Analytics',
        headline: 'Know which loads grow your business — and which don\'t.',
        bullets: [
          'Revenue per mile by lane, broker, equipment type, and freight class',
          'Top brokers ranked by load count, revenue, and RPM performance',
          'Lane profitability analysis (origin → destination state)',
          'Most profitable loads table with rate, miles, RPM, and fees',
          'Dispatch fee earnings and driver pay tracking across all loads',
        ],
        rows: [
          { label: 'Total Revenue', value: 48200, max: 60000 },
          { label: 'Dispatch Fees', value: 3856, max: 5000 },
          { label: 'Top Lane RPM', value: 3.45, max: 4 },
          { label: 'Loads Delivered', value: 34, max: 50 },
          { label: 'DH %', value: 11.2, max: 25 },
        ],
      },
    ],
  },
  {
    id: 'protect',
    label: 'Protect',
    color: '#1A4A8A',
    tagline: 'Stay compliant, stay on the road, stay profitable',
    modules: [
      {
        name: 'Compliance Engine',
        headline: 'Automated scanning. Zero surprises at the scale house.',
        bullets: [
          'Auto-scan all drivers and vehicles for expiring credentials',
          'CDL, medical card, MVR, drug test, and clearinghouse monitoring',
          'Vehicle registration, insurance, and annual inspection tracking',
          'Priority-ranked alerts: critical, high, medium, low severity',
          'Assignment workflow — route alerts to the right team member',
        ],
        rows: [
          { label: 'Critical Alerts', value: 2, max: 10 },
          { label: 'Expiring CDLs (30d)', value: 1, max: 5 },
          { label: 'Medical Cards Due', value: 3, max: 10 },
          { label: 'Vehicle Inspections', value: 1, max: 5 },
          { label: 'Resolved This Week', value: 8, max: 10 },
        ],
      },
      {
        name: 'Document Vault',
        headline: 'Audit-ready in 30 seconds, not 30 hours.',
        bullets: [
          'Centralized storage for CDLs, med cards, insurance, registrations, permits',
          'Expiration date tracking with automatic alert generation',
          'Client portal upload — drivers and companies submit documents directly',
          'Category organization with current/expired/missing status',
          'Full audit trail — who uploaded what, and when',
        ],
        rows: [
          { label: 'Documents Filed', value: 247, max: 300 },
          { label: 'Current', value: 231, max: 250 },
          { label: 'Expiring Soon', value: 12, max: 50 },
          { label: 'Missing', value: 4, max: 20 },
          { label: 'Uploaded This Week', value: 18, max: 30 },
        ],
      },
      {
        name: 'Task Management',
        headline: 'Never let a compliance deadline slip through the cracks.',
        bullets: [
          'Create, assign, and track compliance tasks across your team',
          'Priority levels: urgent, high, medium, low',
          'Status workflow from pending through completion',
          'Link tasks to specific drivers, vehicles, or documents',
          'Overdue detection with automatic escalation',
        ],
        rows: [
          { label: 'Open Tasks', value: 12, max: 30 },
          { label: 'Due This Week', value: 5, max: 10 },
          { label: 'Overdue', value: 1, max: 10 },
          { label: 'Completed MTD', value: 23, max: 30 },
          { label: 'Avg Resolution', value: 2.1, max: 7 },
        ],
      },
    ],
  },
  {
    id: 'grow',
    label: 'Grow',
    color: '#22C55E',
    tagline: 'Scale with confidence, hire with intelligence',
    modules: [
      {
        name: 'Verification Network',
        headline: 'Hire drivers you can trust. Period.',
        bullets: [
          'Verified driver profiles with endorsements and experience history',
          'Employment reference system — previous carriers confirm or dispute',
          'Hiring evaluation framework with decision tracking and audit trail',
          'Profile access consent gate — drivers control who sees their record',
          'Carrier verification with safety rating and fleet documentation',
        ],
        rows: [
          { label: 'Verified Drivers', value: 24, max: 40 },
          { label: 'References Filed', value: 67, max: 100 },
          { label: 'Pending Reviews', value: 5, max: 15 },
          { label: 'Carriers Verified', value: 8, max: 15 },
          { label: 'Hire Confidence', value: 94, max: 100 },
        ],
      },
      {
        name: 'Client Portal',
        headline: 'Give your clients visibility without giving up control.',
        bullets: [
          'Branded portal for companies and owner-operators to self-serve',
          'Compliance status at a glance — alerts, documents, deadlines',
          'Direct document upload — CDLs, med cards, insurance certificates',
          'Invoice and payment history visible to client teams',
          'Calendar with upcoming compliance dates and renewal reminders',
        ],
        rows: [
          { label: 'Active Clients', value: 12, max: 20 },
          { label: 'Portal Logins (7d)', value: 34, max: 50 },
          { label: 'Docs Uploaded', value: 8, max: 20 },
          { label: 'Open Alerts', value: 6, max: 15 },
          { label: 'Satisfaction', value: 96, max: 100 },
        ],
      },
      {
        name: 'Revenue Intelligence',
        headline: 'Turn data into decisions that compound.',
        bullets: [
          'Monthly recurring revenue tracking across all client accounts',
          'Invoice aging and payment collection analytics',
          'Client revenue ranking with dispatch fee breakdown',
          'Equipment utilization and freight type profitability trends',
          'Growth benchmarks — are you moving more, earning more, every month?',
        ],
        rows: [
          { label: 'MRR', value: 18500, max: 25000 },
          { label: 'Collections Rate', value: 94, max: 100 },
          { label: 'Revenue Growth', value: 12, max: 25 },
          { label: 'Avg Load Value', value: 3200, max: 5000 },
          { label: 'Client Retention', value: 97, max: 100 },
        ],
      },
    ],
  },
];

function ModuleMockup({ rows, color }: { rows: { label: string; value: number; max: number }[]; color: string }) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {rows.map((row, i) => (
        <div
          key={row.label}
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: i % 2 === 0 ? '#0F1B2D' : '#0D1E35' }}
        >
          <span className="text-xs" style={{ color: '#8FA8C0' }}>
            {row.label}
          </span>
          <div className="flex items-center gap-3">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${Math.max((row.value / row.max) * 80, 16)}px`,
                background: color,
                opacity: 0.7,
              }}
            />
            <span className="text-xs font-semibold text-white min-w-[48px] text-right">
              {typeof row.value === 'number' && row.value > 100
                ? row.value.toLocaleString()
                : row.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PlatformSection() {
  const [activePillar, setActivePillar] = useState(0);
  const [activeModule, setActiveModule] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveModule(0);
  }, [activePillar]);

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
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pillar = pillars[activePillar];
  const mod = pillar.modules[activeModule];

  return (
    <section id="platform" className="py-20 px-6" style={{ background: '#0F1B2D' }}>
      <div
        ref={ref}
        className="mx-auto max-w-6xl"
        style={{
          opacity: 0,
          transform: 'translateY(24px)',
          transition: 'all 0.6s ease-out',
        }}
      >
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            The Growth Formula
          </h2>
          <p className="mx-auto max-w-2xl text-base" style={{ color: '#8FA8C0' }}>
            Three pillars. Nine modules. Every tool a carrier needs to move loads, protect the
            operation, and grow the business — all in one platform.
          </p>
        </div>

        {/* Pillar Tabs */}
        <div className="mb-10 flex justify-center gap-2">
          {pillars.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActivePillar(i)}
              className="relative rounded-md px-6 py-2.5 text-sm font-semibold transition-all"
              style={{
                color: activePillar === i ? '#fff' : '#8FA8C0',
                background: activePillar === i ? `${p.color}20` : 'transparent',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: p.color }}
                />
                {p.label}
              </div>
              {activePillar === i && (
                <div
                  className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full"
                  style={{ background: p.color }}
                />
              )}
            </button>
          ))}
        </div>

        <p className="mb-8 text-center text-sm" style={{ color: pillar.color }}>
          {pillar.tagline}
        </p>

        {/* Module Content */}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Module Tabs */}
          <div className="flex gap-2 lg:flex-col">
            {pillar.modules.map((m, i) => (
              <button
                key={m.name}
                onClick={() => setActiveModule(i)}
                className="rounded-md px-4 py-3 text-left text-sm font-medium transition-all flex-1 lg:flex-none"
                style={{
                  color: activeModule === i ? '#fff' : '#8FA8C0',
                  background: activeModule === i ? `${pillar.color}15` : 'transparent',
                  borderLeft: activeModule === i ? `3px solid ${pillar.color}` : '3px solid transparent',
                }}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Module Detail */}
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div>
              <h3 className="mb-4 text-xl font-bold text-white">{mod.headline}</h3>
              <ul className="space-y-2.5">
                {mod.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm" style={{ color: '#8FA8C0' }}>
                    <div
                      className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ background: pillar.color }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden lg:block">
              <ModuleMockup rows={mod.rows} color={pillar.color} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}