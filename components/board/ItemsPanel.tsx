'use client';

import { useBoardStore } from '@/lib/store';
import type { TrainingItemType } from '@/lib/pitch-config';

const TRAINING_ITEMS: Array<{ type: TrainingItemType; label: string; icon: string }> = [
  { type: 'cone', label: 'Cone', icon: '🔶' },
  { type: 'ladder', label: 'Ladder', icon: '🪜' },
  { type: 'pole', label: 'Pole', icon: '📍' },
  { type: 'hurdle', label: 'Hurdle', icon: '🚧' },
  { type: 'ball', label: 'Ball', icon: '⚪' },
  { type: 'mannequin', label: 'Mannequin', icon: '👤' },
  { type: 'mini-goal', label: 'Mini Goal', icon: '🥅' },
  { type: 'zone-marker', label: 'Zone', icon: '📐' },
];

export default function ItemsPanel() {
  const { selectedTrainingType, setSelectedTrainingType, setMode } = useBoardStore();

  const handleSelectItem = (type: TrainingItemType) => {
    setSelectedTrainingType(type);
    setMode('training');
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: 'var(--txt2)' }}>
        Select an item and click on the pitch to place it
      </p>

      <div className="grid grid-cols-2 gap-2">
        {TRAINING_ITEMS.map(item => (
          <button
            key={item.type}
            onClick={() => handleSelectItem(item.type)}
            className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all border"
            style={{
              background: selectedTrainingType === item.type ? 'rgba(0, 212, 110, 0.15)' : 'var(--bg3)',
              borderColor: selectedTrainingType === item.type ? 'var(--acc)' : 'var(--bdr)',
              color: selectedTrainingType === item.type ? 'var(--acc)' : 'var(--txt2)',
            }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="text-xs" style={{ color: 'var(--txt2)' }}>
        <p>💡 <strong>Tip:</strong> Drag items to move them. Press Delete to remove selected item.</p>
      </div>
    </div>
  );
}
