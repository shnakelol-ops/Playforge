'use client';

import { useEffect, useRef, useState } from 'react';
import { usePressStore } from '@/lib/press-store';
import { toPixel, hitTest } from '@/lib/canvas-utils';
import { drawPitch } from '@/components/board/PitchRenderer';
import { getDefaultPositions } from '@/lib/pitch-config';
import type { PressRole } from '@/lib/press-types';
import type { Sport } from '@/lib/pitch-config';

const PLAYER_RADIUS = 14;

const ROLE_COLORS: Record<PressRole, { fill: string; badge: string }> = {
  firstPresser: { fill: '#3b82f6', badge: '#ef4444' },   // blue player, red P badge
  coverShadow:  { fill: '#3b82f6', badge: '#3b82f6' },   // blue player, blue S badge
  holdShape:    { fill: '#3b82f6', badge: '#9ca3af' },   // blue player, grey H badge
  pressTrigger: { fill: '#3b82f6', badge: '#22c55e' },   // blue player, green T badge
};

const ROLE_LABELS: Record<PressRole, string> = {
  firstPresser: 'P',
  coverShadow: 'S',
  holdShape: 'H',
  pressTrigger: 'T',
};

const ROLE_CYCLE_ORDER: (PressRole | null)[] = ['firstPresser', 'coverShadow', 'holdShape', 'pressTrigger', null];

export default function RolePitchCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { sport, playerRoles, setPlayerRole } = usePressStore();
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const players = getDefaultPositions(sport as Sport).home;

  // ResizeObserver — reads both width and height set by aspect-ratio CSS
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

    // Draw players
    players.forEach(player => {
      const { x: px, y: py } = toPixel(player.rx, player.ry, canvasSize.w, canvasSize.h);
      const role = playerRoles[player.id] || null;

      // Player circle
      ctx.fillStyle = role ? ROLE_COLORS[role].fill : '#4b5563';
      ctx.beginPath();
      ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Player number (use player.num not player.id)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player.num, px, py);

      // Role badge (circle top-right of player)
      if (role) {
        const badgeX = px + PLAYER_RADIUS - 4;
        const badgeY = py - PLAYER_RADIUS + 4;
        ctx.fillStyle = ROLE_COLORS[role].badge;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Badge label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ROLE_LABELS[role], badgeX, badgeY);
      }
    });
  }, [canvasSize, playerRoles, players, sport]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check which player was clicked
    for (const player of players) {
      if (hitTest(px, py, player.rx, player.ry, canvasSize.w, canvasSize.h, PLAYER_RADIUS)) {
        const currentRole = playerRoles[player.id] || null;
        const currentIndex = ROLE_CYCLE_ORDER.indexOf(currentRole);
        const nextRole = ROLE_CYCLE_ORDER[(currentIndex + 1) % ROLE_CYCLE_ORDER.length];
        setPlayerRole(player.id, nextRole as PressRole | null);
        return;
      }
    }
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        style={{ aspectRatio: '145 / 90' }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="border border-solid"
          style={{
            borderColor: 'var(--bdr)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-xs" style={{ color: 'var(--txt2)' }}>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
          <span>P = First Presser</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
          <span>S = Cover Shadow</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: '#9ca3af' }} />
          <span>H = Hold Shape</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
          <span>T = Press Trigger</span>
        </div>
      </div>
      <p className="mt-2 text-xs" style={{ color: 'var(--txt2)' }}>
        Tap a player to cycle through roles. Tap again to clear.
      </p>
    </div>
  );
}
