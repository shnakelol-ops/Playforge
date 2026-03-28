'use client';

import { useState } from 'react';
import { useBoardStore } from '@/lib/store';
import { getDefaultPositions } from '@/lib/pitch-config';

export default function SquadPanel() {
  const { sport, playerNames, setPlayerName } = useBoardStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempName, setTempName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');

  const positions = getDefaultPositions(sport);
  const players = selectedTeam === 'home' ? positions.home : positions.away;

  const handleStartEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setTempName(currentName);
  };

  const handleSave = (id: number) => {
    setPlayerName(selectedTeam, id, tempName || `Player ${id}`);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Team toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedTeam('home')}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: selectedTeam === 'home' ? 'var(--acc)' : 'var(--bg3)',
            color: selectedTeam === 'home' ? '#0b0f18' : 'var(--txt2)',
          }}
        >
          🟢 Home Squad
        </button>
        <button
          onClick={() => setSelectedTeam('away')}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: selectedTeam === 'away' ? '#f59e0b' : 'var(--bg3)',
            color: selectedTeam === 'away' ? '#0b0f18' : 'var(--txt2)',
          }}
        >
          🟠 Away Squad
        </button>
      </div>

      {/* Players list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {players.map(player => {
          const currentName = playerNames[selectedTeam]?.[player.id] || `Player ${player.id}`;
          const isEditing = editingId === player.id;

          return (
            <div
              key={player.id}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: 'var(--bg3)' }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                style={{
                  background: selectedTeam === 'home' ? '#00e07a' : '#f59e0b',
                  color: '#0b0f18',
                }}>
                {player.id}
              </div>

              {isEditing ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    autoFocus
                    className="input flex-1"
                    placeholder={`Player ${player.id}`}
                  />
                  <button
                    onClick={() => handleSave(player.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  className="flex-1 cursor-pointer text-sm rounded px-2 py-1 transition-colors"
                  onClick={() => handleStartEdit(player.id, currentName)}
                  style={{ color: 'var(--txt)' }}
                >
                  <div className="font-medium">{currentName}</div>
                  <div className="text-xs" style={{ color: 'var(--txt2)' }}>
                    {player.pos}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
