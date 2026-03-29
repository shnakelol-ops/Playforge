import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase';
import type { PressSchema, PressSchemaInsert } from '@/lib/press-types';

interface PressSchemaRow {
  id: string;
  user_id: string;
  name: string;
  sport: string;
  zone_config: Record<string, unknown>;
  player_roles: Record<string, unknown>;
  active_triggers: string[];
  press_phases: unknown[];
  post_press: Record<string, unknown>;
  created_at: string;
}

function mapRow(row: PressSchemaRow): PressSchema {
  // Re-coerce playerRoles keys from strings back to numbers
  const playerRoles: Record<number, any> = {};
  if (typeof row.player_roles === 'object' && row.player_roles !== null) {
    Object.entries(row.player_roles).forEach(([key, value]) => {
      playerRoles[Number(key)] = value;
    });
  }

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    sport: row.sport,
    zoneConfig: row.zone_config as any,
    playerRoles: playerRoles as any,
    activeTriggers: row.active_triggers,
    pressPhases: row.press_phases as any,
    postPress: row.post_press as any,
    created_at: row.created_at,
  };
}

export function usePressSchemas() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSchema = useCallback(
    async (schema: PressSchemaInsert) => {
      if (!user?.id) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const { data, error: err } = await supabase
          .from('press_schemas')
          .insert({
            user_id: user.id,
            name: schema.name,
            sport: schema.sport,
            zone_config: schema.zoneConfig,
            player_roles: schema.playerRoles,
            active_triggers: schema.activeTriggers,
            press_phases: schema.pressPhases,
            post_press: schema.postPress,
          })
          .select()
          .single();

        if (err) throw new Error(err.message);
        return mapRow(data as PressSchemaRow);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save schema';
        setError(message);
        throw err instanceof Error ? err : new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const loadSchema = useCallback(
    async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const { data, error: err } = await supabase
          .from('press_schemas')
          .select('*')
          .eq('id', id)
          .single();

        if (err) throw new Error(err.message);
        return mapRow(data as PressSchemaRow);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load schema';
        setError(message);
        throw err instanceof Error ? err : new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const listSchemas = useCallback(async () => {
    if (!user?.id) throw new Error('Not authenticated');
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from('press_schemas')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw new Error(err.message);
      return (data as PressSchemaRow[]).map(mapRow);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list schemas';
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const deleteSchema = useCallback(
    async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const { error: err } = await supabase
          .from('press_schemas')
          .delete()
          .eq('id', id);

        if (err) throw new Error(err.message);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete schema';
        setError(message);
        throw err instanceof Error ? err : new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  return {
    saveSchema,
    loadSchema,
    listSchemas,
    deleteSchema,
    loading,
    error,
  };
}
