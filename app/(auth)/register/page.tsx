'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sport, setSport] = useState('gaa');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!ageConfirmed) {
      setError('You must confirm you are 16 years or older');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, sport },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/board');
    }
  }

  const sportOptions = [
    { value: 'gaa', label: 'Gaelic Football' },
    { value: 'hurling', label: 'Hurling' },
    { value: 'soccer', label: 'Soccer' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl mb-8" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--txt)' }}>Create your account</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>Start free — no credit card needed</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--txt2)' }}>Full name</label>
            <input
              type="text"
              placeholder="John Smith"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              className="input w-full"
              style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--txt2)' }}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="input w-full"
              style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--txt2)' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
              className="input w-full"
              style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--txt2)' }}>Minimum 6 characters</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: 'var(--txt2)' }}>Primary sport</label>
            <div className="flex gap-2">
              {sportOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSport(opt.value)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: sport === opt.value ? 'var(--acc)' : 'var(--bg3)',
                    color: sport === opt.value ? '#0b0f18' : 'var(--txt2)',
                    border: `1px solid ${sport === opt.value ? 'var(--acc)' : 'var(--bdr)'}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>{error}</p>}

          <div className="flex items-start gap-3 my-2">
            <input
              type="checkbox"
              id="age-confirm"
              checked={ageConfirmed}
              onChange={e => setAgeConfirmed(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="age-confirm" className="text-xs" style={{ color: 'var(--txt2)' }}>
              I confirm I am 16 years of age or older
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60 mt-4"
            style={{ background: 'var(--acc)', color: '#0b0f18' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--txt2)' }}>
            By creating an account you agree to our{' '}
            <Link href="/terms" style={{ color: 'var(--acc)', textDecoration: 'underline' }}>
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: 'var(--acc)', textDecoration: 'underline' }}>
              Privacy Policy
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--txt2)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--acc)' }} className="font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <footer className="text-center text-xs max-w-sm" style={{ color: 'var(--txt2)', marginTop: 'auto', paddingBottom: '2rem' }}>
        Pitchside is an independent coaching tool and is not affiliated with, endorsed by, or connected to the GAA, the FAI, or any sporting governing body.
      </footer>
    </div>
  );
}
