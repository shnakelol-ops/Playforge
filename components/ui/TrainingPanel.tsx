'use client';

import { useBoardStore } from '@/lib/store';
import type { TrainingItemType } from '@/lib/store';

const TRAINING_ITEMS: { type: TrainingItemType; label: string }[] = [
  { type: 'cone', label: 'Cone' },
  { type: 'ball', label: 'Ball' },
  { type: 'pole', label: 'Pole' },
  { type: 'ladder', label: 'Ladder' },
  { type: 'hurdle', label: 'Hurdle' },
  { type: 'mannequin', label: 'Mannequin' },
  { type: 'mini-goal', label: 'Mini-Goal' },
  { type: 'zone-marker', label: 'Zone' },
];

export default function TrainingPanel() {
  const { selectedTrainingType, setSelectedTrainingType, setMode } = useBoardStore();

  const onClose = () => {
    setMode('move');
    setSelectedTrainingType(null);
  };

  return (
    <div
      className="fixed bottom-56 left-4 z-40 w-48 p-4 rounded-lg"
      style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--txt)' }}>Training Items</h3>
        <button
          onClick={onClose}
          className="text-xs font-bold"
          style={{ color: 'var(--txt2)' }}
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {TRAINING_ITEMS.map((item) => (
          <button
            key={item.type}
            onClick={() => setSelectedTrainingType(item.type)}
            className="px-2 py-2 rounded text-xs font-medium transition-all"
            style={{
              background: selectedTrainingType === item.type ? 'var(--acc)' : 'var(--bg3)',
              color: selectedTrainingType === item.type ? '#0b0f18' : 'var(--txt2)',
              border: selectedTrainingType === item.type ? `2px solid var(--acc)` : '1px solid transparent',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
