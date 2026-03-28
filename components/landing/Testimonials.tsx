const testimonials = [
  {
    quote: "PlayForge has completely changed how I prepare for matches. I can show the players exactly what I want in seconds.",
    name: "Seán O'Brien",
    role: "Senior Football Manager, Club Gaelic",
  },
  {
    quote: "Finally an app designed for Gaelic and Hurling coaches, not just soccer. The hurling pitch is spot on.",
    name: "Aoife Ní Mhurchú",
    role: "Camogie Coach",
  },
  {
    quote: "Sending WhatsApp plays to my team before training has made a massive difference. They know exactly what's expected.",
    name: "David Walsh",
    role: "Under-21 Soccer Manager",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6" style={{ background: 'var(--bg2)' }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16" style={{ color: 'var(--txt)' }}>
          Trusted by coaches
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div
              key={t.name}
              className="p-6 rounded-2xl"
              style={{ background: 'var(--bg)', border: '1px solid var(--bdr)' }}
            >
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--txt)' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--txt)' }}>{t.name}</p>
                <p className="text-xs" style={{ color: 'var(--txt2)' }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
