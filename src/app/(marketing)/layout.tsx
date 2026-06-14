import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ManifestIncite — The Operating System Behind Every Manifest Global Engagement',
  description:
    'FMCSA/DOT compliance, dispatch operations, and growth analytics for trucking companies and owner operators. Built by Manifest Global Logistics. Part of the GrowthIncite Suite.',
  keywords: [
    'trucking compliance software',
    'FMCSA compliance',
    'DOT compliance',
    'dispatch management',
    'owner operator software',
    'trucking analytics',
    'fleet management',
    'Manifest Global',
    'load management',
  ],
  openGraph: {
    title: 'ManifestIncite — Built for Carriers Who Want to Grow',
    description:
      'FMCSA/DOT compliance, dispatch operations, and growth analytics. Exclusive to Manifest Global clients.',
    url: 'https://manifestincite.com',
    siteName: 'ManifestIncite',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ManifestIncite — The Operating System Behind Every Manifest Global Engagement',
    description:
      'FMCSA/DOT compliance, dispatch operations, and growth analytics for trucking companies and owner operators.',
  },
  robots: { index: true, follow: true },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}