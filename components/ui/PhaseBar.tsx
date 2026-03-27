'use client';

import { useBoardStore } from '@/lib/store';

export default function PhaseBar() {
  const { phases, currentPhase, setCurrentPhase, addPhase } = useBoardStore();

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 overflow-x-auto shrink-0"
      style={{ background: 'var(--bg2)', borderTop: '1px solid var(--bdr)' }}
    >
      <span className="text-xs shrink-0" style={{ color: 'var(--txt2)' }}>Phase:</span>
      {phases.map((phase, i) => (
        <button
          key={i}
          onClick={() => setCurrentPhase(i)}
          className="px-4 py-1 rounded-lg text-sm font-medium transition-all shrink-0"
          style={{
            background: currentPhase === i ? 'var(--acc)' : 'var(--bg3)',
            color: currentPhase === i ? '#0b0f18' : 'var(--txt2)',
          }}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={addPhase}
        className="px-3 py-1 rounded-lg text-sm font-medium shrink-0 transition-all"
        style={{ background: 'var(--bg3)', color: 'var(--acc)', border: '1px dashed var(--acc)' }}
      >
        + Phase
      </button>
    </div>
  );
}
