'use client';

import { useEffect, useRef } from 'react';

const painCards = [
  {
    pillar: 'Move',
    pillarColor: '#C41E3A',
    title: 'Spreadsheet Dispatch',
    body: 'Managing loads in Excel means missed bookings, lost rate confirmations, and zero visibility into which loads actually made money. You\'re running blind.',
  },
  {
    pillar: 'Move',
    pillarColor: '#C41E3A',
    title: 'Rate Blind Spots',
    body: 'You know your gross revenue but not your revenue per mile by lane, broker, or equipment type. Without that data, you can\'t negotiate better or drop bad freight.',
  },
  {
    pillar: 'Protect',
    pillarColor: '#1A4A8A',
    title: 'The Compliance Clock',
    body: 'Expiring CDLs, lapsed medical cards, overdue vehicle inspections — every missed date is a potential violation, fine, or out-of-service order waiting to happen.',
  },
  {
    pillar: 'Protect',
    pillarColor: '#1A4A8A',
    title: 'Audit Anxiety',
    body: 'When DOT knocks, you need every document in 30 minutes — not scattered across emails, filing cabinets, and three different Google Drives.',
  },
  {
    pillar: 'Grow',
    pillarColor: '#22C55E',
    title: 'Hiring Gambles',
    body: 'You hire a driver, they wreck a truck, and you find out they had two prior incidents. No verification network means every hire is a roll of the dice.',
  },
  {
    pillar: 'Grow',
    pillarColor: '#22C55E',
    title: 'Growth Without Data',
    body: 'Scaling without analytics means repeating unprofitable lanes, overpaying brokers, and never knowing which freight types actually grow your bottom line.',
  },
];

export function ProblemSection() {
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
              }, i * 100);
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
    <section className="py-20 px-6" style={{ background: '#F4F6FB' }}>
      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2
            className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl"
            style={{ color: '#0F1B2D' }}
          >
            The Three Problems That Stall Every Carrier
          </h2>
          <p className="mx-auto max-w-2xl text-base" style={{ color: '#4A5568' }}>
            Whether you&apos;re an owner-operator or running a fleet, these problems cost you money,
            compliance standing, and growth potential every single week.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {painCards.map((card) => (
            <div
              key={card.title}
              data-animate
              className="rounded-lg border-l-[3px] bg-white p-6 shadow-sm"
              style={{
                borderLeftColor: card.pillarColor,
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'all 0.5s ease-out',
              }}
            >
              <span
                className="mb-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  background: `${card.pillarColor}12`,
                  color: card.pillarColor,
                }}
              >
                {card.pillar}
              </span>
              <h3
                className="mb-2 text-lg font-bold"
                style={{ color: '#0F1B2D' }}
              >
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#4A5568' }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}