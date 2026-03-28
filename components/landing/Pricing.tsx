import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '€0',
    period: 'forever',
    features: ['3 plays', '1 sport', 'Basic formations', 'WhatsApp share'],
    cta: 'Get started',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '€9.99',
    period: 'per month',
    alt: '€79/year',
    features: ['Unlimited plays', 'All sports', 'Multiple phases', 'PDF export (coming soon)'],
    cta: 'Go Pro',
    href: '/register',
    highlight: true,
  },
  {
    name: 'Club',
    price: '€399',
    period: 'per year',
    features: ['Up to 15 coaches', 'Shared playbook', 'Admin dashboard', 'All Pro features'],
    cta: 'Contact us',
    href: 'mailto:hello@pitchside.fyi',
    highlight: false,
  },
  {
    name: 'County',
    price: 'Custom',
    period: '',
    features: ['Unlimited coaches', 'White-label option', 'API access', 'Dedicated support'],
    cta: 'Get in touch',
    href: 'mailto:hello@pitchside.fyi',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4" style={{ color: 'var(--txt)' }}>
          Simple, transparent pricing
        </h2>
        <p className="text-center mb-16" style={{ color: 'var(--txt2)' }}>
          Start free. Upgrade when you need more.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map(plan => (
            <div
              key={plan.name}
              className="p-6 rounded-2xl flex flex-col"
              style={{
                background: plan.highlight ? 'var(--acc)' : 'var(--bg2)',
                border: `1px solid ${plan.highlight ? 'var(--acc)' : 'var(--bdr)'}`,
              }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: plan.highlight ? '#0b0f18' : 'var(--txt2)' }}>
                {plan.name}
              </p>
              <p className="text-3xl font-bold mb-1" style={{ color: plan.highlight ? '#0b0f18' : 'var(--txt)' }}>
                {plan.price}
              </p>
              {plan.period && (
                <p className="text-xs mb-1" style={{ color: plan.highlight ? 'rgba(0,0,0,0.6)' : 'var(--txt2)' }}>
                  {plan.period}
                </p>
              )}
              {plan.alt && (
                <p className="text-xs mb-4" style={{ color: plan.highlight ? 'rgba(0,0,0,0.5)' : 'var(--txt2)' }}>
                  or {plan.alt}
                </p>
              )}
              <ul className="flex-1 space-y-2 my-4">
                {plan.features.map(f => (
                  <li key={f} className="text-sm flex items-start gap-2">
                    <span style={{ color: plan.highlight ? '#0b0f18' : 'var(--acc)' }}>✓</span>
                    <span style={{ color: plan.highlight ? '#0b0f18' : 'var(--txt2)' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className="block text-center py-2.5 rounded-xl text-sm font-semibold mt-4 transition-all"
                style={{
                  background: plan.highlight ? '#0b0f18' : 'var(--acc)',
                  color: plan.highlight ? 'var(--acc)' : '#0b0f18',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
