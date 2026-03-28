'use client';

import { useBoardStore } from '@/lib/store';
import type { InteractionMode, RunStyle, Sport } from '@/lib/pitch-config';

const sports: { value: Sport; label: string }[] = [
  { value: 'gaa', label: 'Gaelic Football' },
  { value: 'hurling', label: 'Hurling' },
  { value: 'soccer', label: 'Soccer' },
];

const modes: { value: InteractionMode; label: string; icon: string }[] = [
  { value: 'move', label: 'Move', icon: '✦' },
  { value: 'draw', label: 'Draw', icon: '↗' },
  { value: 'ball', label: 'Ball', icon: '●' },
];

const runStyles: { value: RunStyle; label: string }[] = [
  { value: 'run', label: 'Run' },
  { value: 'decoy', label: 'Decoy' },
  { value: 'pass', label: 'Pass' },
];

export default function Toolbar({ onSave, onShare }: { onSave: () => void; onShare: () => void }) {
  const { sport, mode, runStyle, setSport, setMode, setRunStyle, animating, animationSpeed, setAnimating, setAnimationSpeed, showHome, setShowHome, showAway, setShowAway } = useBoardStore();

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 overflow-x-auto shrink-0"
      style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--bdr)' }}
    >
      {/* Logo */}
      <span className="font-display text-xl tracking-widest shrink-0" style={{ color: 'var(--acc)' }}>
        PLAYFORGE
      </span>

      <div className="w-px h-6 shrink-0" style={{ background: 'var(--bdr)' }} />

      {/* Sport */}
      <div className="flex gap-1 shrink-0">
        {sports.map(s => (
          <button
            key={s.value}
            onClick={() => setSport(s.value)}
            className="px-3 py-1 rounded-md text-xs font-medium transition-all"
            style={{
              background: sport === s.value ? 'var(--acc)' : 'var(--bg3)',
              color: sport === s.value ? '#0b0f18' : 'var(--txt2)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 shrink-0" style={{ background: 'var(--bdr)' }} />

      {/* Team visibility */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => setShowHome(!showHome)}
          className="px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1"
          style={{
            background: '#00e07a',
            color: '#0b0f18',
            opacity: showHome ? 1 : 0.5,
          }}
        >
          <span style={{ textDecoration: showHome ? 'none' : 'line-through' }}>👁</span>
          <span>Home</span>
        </button>
        <button
          onClick={() => setShowAway(!showAway)}
          className="px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1"
          style={{
            background: '#f5a623',
            color: '#0b0f18',
            opacity: showAway ? 1 : 0.5,
          }}
        >
          <span style={{ textDecoration: showAway ? 'none' : 'line-through' }}>👁</span>
          <span>Away</span>
        </button>
      </div>

      <div className="w-px h-6 shrink-0" style={{ background: 'var(--bdr)' }} />

      {/* Mode */}
      <div className="flex gap-1 shrink-0">
        {modes.map(m => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className="px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1"
            style={{
              background: mode === m.value ? 'var(--acc)' : 'var(--bg3)',
              color: mode === m.value ? '#0b0f18' : 'var(--txt2)',
            }}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Run style — only when draw mode */}
      {mode === 'draw' && (
        <>
          <div className="w-px h-6 shrink-0" style={{ background: 'var(--bdr)' }} />
          <div className="flex gap-1 shrink-0">
            {runStyles.map(r => (
              <button
                key={r.value}
                onClick={() => setRunStyle(r.value)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                style={{
                  background: runStyle === r.value ? 'rgba(0,212,110,0.2)' : 'var(--bg3)',
                  color: runStyle === r.value ? 'var(--acc)' : 'var(--txt2)',
                  border: `1px solid ${runStyle === r.value ? 'var(--acc)' : 'transparent'}`,
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex-1" />

      {/* Speed */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs" style={{ color: 'var(--txt2)' }}>Speed</span>
        <input
          type="range"
          min="0.3"
          max="3"
          step="0.1"
          value={animationSpeed}
          onChange={e => setAnimationSpeed(parseFloat(e.target.value))}
          className="w-20 accent-green-400"
        />
        <span className="text-xs w-8" style={{ color: 'var(--txt2)' }}>{animationSpeed.toFixed(1)}x</span>
      </div>

      {/* Play/Pause */}
      <button
        onClick={() => setAnimating(!animating)}
        className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shrink-0"
        style={{ background: animating ? 'var(--bg3)' : 'var(--acc)', color: animating ? 'var(--txt)' : '#0b0f18' }}
      >
        {animating ? 'Pause' : 'Play'}
      </button>

      <div className="w-px h-6 shrink-0" style={{ background: 'var(--bdr)' }} />

      <button
        onClick={onSave}
        className="px-3 py-1.5 rounded-lg text-xs font-medium shrink-0"
        style={{ background: 'var(--bg3)', color: 'var(--txt)' }}
      >
        Save
      </button>
      <button
        onClick={onShare}
        className="px-3 py-1.5 rounded-lg text-xs font-medium shrink-0"
        style={{ background: 'var(--bg3)', color: 'var(--txt)' }}
      >
        Share
      </button>
    </div>
  );
}
