'use client';

import Link from 'next/link';
import Footer from '@/components/ui/Footer';

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--bdr)' }}>
        <Link href="/" className="font-display text-xl tracking-widest" style={{ color: 'var(--acc)' }}>
          PLAYFORGE
        </Link>
      </div>

      <article className="max-w-3xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--txt)' }}>Privacy Policy</h1>

        <div style={{ color: 'var(--txt2)', lineHeight: '1.8' }}>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>What data we collect</h2>
            <p className="mb-4">
              Pitchside collects and stores the following information:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Your name (provided at registration)</li>
              <li>Your email address (used for authentication and communication)</li>
              <li>Your coaching content — the plays and playbooks you create</li>
              <li>Your selected sport preference (Gaelic Football, Hurling, or Soccer)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>Why we collect it</h2>
            <p className="mb-4">
              We collect this data to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Provide the Pitchside coaching tool service</li>
              <li>Store and retrieve your saved plays and playbooks</li>
              <li>Authenticate your account and maintain your session</li>
              <li>Personalize your experience (remembering your preferred sport)</li>
              <li>Contact you about your account if necessary</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>How it is stored</h2>
            <p className="mb-4">
              Your data is stored securely on EU-based servers provided by Supabase. We use industry-standard encryption and security measures to protect your information. Your plays and playbooks are private by default and are not accessible to other users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>How long we keep it</h2>
            <p className="mb-4">
              We retain your data for as long as your account is active. When you delete your account, all your personal information and coaching content will be permanently deleted from our servers within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>Your rights</h2>
            <p className="mb-4">
              Under the EU GDPR and the Irish Data Protection Act 2018, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong>Right of access:</strong> Request a copy of your data</li>
              <li><strong>Right to rectification:</strong> Correct inaccurate data</li>
              <li><strong>Right to erasure:</strong> Delete your data and account at any time</li>
              <li><strong>Right to restrict processing:</strong> Limit how we use your data</li>
              <li><strong>Right to data portability:</strong> Export your data in machine-readable format</li>
            </ul>
            <p className="mb-4">
              To exercise any of these rights, contact us at hello@pitchside.fyi.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>Data sharing</h2>
            <p className="mb-4">
              Pitchside will never sell, rent, or share your personal data with third parties. Your coaching content (plays and playbooks) is only shared if you explicitly choose to share it via WhatsApp or other sharing features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>Cookies</h2>
            <p className="mb-4">
              Pitchside uses only essential functional cookies to maintain your login session. We do not use tracking cookies, advertising cookies, or any analytics cookies that could identify you. A consent notice appears on your first visit.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>GDPR compliance</h2>
            <p className="mb-4">
              Pitchside fully complies with:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>EU General Data Protection Regulation (GDPR)</li>
              <li>Irish Data Protection Act 2018</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>How to contact us</h2>
            <p className="mb-4">
              If you have questions about your data, wish to exercise your rights, or have a privacy concern, contact us at:
            </p>
            <p className="font-semibold mb-4">
              Email: <a href="mailto:hello@pitchside.fyi" style={{ color: 'var(--acc)' }}>hello@pitchside.fyi</a>
            </p>
            <p className="mb-4">
              We will respond to all data requests within 30 days as required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>Changes to this policy</h2>
            <p>
              We may update this privacy policy from time to time. Material changes will be communicated to you via email. Your continued use of Pitchside after changes indicates your acceptance of the updated policy.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--bdr)' }}>
          <p style={{ color: 'var(--txt2)', fontSize: '0.875rem' }}>
            Last updated: March 2026
          </p>
        </div>
      </article>

      <Footer />
    </div>
  );
}
