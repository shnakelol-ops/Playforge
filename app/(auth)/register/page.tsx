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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
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
    { value: 'gaa', label: 'GAA Football' },
    { value: 'hurling', label: 'GAA Hurling' },
    { value: 'soccer', label: 'Soccer' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--txt)' }}>Create your account</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>Start free — no credit card needed</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            className="px-4 py-3 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-4 py-3 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            required
            className="px-4 py-3 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
          />
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

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60"
            style={{ background: 'var(--acc)', color: '#0b0f18' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--txt2)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--acc)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
