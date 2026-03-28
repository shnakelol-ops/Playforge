'use client';

import Link from 'next/link';
import Footer from '@/components/ui/Footer';

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--bdr)' }}>
        <Link href="/" className="font-display text-xl tracking-widest" style={{ color: 'var(--acc)' }}>
          PLAYFORGE
        </Link>
      </div>

      <article className="max-w-3xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--txt)' }}>Terms of Service</h1>

        <div style={{ color: 'var(--txt2)', lineHeight: '1.8' }}>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>1. Service Description</h2>
            <p className="mb-4">
              PlayForge is a software tool designed for coaching use only. It enables coaches to create, animate, and share tactical plays for Gaelic Football, Hurling, and Soccer.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>2. User Content Ownership</h2>
            <p className="mb-4">
              <strong>You retain full ownership</strong> of all content you create using PlayForge, including:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Plays and playbooks you design</li>
              <li>Tactical formations and strategies</li>
              <li>Any annotations or notes you add</li>
            </ul>
            <p className="mb-4">
              PlayForge makes no claim to ownership or intellectual property rights over your user-created content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>3. License to Use</h2>
            <p className="mb-4">
              By using PlayForge, you grant us a non-exclusive, worldwide license to store, retrieve, and display your content as necessary to provide the service. This license does not grant us the right to sell, modify, or redistribute your content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>4. Free Plan</h2>
            <p className="mb-4">
              The Free plan includes:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Up to 3 saved plays</li>
              <li>1 sport selection</li>
              <li>Basic formations</li>
              <li>WhatsApp sharing</li>
            </ul>
            <p className="mb-4">
              PlayForge reserves the right to modify or discontinue the Free plan with 30 days&apos; notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>5. Paid Subscriptions</h2>
            <p className="mb-4">
              <strong>Pro Plan:</strong> €9.99/month or €79/year
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Unlimited plays</li>
              <li>All sports</li>
              <li>Multiple phases</li>
            </ul>
            <p className="mb-4">
              <strong>Club Plan:</strong> €399/year for up to 15 coaches
            </p>
            <p className="mb-4">
              <strong>County Plan:</strong> Custom pricing
            </p>
            <p className="mb-4">
              Subscriptions are recurring and will renew automatically unless cancelled.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>6. Cancellation and Refunds</h2>
            <p className="mb-4">
              You may cancel your subscription at any time through your account settings. No further charges will be incurred after cancellation.
            </p>
            <p className="mb-4">
              <strong>Refund Policy:</strong> We offer refunds within 14 days of first purchase if the service has not been materially used (fewer than 5 plays created). This complies with EU consumer law. Refunds requested after 14 days may be denied at our discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>7. Prohibited Uses</h2>
            <p className="mb-4">
              You agree not to use PlayForge for:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Any illegal activities or purposes</li>
              <li>Harassment, abuse, or threats</li>
              <li>Violating third-party intellectual property rights</li>
              <li>Distributing malware or harmful code</li>
              <li>Attempting to gain unauthorized access to the service</li>
              <li>Reselling the service without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>8. Account Termination</h2>
            <p className="mb-4">
              PlayForge reserves the right to suspend or terminate your account if:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>You violate these Terms of Service</li>
              <li>You engage in illegal activity</li>
              <li>You abuse the service or other users</li>
              <li>Payment fails and remains unpaid for 30 days</li>
            </ul>
            <p className="mb-4">
              Upon termination, your account data will be deleted within 30 days unless you request a data export.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>9. Disclaimer of Warranties</h2>
            <p className="mb-4">
              PlayForge is provided &quot;as is&quot; without warranties of any kind. We make no guarantee that:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>The service will be uninterrupted or error-free</li>
              <li>Your data will never be lost (though we use backups)</li>
              <li>The service is suitable for your specific coaching needs</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>10. Limitation of Liability</h2>
            <p className="mb-4">
              PlayForge and its creators shall not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Loss of data or content</li>
              <li>Loss of revenue or profits</li>
              <li>Indirect or consequential damages</li>
              <li>Results or outcomes from using tactics created in PlayForge</li>
            </ul>
            <p className="mb-4">
              Our total liability shall not exceed the amount you have paid us in the past 12 months.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>11. Governing Law and Jurisdiction</h2>
            <p className="mb-4">
              These Terms of Service are governed by the laws of the Republic of Ireland and shall be construed in accordance with Irish law.
            </p>
            <p className="mb-4">
              Any disputes arising from or relating to these Terms shall be submitted to the exclusive jurisdiction of the courts of Ireland.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>12. Dispute Resolution</h2>
            <p className="mb-4">
              Before initiating legal proceedings, users and PlayForge agree to attempt to resolve disputes through good-faith negotiation. If negotiation fails, disputes will be resolved by the Irish courts.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>13. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms or the service:
            </p>
            <p className="font-semibold mb-4">
              Email: <a href="mailto:hello@playforge.app" style={{ color: 'var(--acc)' }}>hello@playforge.app</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--txt)' }}>14. Changes to Terms</h2>
            <p className="mb-4">
              We may update these Terms of Service at any time. Significant changes will be communicated to you via email. Your continued use of PlayForge after changes constitutes acceptance of the updated Terms.
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
