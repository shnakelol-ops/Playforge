'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardNav from '@/components/ui/DashboardNav';
import { usePlaybook } from '@/hooks/usePlaybook';
import { useBoardStore } from '@/lib/store';
import type { Phase } from '@/lib/store';

export default function PlaybookPage() {
  const { plays, loading, deletePlay, duplicatePlay } = usePlaybook();
  const { loadPlay } = useBoardStore();
  const [filter, setFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  // Get dynamic categories from plays
  const uniqueCategories = Array.from(new Set(plays.map(p => p.category)));
  const categories = ['all', ...uniqueCategories];

  const filtered = filter === 'all' ? plays : plays.filter(p => p.category === filter);

  function handleLoad(play: { phases: unknown[]; sport: string }) {
    loadPlay(play.phases as Phase[], play.sport as 'gaa' | 'hurling' | 'soccer');
    window.location.href = '/board';
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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <DashboardNav />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--txt)' }}>My Playbook</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--txt2)' }}>{plays.length} saved play{plays.length !== 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/board"
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--acc)', color: '#0b0f18' }}
          >
            + New play
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
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
            {filtered.map(play => (
              <div
                key={play.id}
                className="flex flex-col p-4 rounded-xl"
                style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: 'var(--txt)' }}>{play.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--txt2)' }}>
                      {play.category} · {play.sport?.toUpperCase()} · {(play.phases as unknown[]).length} phase{(play.phases as unknown[]).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoad(play)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                      style={{ background: 'var(--acc)', color: '#0b0f18' }}
                    >
                      Load
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
                          onClick={() => { deletePlay(play.id); setConfirmDelete(null); }}
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
                {play.notes && (
                  <p className="text-xs mt-2 line-clamp-2 max-w-lg" style={{ color: 'var(--txt2)' }}>
                    {play.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
