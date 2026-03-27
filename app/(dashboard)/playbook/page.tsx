'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlaybook } from '@/hooks/usePlaybook';
import { useBoardStore } from '@/lib/store';
import type { Phase } from '@/lib/store';

const categories = ['all', 'attack', 'defence', 'kickout', 'setpiece'];

export default function PlaybookPage() {
  const { plays, loading, deletePlay } = usePlaybook();
  const { loadPlay } = useBoardStore();
  const [filter, setFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = filter === 'all' ? plays : plays.filter(p => p.category === filter);

  function handleLoad(play: { phases: unknown[]; sport: string }) {
    loadPlay(play.phases as Phase[], play.sport as 'gaa' | 'hurling' | 'soccer');
    window.location.href = '/board';
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto">
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
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}
              >
                <div>
                  <p className="font-medium" style={{ color: 'var(--txt)' }}>{play.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--txt2)' }}>
                    {play.category} · {play.sport?.toUpperCase()} · {(play.phases as unknown[]).length} phase{(play.phases as unknown[]).length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoad(play)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--acc)', color: '#0b0f18' }}
                  >
                    Load
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
