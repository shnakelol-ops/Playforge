'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';

export interface SavedPlay {
  id: string;
  name: string;
  category: string;
  sport: string;
  phases: unknown[];
  notes?: string;
  created_at: string;
}

export function usePlaybook() {
  const [plays, setPlays] = useState<SavedPlay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlays = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('plays')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('[fetchPlays] Supabase error:', error);
    setPlays(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlays();
  }, [fetchPlays]);

  async function savePlay(name: string, category: string, sport: string, phases: unknown[], notes?: string) {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('[savePlay] Auth error:', authError);
      throw new Error('Authentication error: ' + authError.message);
    }
    if (!user) throw new Error('Not authenticated');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profileError) console.error('[savePlay] Profile fetch error:', profileError);

    if (profile?.plan === 'free' && plays.length >= 3) {
      throw new Error('FREE_LIMIT');
    }

    console.log('[savePlay] Inserting play:', { name, category, sport, phaseCount: phases.length });

    const { error: insertError } = await supabase.from('plays').insert({
      user_id: user.id,
      name,
      category,
      sport,
      phases,
      notes,
    });

    if (insertError) {
      console.error('[savePlay] Insert error:', insertError);
      throw new Error(insertError.message);
    }

    console.log('[savePlay] Play saved successfully');
    await fetchPlays();
  }

  async function duplicatePlay(id: string) {
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

    // Find the play to duplicate
    const playToDuplicate = plays.find(p => p.id === id);
    if (!playToDuplicate) throw new Error('Play not found');

    // Create new play with "Copy" suffix
    const { error: dupError } = await supabase.from('plays').insert({
      user_id: user.id,
      name: `${playToDuplicate.name} Copy`,
      category: playToDuplicate.category,
      sport: playToDuplicate.sport,
      phases: playToDuplicate.phases,
      notes: playToDuplicate.notes,
    });

    if (dupError) {
      console.error('[duplicatePlay] Insert error:', dupError);
      throw new Error(dupError.message);
    }

    await fetchPlays();
  }

  async function updatePlay(id: string, updates: { name?: string; category?: string; notes?: string }) {
    const supabase = createClient();
    const { error } = await supabase.from('plays').update(updates).eq('id', id);
    if (error) {
      console.error('[updatePlay] Error:', error);
      throw new Error(error.message);
    }
    setPlays(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }

  async function deletePlay(id: string) {
    const supabase = createClient();
    await supabase.from('plays').delete().eq('id', id);
    setPlays(prev => prev.filter(p => p.id !== id));
  }

  return { plays, loading, savePlay, updatePlay, deletePlay, duplicatePlay, refetch: fetchPlays };
}
