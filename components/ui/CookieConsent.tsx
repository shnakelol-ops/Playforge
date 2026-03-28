'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the cookie notice
    const cookieConsent = localStorage.getItem('playforge-cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  function handleAccept() {
    // Set a cookie and localStorage to remember the consent
    localStorage.setItem('playforge-cookie-consent', 'accepted');
    // Also set an actual cookie
    document.cookie = 'playforge-cookie-consent=accepted; path=/; max-age=' + (365 * 24 * 60 * 60);
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
    >
      <div
        className="max-w-2xl mx-auto p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}
      >
        <p className="text-sm" style={{ color: 'var(--txt2)' }}>
          PlayForge uses essential cookies only to keep you logged in. No tracking or advertising cookies are used.
        </p>
        <button
          onClick={handleAccept}
          className="px-6 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
          style={{ background: 'var(--acc)', color: '#0b0f18' }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
