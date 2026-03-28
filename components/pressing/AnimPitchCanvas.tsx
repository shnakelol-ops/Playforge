'use client';

import { useEffect, useRef, useState } from 'react';
import { usePressStore } from '@/lib/press-store';
import { toPixel, toRelative, easeInOut, hitTest } from '@/lib/canvas-utils';
import { drawPitch } from '@/components/board/PitchRenderer';
import type { Sport } from '@/lib/pitch-config';

const CANVAS_HEIGHT = 250;
const PLAYER_RADIUS = 14;
const ANIMATION_DURATION = 2500; // ms

interface AnimationState {
  isAnimating: boolean;
  startTime: number;
}

export default function AnimPitchCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { sport, pressPhases, currentPhase, selectPhase, setPlayerTarget } = usePressStore();
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: CANVAS_HEIGHT });
  const [animState, setAnimState] = useState<AnimationState>({ isAnimating: false, startTime: 0 });
  const [draggingPlayerId, setDraggingPlayerId] = useState<number | null>(null);

  const phase = pressPhases.find(p => p.phaseNumber === currentPhase)!;

  // ResizeObserver for canvas sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      setCanvasSize({ w: Math.max(300, rect.width), h: CANVAS_HEIGHT });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    if (!animState.isAnimating) return;

    const animFrame = requestAnimationFrame(() => {
      const elapsed = Date.now() - animState.startTime;
      if (elapsed >= ANIMATION_DURATION) {
        setAnimState({ isAnimating: false, startTime: 0 });
      }
    });

    return () => cancelAnimationFrame(animFrame);
  }, [animState]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.w === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    // Draw pitch
    drawPitch(ctx, canvasSize.w, canvasSize.h, sport as Sport);

    const now = Date.now();
    const elapsed = animState.isAnimating ? now - animState.startTime : 0;
    const progress = Math.min(1, elapsed / ANIMATION_DURATION);
    const easeProgress = easeInOut(progress);

    // Draw players with interpolation if animating
    phase.playerTargets.forEach(target => {
      let displayRx = target.startRx;
      let displayRy = target.startRy;

      if (animState.isAnimating) {
        displayRx = target.startRx + (target.endRx - target.startRx) * easeProgress;
        displayRy = target.startRy + (target.endRy - target.startRy) * easeProgress;
      }

      const { x: px, y: py } = toPixel(displayRx, displayRy, canvasSize.w, canvasSize.h);

      // Draw player circle
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Draw player number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(target.playerId), px, py);

      // Draw dashed line from start to end position
      if (target.endRx !== target.startRx || target.endRy !== target.startRy) {
        const { x: startPx, y: startPy } = toPixel(target.startRx, target.startRy, canvasSize.w, canvasSize.h);
        const { x: endPx, y: endPy } = toPixel(target.endRx, target.endRy, canvasSize.w, canvasSize.h);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startPx, startPy);
        ctx.lineTo(endPx, endPy);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Trigger a redraw if animating
    if (animState.isAnimating) {
      requestAnimationFrame(() => {
        // Trigger state update to redraw
        setAnimState(prev => ({ ...prev }));
      });
    }
  }, [canvasSize, phase, animState, pressPhases, sport]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || animState.isAnimating) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check which player was clicked
    for (const target of phase.playerTargets) {
      if (hitTest(px, py, target.endRx, target.endRy, canvasSize.w, canvasSize.h, PLAYER_RADIUS)) {
        setDraggingPlayerId(target.playerId);
        return;
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingPlayerId === null || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const { rx, ry } = toRelative(px, py, canvasSize.w, canvasSize.h);
      setPlayerTarget(currentPhase, draggingPlayerId, rx, ry);
    };

    const handleMouseUp = () => {
      setDraggingPlayerId(null);
    };

    if (draggingPlayerId !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingPlayerId, canvasSize, currentPhase, setPlayerTarget]);

  const handleTriggerPress = () => {
    setAnimState({
      isAnimating: true,
      startTime: Date.now(),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Phase tabs */}
      <div className="flex gap-2">
        {[1, 2].map(p => (
          <button
            key={p}
            onClick={() => selectPhase(p as 1 | 2)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: currentPhase === p ? 'var(--acc)' : 'var(--bg3)',
              color: currentPhase === p ? '#0b0f18' : 'var(--txt2)',
            }}
          >
            Phase {p} — {p === 1 ? 'Initial Press' : 'Counter-Press'}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="w-full">
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          className="w-full border border-solid"
          style={{
            borderColor: 'var(--bdr)',
            borderRadius: '0.5rem',
            cursor: draggingPlayerId !== null ? 'grabbing' : 'pointer',
            height: `${CANVAS_HEIGHT}px`,
            display: 'block',
          }}
        />
      </div>

      {/* Hint text */}
      <p className="text-xs" style={{ color: 'var(--txt2)' }}>
        Drag a player to set their press target position
      </p>

      {/* Trigger button */}
      <button
        onClick={handleTriggerPress}
        disabled={animState.isAnimating}
        className="w-full py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
        style={{
          background: 'var(--acc)',
          color: '#0b0f18',
        }}
      >
        {animState.isAnimating ? '● ANIMATING...' : '▶ TRIGGER PRESS'}
      </button>
    </div>
  );
}
