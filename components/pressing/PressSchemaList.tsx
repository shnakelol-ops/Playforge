'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePressSchemas } from '@/hooks/usePressSchemas';
import { usePressStore } from '@/lib/press-store';
import type { PressSchema } from '@/lib/press-types';

const ZONE_COLORS = {
  high: '#ef4444',
  mid: '#f59e0b',
  low: '#3b82f6',
};

export default function PressSchemaList() {
  const { listSchemas, deleteSchema, loading } = usePressSchemas();
  const { loadSchema } = usePressStore();
  const [schemas, setSchemas] = useState<PressSchema[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadSchemasData = useCallback(async () => {
    try {
      const data = await listSchemas();
      setSchemas(data);
    } catch {
      // Silent fail - schemas may not exist yet
    }
  }, [listSchemas]);

  useEffect(() => {
    loadSchemasData();
  }, [loadSchemasData]);

  async function handleDelete(id: string) {
    try {
      await deleteSchema(id);
      setSchemas(schemas.filter(s => s.id !== id));
      setDeleteConfirm(null);
    } catch {
      // Silent fail
    }
  }

  async function handleLoad(schema: PressSchema) {
    loadSchema(schema);
  }

  if (loading || schemas.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--txt2)' }}>
        <p className="text-sm">No saved pressing schemas yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--txt)' }}>
        Saved Schemas
      </h3>
      {schemas.map(schema => (
        <div
          key={schema.id}
          className="flex flex-col p-3 rounded-lg gap-2"
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: ZONE_COLORS[schema.zoneConfig.zone] }}
                />
                <p className="text-sm font-medium" style={{ color: 'var(--txt)' }}>
                  {schema.name}
                </p>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--txt2)' }}>
                {schema.sport.toUpperCase()} · {schema.activeTriggers.length} trigger
                {schema.activeTriggers.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleLoad(schema)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                style={{ background: 'var(--acc)', color: '#0b0f18' }}
              >
                Load
              </button>
              {deleteConfirm === schema.id ? (
                <>
                  <button
                    onClick={() => handleDelete(schema.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: '#ef4444', color: '#fff' }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ color: 'var(--txt2)' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(schema.id)}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{ color: 'var(--txt2)' }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
