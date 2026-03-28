'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBoardStore } from '@/lib/store';
import type { InteractionMode, RunStyle, Sport } from '@/lib/pitch-config';
import { INK_COLORS } from '@/lib/pitch-config';

const sports: { value: Sport; label: string }[] = [
  { value: 'gaa', label: 'Gaelic Football' },
  { value: 'hurling', label: 'Hurling' },
  { value: 'soccer', label: 'Soccer' },
];

const modes: { value: InteractionMode; label: string; icon: string }[] = [
  { value: 'move', label: 'Move', icon: '✦' },
  { value: 'draw', label: 'Draw', icon: '↗' },
  { value: 'ball', label: 'Ball', icon: '●' },
  { value: 'ink', label: 'Ink', icon: '✏' },
  { value: 'training', label: 'Items', icon: '⬡' },
];

const runStyles: { value: RunStyle; label: string }[] = [
  { value: 'run', label: 'Run' },
  { value: 'decoy', label: 'Decoy' },
  { value: 'pass', label: 'Pass' },
];

export default function Toolbar({ onSave, onShare, onBench }: { onSave: () => void; onShare: () => void; onBench?: () => void }) {
  const [showDisplayMenu, setShowDisplayMenu] = useState(false);
  const {
    sport, mode, runStyle,
    currentPhase,
    inkColor, inkWidth, inkShapeType, isZoneFill,
    playerDisplayMode, showNumbers, showPositions,
    setSport, setMode, setRunStyle,
    setInkColor, setInkWidth, setInkShapeType, setIsZoneFill,
    setPlayerDisplayMode, setShowNumbers, setShowPositions,
    animating, animationSpeed,
    setAnimating, setAnimationSpeed,
    showHome, setShowHome,
    showAway, setShowAway,
    clearInkStrokes,
  } = useBoardStore();

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

      {/* Navigation */}
      <div className="flex gap-2 shrink-0">
        <Link
          href="/playbook"
          className="px-3 py-1 rounded-md text-xs font-medium transition-all"
          style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}
        >
          Playbook
        </Link>
        <Link
          href="/pressing"
          className="px-3 py-1 rounded-md text-xs font-medium transition-all"
          style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}
        >
          Press
        </Link>
      </div>

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

      {/* Ink options — only when ink mode */}
      {mode === 'ink' && (
        <>
          <div className="w-px h-6 shrink-0" style={{ background: 'var(--bdr)' }} />
          {/* Shape types */}
          <div className="flex gap-1 shrink-0">
            {[
              { value: 'freehand' as const, label: 'Free' },
              { value: 'line' as const, label: 'Line' },
              { value: 'arrow' as const, label: 'Arrow' },
              { value: 'circle' as const, label: 'Circle' },
              { value: 'rect' as const, label: 'Rect' },
            ].map(s => (
              <button
                key={s.value}
                onClick={() => setInkShapeType(s.value)}
                className="px-2 py-1 rounded-md text-xs font-medium transition-all"
                style={{
                  background: inkShapeType === s.value ? 'var(--acc)' : 'var(--bg3)',
                  color: inkShapeType === s.value ? '#0b0f18' : 'var(--txt2)',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Colors */}
          <div className="flex gap-2 shrink-0">
            {(Object.entries(INK_COLORS) as Array<[keyof typeof INK_COLORS, string]>).map(([colorKey, colorVal]) => (
              <button
                key={colorKey}
                onClick={() => setInkColor(colorKey)}
                className="w-5 h-5 rounded-full transition-all"
                style={{
                  background: colorVal,
                  border: inkColor === colorKey ? '2px solid var(--acc)' : '1px solid rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>

          {/* Widths */}
          <div className="flex gap-1 shrink-0">
            {[
              { value: 'thin' as const, label: 'Thin' },
              { value: 'medium' as const, label: 'Med' },
              { value: 'thick' as const, label: 'Thick' },
            ].map(w => (
              <button
                key={w.value}
                onClick={() => setInkWidth(w.value)}
                className="px-2 py-1 rounded-md text-xs font-medium transition-all"
                style={{
                  background: inkWidth === w.value ? 'var(--acc)' : 'var(--bg3)',
                  color: inkWidth === w.value ? '#0b0f18' : 'var(--txt2)',
                }}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Zone toggle */}
          <button
            onClick={() => setIsZoneFill(!isZoneFill)}
            className="px-3 py-1 rounded-md text-xs font-medium transition-all shrink-0"
            style={{
              background: isZoneFill ? 'var(--acc)' : 'var(--bg3)',
              color: isZoneFill ? '#0b0f18' : 'var(--txt2)',
            }}
          >
            Zone
          </button>

          {/* Clear button */}
          <button
            onClick={() => clearInkStrokes(currentPhase)}
            className="px-3 py-1 rounded-md text-xs font-medium transition-all shrink-0"
            style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}
          >
            Clear
          </button>
        </>
      )}

      <div className="flex-1" />

      {/* Display dropdown */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowDisplayMenu(!showDisplayMenu)}
          className="px-3 py-1 rounded-md text-xs font-medium transition-all"
          style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}
        >
          Display
        </button>
        {showDisplayMenu && (
          <div
            className="absolute right-0 mt-1 w-40 p-2 rounded-lg z-50"
            style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)' }}
          >
            <div className="space-y-2">
              {/* Display mode */}
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--txt)' }}>Mode</div>
              {[
                { value: 'number' as const, label: 'Number' },
                { value: 'name' as const, label: 'Name' },
                { value: 'bib' as const, label: 'Bib' },
              ].map(m => (
                <label key={m.value} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    checked={playerDisplayMode === m.value}
                    onChange={() => setPlayerDisplayMode(m.value)}
                    className="w-3 h-3"
                  />
                  <span style={{ color: 'var(--txt2)' }}>{m.label}</span>
                </label>
              ))}

              <div className="h-px my-2" style={{ background: 'var(--bdr)' }} />

              {/* Toggles */}
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNumbers}
                  onChange={() => setShowNumbers(!showNumbers)}
                  className="w-3 h-3"
                />
                <span style={{ color: 'var(--txt2)' }}>Show Numbers</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPositions}
                  onChange={() => setShowPositions(!showPositions)}
                  className="w-3 h-3"
                />
                <span style={{ color: 'var(--txt2)' }}>Show Positions</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Bench button */}
      {onBench && (
        <button
          onClick={onBench}
          className="px-3 py-1 rounded-md text-xs font-medium transition-all shrink-0"
          style={{ background: 'var(--bg3)', color: 'var(--txt2)' }}
        >
          Bench
        </button>
      )}

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
