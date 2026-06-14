import { Navbar } from '@/components/marketing/navbar';
import { Hero } from '@/components/marketing/hero';
import { ProblemSection } from '@/components/marketing/problem-section';
import { PlatformSection } from '@/components/marketing/platform-section';
import { IntelligenceFeedSection } from '@/components/marketing/intelligence-feed-section';
import { BenchmarksSection } from '@/components/marketing/benchmarks-section';
import { AccessSection } from '@/components/marketing/access-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { Footer } from '@/components/marketing/footer';

export default function Page() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ProblemSection />
      <PlatformSection />
      <IntelligenceFeedSection />
      <BenchmarksSection />
      <AccessSection />
      <CtaSection />
      <Footer />
    </main>
  );
}