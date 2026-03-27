'use client';

import { useState } from 'react';
import { useBoardStore } from '@/lib/store';

interface Props {
  onClose: () => void;
  onSave: (name: string, category: string) => Promise<void>;
}

const categories = [
  { value: 'attack', label: 'Attack' },
  { value: 'defence', label: 'Defence' },
  { value: 'kickout', label: 'Kick-out' },
  { value: 'setpiece', label: 'Set piece' },
];

export default function SaveModal({ onClose, onSave }: Props) {
  const { phases, sport } = useBoardStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('attack');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim(), category);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--txt)' }}>Save play</h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Play name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            className="px-4 py-3 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs" style={{ color: 'var(--txt2)' }}>Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className="py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: category === c.value ? 'var(--acc)' : 'var(--bg3)',
                    color: category === c.value ? '#0b0f18' : 'var(--txt2)',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--txt2)' }}>
            {phases.length} phase{phases.length !== 1 ? 's' : ''} · {sport.toUpperCase()}
          </p>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: 'var(--bg3)', color: 'var(--txt)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
              style={{ background: 'var(--acc)', color: '#0b0f18' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
