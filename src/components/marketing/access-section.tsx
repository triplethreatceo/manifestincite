'use client';

export function AccessSection() {
  return (
    <section id="access" className="py-20 px-6" style={{ background: '#0F1B2D' }}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          How to Access ManifestIncite
        </h2>

        <p className="mb-6 text-base leading-relaxed" style={{ color: '#8FA8C0' }}>
          ManifestIncite is <span className="font-semibold text-white">exclusive to active
          Manifest Global Logistics clients</span>. It&apos;s included with every Manifest Dispatch
          Systems, Manifest Owner Systems, and Manifest Audit &amp; Compliance engagement. No
          separate subscription. No per-seat fees. No nickel-and-diming.
        </p>

        <p className="mb-10 text-base leading-relaxed" style={{ color: '#8FA8C0' }}>
          The platform is most powerful when paired with Manifest Global&apos;s consulting work —
          because the data, the strategy, and the accountability all live in the same place.
          ManifestIncite doesn&apos;t just track your business. It helps you{' '}
          <span className="font-semibold text-white">build it</span>.
        </p>

        <a
          href="https://manifestgl.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md px-10 py-3.5 text-sm font-semibold text-white transition-colors"
          style={{ background: '#C41E3A' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#A51830')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#C41E3A')}
        >
          Start with a Manifest Diagnostic &rarr;
        </a>
      </div>
    </section>
  );
}