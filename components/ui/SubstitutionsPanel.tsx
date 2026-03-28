'use client';

import { useBoardStore } from '@/lib/store';

export default function SubstitutionsPanel() {
  const { benchPlayers } = useBoardStore();

  return (
    <div
      className="fixed top-16 right-4 z-40 w-72 p-4 rounded-lg"
      style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}
    >
      <div className="mb-3">
        <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--txt)' }}>Bench</h3>
        <p className="text-xs" style={{ color: 'var(--txt2)' }}>
          Click a bench player, then click an on-pitch player to swap
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {benchPlayers.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--txt2)' }}>No bench players</p>
        ) : (
          benchPlayers.map((player) => (
            <div
              key={player.id}
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: player.team === 'home' ? '#00e07a' : '#f5a623',
                color: '#0b0f18',
                cursor: 'pointer',
              }}
              title={`${player.name ?? player.num} (${player.pos})`}
            >
              {player.num}
            </div>
          ))
        )}
      </div>

      <button
        className="w-full px-3 py-2 rounded text-xs font-medium transition-all"
        style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}
      >
        Add Sub
      </button>
    </div>
  );
}
