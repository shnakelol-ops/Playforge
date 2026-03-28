'use client';

import { useEffect, useRef, useState } from 'react';
import { usePressStore } from '@/lib/press-store';
import { toPixel, toRelative, easeInOut, hitTest } from '@/lib/canvas-utils';
import { drawPitch } from '@/components/board/PitchRenderer';
import { getDefaultPositions } from '@/lib/pitch-config';
import type { Sport } from '@/lib/pitch-config';
import type { PressRole } from '@/lib/press-types';

const PLAYER_RADIUS = 14;
const ANIMATION_DURATION = 1500; // ms — 1.5 seconds as required

interface AnimationState {
  isAnimating: boolean;
  startTime: number;
}

const ROLE_BADGE_COLORS: Record<PressRole, string> = {
  firstPresser: '#ef4444',
  coverShadow: '#3b82f6',
  holdShape: '#9ca3af',
  pressTrigger: '#22c55e',
};

const ROLE_BADGE_LABELS: Record<PressRole, string> = {
  firstPresser: 'P',
  coverShadow: 'S',
  holdShape: 'H',
  pressTrigger: 'T',
};

/**
 * Compute auto-movement target for a player based on their press role.
 * PRESS (firstPresser): aggressive forward movement toward triggerLine
 * SHADOW (coverShadow): moderate inward+forward movement
 * HOLD (holdShape): slight compacting movement
 * TRIGGER (pressTrigger): moves toward ball/triggerLine position
 */
function computeRoleTarget(
  rx: number,
  ry: number,
  role: PressRole | null,
  triggerLine: number,
): { endRx: number; endRy: number } {
  if (!role) return { endRx: rx, endRy: ry };

  switch (role) {
    case 'firstPresser':
      // Move aggressively toward center and up to trigger line
      return {
        endRx: rx + (0.5 - rx) * 0.25,
        endRy: ry + (triggerLine - ry) * 0.65,
      };
    case 'coverShadow':
      // Move moderately inward and forward to cut passing lanes
      return {
        endRx: rx + (0.5 - rx) * 0.12,
        endRy: ry + (triggerLine - ry) * 0.38,
      };
    case 'holdShape':
      // Compact slightly — barely move
      return {
        endRx: rx + (0.5 - rx) * 0.06,
        endRy: ry + (triggerLine - ry) * 0.12,
      };
    case 'pressTrigger':
      // Move toward ball carrier (triggerLine center)
      return {
        endRx: rx + (0.5 - rx) * 0.18,
        endRy: ry + (triggerLine - ry) * 0.52,
      };
  }
}

export default function AnimPitchCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoInitDone = useRef(false);

  const {
    sport,
    pressPhases,
    currentPhase,
    playerRoles,
    zoneConfig,
    selectPhase,
    setPlayerTarget,
  } = usePressStore();

  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [animState, setAnimState] = useState<AnimationState>({ isAnimating: false, startTime: 0 });
  const [draggingPlayerId, setDraggingPlayerId] = useState<number | null>(null);

  const phase = pressPhases.find(p => p.phaseNumber === currentPhase)!;

  // ResizeObserver — reads both width and height from aspect-ratio CSS
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(300, rect.width);
      const h = rect.height > 0 ? rect.height : w * (90 / 145);
      setCanvasSize({ w, h });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Auto-initialize targets from roles once, when roles exist and targets are all at default
  useEffect(() => {
    if (autoInitDone.current) return;
    if (Object.keys(playerRoles).length === 0) return;

    const positions = getDefaultPositions(sport as Sport).home;

    pressPhases.forEach(ph => {
      const allAtDefault = ph.playerTargets.every(
        t => t.startRx === t.endRx && t.startRy === t.endRy,
      );
      if (!allAtDefault) return;

      ph.playerTargets.forEach(target => {
        const player = positions.find(p => p.id === target.playerId);
        if (!player) return;
        const role = playerRoles[target.playerId] ?? null;
        if (!role) return;

        const { endRx, endRy } = computeRoleTarget(
          target.startRx,
          target.startRy,
          role,
          zoneConfig.triggerLine,
        );

        if (endRx !== target.startRx || endRy !== target.startRy) {
          setPlayerTarget(ph.phaseNumber, target.playerId, endRx, endRy);
        }
      });
    });

    autoInitDone.current = true;
  }, [playerRoles, zoneConfig.triggerLine, sport, pressPhases, setPlayerTarget]);

  // Reset auto-init flag when sport or roles are cleared
  useEffect(() => {
    autoInitDone.current = false;
  }, [sport]);

  // Animation loop — triggers re-draw each frame while animating
  useEffect(() => {
    if (!animState.isAnimating) return;

    const animFrame = requestAnimationFrame(() => {
      const elapsed = Date.now() - animState.startTime;
      if (elapsed >= ANIMATION_DURATION) {
        setAnimState({ isAnimating: false, startTime: 0 });
      } else {
        setAnimState(prev => ({ ...prev })); // trigger re-draw
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

    // Draw players with easeInOut interpolation during animation
    phase.playerTargets.forEach(target => {
      const role = (playerRoles[target.playerId] ?? null) as PressRole | null;

      let displayRx = animState.isAnimating
        ? target.startRx + (target.endRx - target.startRx) * easeProgress
        : target.endRx;
      let displayRy = animState.isAnimating
        ? target.startRy + (target.endRy - target.startRy) * easeProgress
        : target.endRy;

      const { x: px, y: py } = toPixel(displayRx, displayRy, canvasSize.w, canvasSize.h);

      // Draw movement line from start to end
      if (target.endRx !== target.startRx || target.endRy !== target.startRy) {
        const { x: startPx, y: startPy } = toPixel(target.startRx, target.startRy, canvasSize.w, canvasSize.h);
        const { x: endPx, y: endPy } = toPixel(target.endRx, target.endRy, canvasSize.w, canvasSize.h);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startPx, startPy);
        ctx.lineTo(endPx, endPy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Player circle — blue if has role, grey if unassigned
      ctx.fillStyle = role ? '#3b82f6' : '#4b5563';
      ctx.beginPath();
      ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Player number from positions data
      const positions = getDefaultPositions(sport as Sport).home;
      const posData = positions.find(p => p.id === target.playerId);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(posData ? posData.num : String(target.playerId), px, py);

      // Role badge
      if (role) {
        const badgeX = px + PLAYER_RADIUS - 4;
        const badgeY = py - PLAYER_RADIUS + 4;
        ctx.fillStyle = ROLE_BADGE_COLORS[role];
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText(ROLE_BADGE_LABELS[role], badgeX, badgeY);
      }
    });
  }, [canvasSize, phase, animState, pressPhases, sport, playerRoles]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || animState.isAnimating) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

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

      {/* Canvas with correct aspect ratio */}
      <div
        ref={containerRef}
        style={{ aspectRatio: '145 / 90', width: '100%' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          className="border border-solid"
          style={{
            borderColor: 'var(--bdr)',
            borderRadius: '0.5rem',
            cursor: draggingPlayerId !== null ? 'grabbing' : 'pointer',
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      <p className="text-xs" style={{ color: 'var(--txt2)' }}>
        Drag a player to set their press target position. Roles assigned in step 2 auto-populate movement.
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
