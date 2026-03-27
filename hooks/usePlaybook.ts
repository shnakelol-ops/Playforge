'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';

export interface SavedPlay {
  id: string;
  name: string;
  category: string;
  sport: string;
  phases: unknown[];
  created_at: string;
}

export function usePlaybook() {
  const [plays, setPlays] = useState<SavedPlay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlays = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('plays')
      .select('*')
      .order('created_at', { ascending: false });
    setPlays(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlays();
  }, [fetchPlays]);

  async function savePlay(name: string, category: string, sport: string, phases: unknown[]) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check plan limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profile?.plan === 'free' && plays.length >= 3) {
      throw new Error('FREE_LIMIT');
    }

    await supabase.from('plays').insert({
      user_id: user.id,
      name,
      category,
      sport,
      phases,
    });

    await fetchPlays();
  }

  async function deletePlay(id: string) {
    const supabase = createClient();
    await supabase.from('plays').delete().eq('id', id);
    setPlays(prev => prev.filter(p => p.id !== id));
  }

  return { plays, loading, savePlay, deletePlay, refetch: fetchPlays };
}
