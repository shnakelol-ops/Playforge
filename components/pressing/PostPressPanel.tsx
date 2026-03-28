'use client';

import { useEffect, useRef } from 'react';
import { usePressStore } from '@/lib/press-store';
import { drawPitch } from '@/components/board/PitchRenderer';
import { drawArrow } from '@/lib/arrowUtils';
import type { PostPressOption } from '@/lib/press-types';
import type { Sport } from '@/lib/pitch-config';

const OPTIONS: Array<{ value: PostPressOption; label: string; emoji: string }> = [
  { value: 'playForward', label: 'Play Forward', emoji: '↑' },
  { value: 'recycleWide', label: 'Recycle Wide', emoji: '↔' },
  { value: 'switchPlay', label: 'Switch Play', emoji: '⇄' },
  { value: 'holdAndBuild', label: 'Hold & Build', emoji: '■' },
];

const ARROW_DIRECTIONS: Record<PostPressOption, { fromX: number; fromY: number; toX: number; toY: number }> = {
  playForward: { fromX: 0.5, fromY: 0.8, toX: 0.5, toY: 0.2 },      // up
  recycleWide: { fromX: 0.2, fromY: 0.5, toX: 0.8, toY: 0.5 },      // horizontal
  switchPlay: { fromX: 0.2, fromY: 0.5, toX: 0.8, toY: 0.5 },       // horizontal (same as wide)
  holdAndBuild: { fromX: 0.5, fromY: 0.5, toX: 0.5, toY: 0.5 },    // center (no arrow)
};

export default function PostPressPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { sport, postPress, setPostPress } = usePressStore();

  // Draw mini pitch with arrow
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 120;
    canvas.height = 80;

    // Draw pitch
    drawPitch(ctx, 120, 80, sport as Sport);

    // Draw arrow for current option
    if (postPress.option !== 'holdAndBuild') {
      const dir = ARROW_DIRECTIONS[postPress.option];
      const fromX = dir.fromX * 120;
      const fromY = dir.fromY * 80;
      const toX = dir.toX * 120;
      const toY = dir.toY * 80;

      drawArrow(ctx, fromX, fromY, toX, toY, 8, '#ffffff', 2);
    }
  }, [postPress.option, sport]);

  return (
    <div className="flex flex-col gap-4">
      {/* Option buttons */}
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setPostPress(option.value, postPress.notes)}
            className="py-3 rounded-lg text-sm font-medium transition-all"
            style={{
              background: postPress.option === option.value ? 'var(--acc)' : 'var(--bg3)',
              color: postPress.option === option.value ? '#0b0f18' : 'var(--txt2)',
            }}
          >
            <span className="text-lg">{option.emoji}</span>
            <br />
            <span className="text-xs">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Mini pitch preview */}
      <div className="flex items-center justify-center p-2 rounded-lg" style={{ background: 'var(--bg3)' }}>
        <canvas
          ref={canvasRef}
          style={{
            border: '1px solid var(--bdr)',
            borderRadius: '0.25rem',
          }}
        />
      </div>

      {/* Notes textarea */}
      <div className="flex flex-col gap-2">
        <label className="text-xs" style={{ color: 'var(--txt2)' }}>
          Coaching notes
        </label>
        <textarea
          placeholder="Add notes about post-press strategy..."
          value={postPress.notes}
          onChange={e => setPostPress(postPress.option, e.target.value)}
          className="px-3 py-2 rounded-lg text-xs outline-none resize-none"
          rows={3}
          style={{ background: 'var(--bg3)', color: 'var(--txt)', border: '1px solid var(--bdr)' }}
        />
      </div>
    </div>
  );
}
