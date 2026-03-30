'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppNav from '@/components/ui/AppNav';
import { usePlaybook } from '@/hooks/usePlaybook';
import { useBoardStore } from '@/lib/store';
import type { Phase } from '@/lib/store';

type Tab = 'plays' | 'save' | 'edit' | 'delete';

const PRESET_CATEGORIES = [
  { value: 'attack', label: 'Attack' },
  { value: 'defence', label: 'Defence' },
  { value: 'kickout', label: 'Kick-out' },
  { value: 'setpiece', label: 'Set piece' },
];

interface EditState {
  id: string;
  name: string;
  category: string;
  customCategory: string;
  notes: string;
}

export default function PlaybookPage() {
  const router = useRouter();
  const { plays, loading, savePlay, updatePlay, deletePlay, duplicatePlay } = usePlaybook();
  const { phases, sport, playerNames, loadPlay } = useBoardStore();

  // Tab
  const [tab, setTab] = useState<Tab>('plays');

  // My Plays tab
  const [filter, setFilter] = useState('all');
  const [duplicating, setDuplicating] = useState<string | null>(null);

  // Save tab
  const [saveName, setSaveName] = useState('');
  const [saveCategory, setSaveCategory] = useState('attack');
  const [saveCustomCategory, setSaveCustomCategory] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  // Edit tab
  const [editing, setEditing] = useState<EditState | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete tab
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const uniqueCategories = Array.from(new Set(plays.map(p => p.category)));
  const filterOptions = ['all', ...uniqueCategories];
  const filteredPlays = filter === 'all' ? plays : plays.filter(p => p.category === filter);

  /* ── My Plays ── */
  function handleOpen(play: { id: string; phases: unknown[]; sport: string; player_names?: Record<string, Record<string, string>> }) {
    loadPlay(
      play.phases as Phase[],
      play.sport as 'gaa' | 'hurling' | 'soccer',
      play.player_names as Record<'home' | 'away', Record<number, string>> | undefined,
    );
    router.push('/board');
  }

  async function handleDuplicate(playId: string) {
    setDuplicating(playId);
    try {
      await duplicatePlay(playId);
    } finally {
      setDuplicating(null);
    }
  }

  /* ── Save Play ── */
  async function handleSave() {
    const name = saveName.trim();
    if (!name) return;
    const finalCategory = saveCustomCategory.trim() || saveCategory;

    setSaving(true);
    setSaveError(null);
    try {
      await savePlay(
        name,
        finalCategory,
        sport,
        phases as unknown[],
        saveNotes.trim() || undefined,
        playerNames as Record<string, Record<string, string>>,
      );
      setSavedOk(true);
      setSaveName('');
      setSaveNotes('');
      setSaveCustomCategory('');
      setSaveCategory('attack');
      setTimeout(() => {
        setSavedOk(false);
        setTab('plays');
      }, 1500);
    } catch (err) {
      if (err instanceof Error && err.message === 'FREE_LIMIT') {
        setSaveError('Free plan limit reached (3 plays). Upgrade to save more.');
      } else {
        setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  /* ── Edit Play ── */
  function startEdit(play: { id: string; name: string; category: string; notes?: string }) {
    const isPreset = PRESET_CATEGORIES.some(c => c.value === play.category);
    setEditing({
      id: play.id,
      name: play.name,
      category: isPreset ? play.category : '',
      customCategory: isPreset ? '' : play.category,
      notes: play.notes ?? '',
    });
    setEditError(null);
  }

  async function handleSaveEdit() {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) return;
    const finalCategory = editing.customCategory.trim() || editing.category;
    if (!finalCategory) return;

    setEditSaving(true);
    setEditError(null);
    try {
      await updatePlay(editing.id, {
        name,
        category: finalCategory,
        notes: editing.notes.trim() || null,
      });
      setEditing(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setEditSaving(false);
    }
  }

  /* ── Delete Play ── */
  async function handleDelete(playId: string) {
    setDeleting(playId);
    setDeleteError(null);
    try {
      await deletePlay(playId);
      setConfirmDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete');
      setConfirmDelete(null);
    } finally {
      setDeleting(null);
    }
  }

  /* ── Tab bar ── */
  const TABS: { id: Tab; label: string }[] = [
    { id: 'plays', label: 'My Plays' },
    { id: 'save', label: 'Save Play' },
    { id: 'edit', label: 'Edit Play' },
    { id: 'delete', label: 'Delete Play' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:pb-0 pb-20" style={{ background: 'var(--bg)' }}>
      <AppNav />
      <div className="max-w-3xl mx-auto w-full p-6 flex-1">

        {/* Header */}
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

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 rounded-xl p-1" style={{ background: 'var(--bg2)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setEditing(null); setConfirmDelete(null); setDeleteError(null); setSaveError(null); }}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: tab === t.id ? 'var(--acc)' : 'transparent',
                color: tab === t.id ? '#0b0f18' : 'var(--txt2)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── MY PLAYS TAB ── */}
        {tab === 'plays' && (
          <>
            {/* Category filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {filterOptions.map(cat => (
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
              <p className="text-sm" style={{ color: 'var(--txt2)' }}>Loading...</p>
            ) : filteredPlays.length === 0 ? (
              <div className="text-center py-20" style={{ color: 'var(--txt2)' }}>
                <p className="text-lg mb-2">No plays saved yet</p>
                <button
                  onClick={() => setTab('save')}
                  className="text-sm"
                  style={{ color: 'var(--acc)' }}
                >
                  Save your first play
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredPlays.map(play => (
                  <div
                    key={play.id}
                    className="p-4 rounded-xl"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: 'var(--txt)' }}>{play.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--txt2)' }}>
                          {play.category} · {play.sport?.toUpperCase()} · {(play.phases as unknown[]).length} phase{(play.phases as unknown[]).length !== 1 ? 's' : ''}
                        </p>
                        {play.notes && (
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--txt2)' }}>
                            {play.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleOpen(play)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ background: 'var(--acc)', color: '#0b0f18' }}
                        >
                          Open
                        </button>
                        <button
                          onClick={() => handleDuplicate(play.id)}
                          disabled={duplicating === play.id}
                          className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-60"
                          style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}
                        >
                          {duplicating === play.id ? '...' : 'Duplicate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── SAVE PLAY TAB ── */}
        {tab === 'save' && (
          <div className="flex flex-col gap-4">
            <div
              className="p-4 rounded-xl text-sm"
              style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', color: 'var(--txt2)' }}
            >
              Saving current board state · <strong style={{ color: 'var(--txt)' }}>{phases.length} phase{phases.length !== 1 ? 's' : ''}</strong> · <strong style={{ color: 'var(--txt)' }}>{sport.toUpperCase()}</strong>
            </div>

            <input
              type="text"
              placeholder="Play name"
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              autoFocus
              className="px-4 py-3 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs" style={{ color: 'var(--txt2)' }}>Category</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => { setSaveCategory(c.value); setSaveCustomCategory(''); }}
                    className="py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: saveCategory === c.value && !saveCustomCategory ? 'var(--acc)' : 'var(--bg2)',
                      color: saveCategory === c.value && !saveCustomCategory ? '#0b0f18' : 'var(--txt2)',
                      border: '1px solid var(--bdr)',
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or enter custom category"
                value={saveCustomCategory}
                onChange={e => setSaveCustomCategory(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs" style={{ color: 'var(--txt2)' }}>Notes (optional)</label>
              <textarea
                placeholder="Add notes about this play..."
                value={saveNotes}
                onChange={e => setSaveNotes(e.target.value)}
                rows={3}
                className="px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
              />
            </div>

            {saveError && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {saveError}
              </p>
            )}

            {savedOk && (
              <p className="text-sm px-3 py-2 rounded-lg text-center font-medium" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.3)' }}>
                Play saved ✓ — taking you to My Plays...
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={!saveName.trim() || saving || savedOk}
              className="w-full py-3 rounded-lg text-sm font-semibold disabled:opacity-60 transition-all"
              style={{ background: 'var(--acc)', color: '#0b0f18' }}
            >
              {saving ? 'Saving...' : 'Save Play'}
            </button>
          </div>
        )}

        {/* ── EDIT PLAY TAB ── */}
        {tab === 'edit' && (
          <>
            {editError && (
              <p className="mb-4 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {editError}
              </p>
            )}

            {loading ? (
              <p className="text-sm" style={{ color: 'var(--txt2)' }}>Loading...</p>
            ) : plays.length === 0 ? (
              <div className="text-center py-20" style={{ color: 'var(--txt2)' }}>
                <p className="text-lg mb-2">No plays to edit</p>
                <button onClick={() => setTab('save')} className="text-sm" style={{ color: 'var(--acc)' }}>
                  Save your first play
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {plays.map(play => {
                  const isEditing = editing?.id === play.id;
                  return (
                    <div
                      key={play.id}
                      className="rounded-xl overflow-hidden"
                      style={{ background: 'var(--bg2)', border: `1px solid ${isEditing ? 'var(--acc)' : 'var(--bdr)'}` }}
                    >
                      {/* Play header — always visible */}
                      <div
                        className="flex items-center justify-between p-4 gap-3"
                        style={{ borderBottom: isEditing ? '1px solid var(--bdr)' : 'none' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" style={{ color: 'var(--txt)' }}>{play.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--txt2)' }}>
                            {play.category} · {play.sport?.toUpperCase()}
                          </p>
                        </div>
                        <button
                          onClick={() => isEditing ? setEditing(null) : startEdit(play)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
                          style={{
                            background: isEditing ? 'var(--bg3)' : 'var(--acc)',
                            color: isEditing ? 'var(--txt2)' : '#0b0f18',
                          }}
                        >
                          {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                      </div>

                      {/* Edit form — shown when active */}
                      {isEditing && (
                        <div className="p-4 flex flex-col gap-3" style={{ background: 'var(--bg)' }}>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs" style={{ color: 'var(--txt2)' }}>Name</label>
                            <input
                              type="text"
                              value={editing.name}
                              onChange={e => setEditing({ ...editing, name: e.target.value })}
                              autoFocus
                              className="px-3 py-2 rounded-lg text-sm outline-none"
                              style={{ background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs" style={{ color: 'var(--txt2)' }}>Category</label>
                            <div className="grid grid-cols-2 gap-2">
                              {PRESET_CATEGORIES.map(c => (
                                <button
                                  key={c.value}
                                  onClick={() => setEditing({ ...editing, category: c.value, customCategory: '' })}
                                  className="py-2 rounded-lg text-xs font-medium"
                                  style={{
                                    background: editing.category === c.value && !editing.customCategory ? 'var(--acc)' : 'var(--bg2)',
                                    color: editing.category === c.value && !editing.customCategory ? '#0b0f18' : 'var(--txt2)',
                                    border: '1px solid var(--bdr)',
                                  }}
                                >
                                  {c.label}
                                </button>
                              ))}
                            </div>
                            <input
                              type="text"
                              placeholder="Or enter custom category"
                              value={editing.customCategory}
                              onChange={e => setEditing({ ...editing, customCategory: e.target.value, category: e.target.value ? '' : editing.category })}
                              className="px-3 py-2 rounded-lg text-xs outline-none"
                              style={{ background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs" style={{ color: 'var(--txt2)' }}>Notes</label>
                            <textarea
                              value={editing.notes}
                              onChange={e => setEditing({ ...editing, notes: e.target.value })}
                              placeholder="Add notes about this play..."
                              rows={3}
                              className="px-3 py-2 rounded-lg text-xs outline-none resize-none"
                              style={{ background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
                            />
                          </div>

                          <button
                            onClick={handleSaveEdit}
                            disabled={editSaving || !editing.name.trim() || (!editing.category && !editing.customCategory.trim())}
                            className="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                            style={{ background: 'var(--acc)', color: '#0b0f18' }}
                          >
                            {editSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── DELETE PLAY TAB ── */}
        {tab === 'delete' && (
          <>
            {deleteError && (
              <p className="mb-4 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {deleteError}
              </p>
            )}

            {loading ? (
              <p className="text-sm" style={{ color: 'var(--txt2)' }}>Loading...</p>
            ) : plays.length === 0 ? (
              <div className="text-center py-20" style={{ color: 'var(--txt2)' }}>
                <p>No plays saved yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs mb-2" style={{ color: 'var(--txt2)' }}>
                  Select a play to delete. This cannot be undone.
                </p>
                {plays.map(play => (
                  <div
                    key={play.id}
                    className="p-4 rounded-xl flex items-start justify-between gap-3"
                    style={{
                      background: 'var(--bg2)',
                      border: `1px solid ${confirmDelete === play.id ? 'rgba(239,68,68,0.5)' : 'var(--bdr)'}`,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--txt)' }}>{play.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--txt2)' }}>
                        {play.category} · {play.sport?.toUpperCase()} · {(play.phases as unknown[]).length} phase{(play.phases as unknown[]).length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {confirmDelete === play.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(play.id)}
                            disabled={deleting === play.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                            style={{ background: '#ef4444', color: '#fff' }}
                          >
                            {deleting === play.id ? 'Deleting...' : 'Confirm Delete'}
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
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
