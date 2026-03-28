'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-solid" style={{ borderColor: 'var(--bdr)', background: 'var(--bg2)' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-lg tracking-widest mb-4" style={{ color: 'var(--acc)' }}>
              PLAYFORGE
            </h3>
            <p className="text-sm" style={{ color: 'var(--txt2)' }}>
              The professional tactics platform for Gaelic Football, Hurling, and Soccer coaches.
            </p>
            <p className="text-xs mt-4" style={{ color: 'var(--txt3)' }}>
              © 2025 PlayForge. All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase" style={{ color: 'var(--txt)' }}>
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/board" style={{ color: 'var(--txt2)' }} className="hover:text-accent transition-colors">
                  Tactics Board
                </Link>
              </li>
              <li>
                <Link href="/playbook" style={{ color: 'var(--txt2)' }} className="hover:text-accent transition-colors">
                  Playbook
                </Link>
              </li>
              <li>
                <Link href="/pressing" style={{ color: 'var(--txt2)' }} className="hover:text-accent transition-colors">
                  Pressing System
                </Link>
              </li>
              <li>
                <Link href="/pricing" style={{ color: 'var(--txt2)' }} className="hover:text-accent transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase" style={{ color: 'var(--txt)' }}>
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" style={{ color: 'var(--txt2)' }} className="hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" style={{ color: 'var(--txt2)' }} className="hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:hello@playforge.app" style={{ color: 'var(--txt2)' }} className="hover:text-accent transition-colors">
                  Contact: hello@playforge.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-solid pt-8" style={{ borderColor: 'var(--bdr)' }}>
          <p className="text-xs" style={{ color: 'var(--txt3)' }}>
            <strong>Important Disclaimer:</strong> PlayForge is not affiliated with, endorsed by, or associated with the GAA (Gaelic Athletic Association), the FAI (Football Association of Ireland), hurling governing bodies, or any other sporting governing organization. PlayForge is an independent coaching software platform created to help coaches create, visualize, and share tactical strategies.
          </p>
        </div>
      </div>
    </footer>
  );
}
