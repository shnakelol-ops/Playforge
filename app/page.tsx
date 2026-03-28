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
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <p className="font-display text-xl tracking-widest" style={{ color: 'var(--acc)' }}>PITCHSIDE</p>
            <div className="flex gap-6 text-sm flex-wrap justify-center" style={{ color: 'var(--txt2)' }}>
              <Link href="/pricing" style={{ color: 'var(--txt2)' }}>Pricing</Link>
              <a href="mailto:hello@pitchside.fyi" style={{ color: 'var(--txt2)' }}>Contact</a>
              <Link href="/privacy" style={{ color: 'var(--txt2)' }}>Privacy Policy</Link>
              <Link href="/terms" style={{ color: 'var(--txt2)' }}>Terms</Link>
            </div>
            <p className="text-xs" style={{ color: 'var(--txt2)' }}>© 2025 Pitchside</p>
          </div>
          <p className="text-xs max-w-3xl mx-auto text-center" style={{ color: 'var(--txt2)', lineHeight: '1.6' }}>
            Pitchside is an independent coaching tool and is not affiliated with, endorsed by, or connected to the GAA, the FAI, or any sporting governing body.
          </p>
        </div>
      </footer>
    </main>
  );
}
