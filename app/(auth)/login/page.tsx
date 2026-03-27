'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/board');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--txt)' }}>Welcome back</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>Sign in to PlayForge</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="px-4 py-3 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60"
            style={{ background: 'var(--acc)', color: '#0b0f18' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--txt2)' }}>
          No account?{' '}
          <Link href="/register" style={{ color: 'var(--acc)' }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
