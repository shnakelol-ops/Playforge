const features = [
  {
    icon: '▶',
    title: 'Live animated plays',
    desc: 'Watch your tactics come to life with smooth player movement animations.',
  },
  {
    icon: '⚡',
    title: 'Multi-phase tactics',
    desc: 'Build plays with multiple phases — Phase 1 flows directly into Phase 2.',
  },
  {
    icon: '🏐',
    title: 'Multiple sport pitches',
    desc: 'Full support for Gaelic Football, Hurling, and Soccer with accurate pitch markings.',
  },
  {
    icon: '🔒',
    title: 'Private encrypted playbook',
    desc: 'Your plays are private by default. Only you can see your playbook.',
  },
  {
    icon: '💬',
    title: 'Share via WhatsApp',
    desc: 'Send a formatted play breakdown directly to your players in one tap.',
  },
  {
    icon: '📱',
    title: 'Works on all devices',
    desc: 'Designed mobile-first. Use it pitchside on your phone or plan at home on your laptop.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6" style={{ background: 'var(--bg2)' }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4" style={{ color: 'var(--txt)' }}>
          Everything you need to coach better
        </h2>
        <p className="text-center mb-16" style={{ color: 'var(--txt2)' }}>
          Built for coaches who take tactics seriously.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div
              key={f.title}
              className="p-6 rounded-2xl"
              style={{ background: 'var(--bg)', border: '1px solid var(--bdr)' }}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--txt)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--txt2)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
