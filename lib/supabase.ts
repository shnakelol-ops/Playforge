import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('[Supabase] NEXT_PUBLIC_SUPABASE_URL is not set — check Vercel environment variables');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set — check Vercel environment variables');
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
