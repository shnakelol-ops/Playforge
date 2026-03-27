import Pricing from '@/components/landing/Pricing';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--bdr)' }}>
        <Link href="/" className="font-display text-xl tracking-widest" style={{ color: 'var(--acc)' }}>
          PLAYFORGE
        </Link>
      </div>
      <Pricing />
    </div>
  );
}
