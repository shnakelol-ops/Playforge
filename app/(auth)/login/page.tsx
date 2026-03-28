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
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl mb-8" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--txt)' }}>Welcome back</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>Sign in to Pitchside</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--txt2)' }}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="input w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--txt2)' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="input w-full"
            />
          </div>
          {error && <p className="text-red-400 text-sm p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm">
          <p style={{ color: 'var(--txt2)' }}>
            No account?{' '}
            <Link href="/register" style={{ color: 'var(--acc)' }} className="font-medium hover:underline">
              Create one free
            </Link>
          </p>
          <p style={{ color: 'var(--txt2)' }}>
            <Link href="#" style={{ color: 'var(--txt2)' }} className="hover:text-accent transition-colors">
              Forgot password?
            </Link>
          </p>
        </div>

        <p className="text-xs text-center mt-6 pt-6 border-t" style={{ color: 'var(--txt2)', borderColor: 'var(--bdr)' }}>
          <Link href="/privacy" style={{ color: 'var(--acc)', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          {' '}•{' '}
          <Link href="/terms" style={{ color: 'var(--acc)', textDecoration: 'underline' }}>
            Terms of Service
          </Link>
        </p>
      </div>

      <footer className="text-center text-xs max-w-sm" style={{ color: 'var(--txt2)', marginTop: 'auto', paddingBottom: '2rem' }}>
        Pitchside is an independent coaching tool and is not affiliated with, endorsed by, or connected to the GAA, the FAI, or any sporting governing body.
      </footer>
    </div>
  );
}
