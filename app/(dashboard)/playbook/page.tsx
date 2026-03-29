'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppNav from '@/components/ui/AppNav';
import { usePlaybook } from '@/hooks/usePlaybook';
import { useBoardStore } from '@/lib/store';
import type { Phase } from '@/lib/store';

const PRESET_CATEGORIES = ['attack', 'defence', 'kickout', 'setpiece'];

interface EditState {
  id: string;
  name: string;
  category: string;
  customCategory: string;
  notes: string;
}

export default function PlaybookPage() {
  const router = useRouter();
  const { plays, loading, updatePlay, deletePlay, duplicatePlay } = usePlaybook();
  const { loadPlay } = useBoardStore();
  const [filter, setFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const uniqueCategories = Array.from(new Set(plays.map(p => p.category)));
  const categories = ['all', ...uniqueCategories];
  const filtered = filter === 'all' ? plays : plays.filter(p => p.category === filter);

  function handleLoad(play: { id: string; phases: unknown[]; sport: string; player_names?: Record<string, Record<string, string>> }) {
    loadPlay(
      play.phases as Phase[],
      play.sport as 'gaa' | 'hurling' | 'soccer',
      play.player_names as Record<'home' | 'away', Record<number, string>> | undefined,
    );
    router.push('/board');
  }

  function startEdit(play: { id: string; name: string; category: string; notes?: string }) {
    const isPreset = PRESET_CATEGORIES.includes(play.category);
    setEditing({
      id: play.id,
      name: play.name,
      category: isPreset ? play.category : '',
      customCategory: isPreset ? '' : play.category,
      notes: play.notes ?? '',
    });
    setSaveError(null);
  }

  async function handleSaveEdit() {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) return;
    const finalCategory = editing.customCategory.trim() || editing.category;
    if (!finalCategory) return;

    setSaving(true);
    setSaveError(null);
    try {
      await updatePlay(editing.id, {
        name,
        category: finalCategory,
        notes: editing.notes.trim() || null,
      });
      setEditing(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(playId: string) {
    setDeleteError(null);
    try {
      await deletePlay(playId);
      setConfirmDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete');
      setConfirmDelete(null);
    }
  }

  async function handleDuplicate(playId: string) {
    setDuplicating(playId);
    try {
      await duplicatePlay(playId);
    } finally {
      setDuplicating(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:pb-0 pb-20" style={{ background: 'var(--bg)' }}>
      <AppNav />
      <div className="max-w-3xl mx-auto w-full p-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--txt)' }}>My Playbook</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--txt2)' }}>
              {plays.length} saved play{plays.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/board"
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--acc)', color: '#0b0f18' }}
          >
            + New play
          </Link>
        </div>

        {deleteError && (
          <p className="mb-4 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {deleteError}
          </p>
        )}

        {/* Category filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-4 py-1.5 rounded-lg text-sm capitalize whitespace-nowrap"
              style={{
                background: filter === cat ? 'var(--acc)' : 'var(--bg2)',
                color: filter === cat ? '#0b0f18' : 'var(--txt2)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--txt2)' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--txt2)' }}>
            <p className="text-lg mb-2">No plays saved yet</p>
            <Link href="/board" style={{ color: 'var(--acc)' }}>Create your first play</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(play => {
              const isEditing = editing?.id === play.id;

              return (
                <div
                  key={play.id}
                  className="rounded-xl"
                  style={{ background: 'var(--bg2)', border: `1px solid ${isEditing ? 'var(--acc)' : 'var(--bdr)'}` }}
                >
                  {isEditing ? (
                    /* Edit mode */
                    <div className="p-4 flex flex-col gap-3">
                      <input
                        type="text"
                        value={editing.name}
                        onChange={e => setEditing({ ...editing, name: e.target.value })}
                        placeholder="Play name"
                        autoFocus
                        className="px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
                      />

                      <div className="flex flex-col gap-1">
                        <label className="text-xs" style={{ color: 'var(--txt2)' }}>Category</label>
                        <div className="flex gap-2 flex-wrap">
                          {PRESET_CATEGORIES.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setEditing({ ...editing, category: cat, customCategory: '' })}
                              className="px-3 py-1 rounded-lg text-xs capitalize"
                              style={{
                                background: editing.category === cat && !editing.customCategory ? 'var(--acc)' : 'var(--bg3)',
                                color: editing.category === cat && !editing.customCategory ? '#0b0f18' : 'var(--txt2)',
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Or enter custom category"
                          value={editing.customCategory}
                          onChange={e => setEditing({ ...editing, customCategory: e.target.value, category: e.target.value ? '' : editing.category })}
                          className="mt-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                          style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
                        />
                      </div>

                      <textarea
                        value={editing.notes}
                        onChange={e => setEditing({ ...editing, notes: e.target.value })}
                        placeholder="Notes (optional)"
                        rows={2}
                        className="px-3 py-2 rounded-lg text-xs outline-none resize-none"
                        style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
                      />

                      {saveError && (
                        <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)' }}>
                          {saveError}
                        </p>
                      )}

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditing(null)}
                          className="px-3 py-1.5 rounded-lg text-xs"
                          style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={saving || !editing.name.trim() || (!editing.category && !editing.customCategory.trim())}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                          style={{ background: 'var(--acc)', color: '#0b0f18' }}
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          onClick={() => startEdit(play)}
                          className="flex-1 text-left"
                        >
                          <p className="font-medium" style={{ color: 'var(--txt)' }}>{play.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--txt2)' }}>
                            {play.category} · {play.sport?.toUpperCase()} · {(play.phases as unknown[]).length} phase{(play.phases as unknown[]).length !== 1 ? 's' : ''}
                          </p>
                          {play.notes && (
                            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--txt2)' }}>
                              {play.notes}
                            </p>
                          )}
                        </button>

                        <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                          <button
                            onClick={() => handleLoad(play)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                            style={{ background: 'var(--acc)', color: '#0b0f18' }}
                          >
                            Open
                          </button>
                          <button
                            onClick={() => startEdit(play)}
                            className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
                            style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(play.id)}
                            disabled={duplicating === play.id}
                            className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap disabled:opacity-60"
                            style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}
                          >
                            {duplicating === play.id ? 'Copying...' : 'Duplicate'}
                          </button>
                          {confirmDelete === play.id ? (
                            <>
                              <button
                                onClick={() => handleDelete(play.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                style={{ background: '#ef4444', color: '#fff' }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-3 py-1.5 rounded-lg text-xs"
                                style={{ color: 'var(--txt2)' }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(play.id)}
                              className="px-3 py-1.5 rounded-lg text-xs"
                              style={{ color: 'var(--txt2)' }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
