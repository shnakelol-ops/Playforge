import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />

      {/* Footer */}
      <footer className="py-12 px-6" style={{ background: 'var(--bg)', borderTop: '1px solid var(--bdr)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display text-xl tracking-widest" style={{ color: 'var(--acc)' }}>PLAYFORGE</p>
          <div className="flex gap-6 text-sm flex-wrap justify-center" style={{ color: 'var(--txt2)' }}>
            <Link href="/pricing" style={{ color: 'var(--txt2)' }}>Pricing</Link>
            <a href="mailto:hello@playforge.app" style={{ color: 'var(--txt2)' }}>Contact</a>
            <span>Privacy Policy</span>
            <span>Terms</span>
            <span>GDPR</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--txt2)' }}>© 2025 PlayForge</p>
        </div>
      </footer>
    </main>
  );
}
