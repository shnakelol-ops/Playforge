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
  firstPresser: { fill: '#3b82f6', badge: '#ef4444' },      // blue, red badge
  coverShadow: { fill: '#3b82f6', badge: '#3b82f6' },      // blue, blue badge
  holdShape: { fill: '#3b82f6', badge: '#9ca3af' },        // blue, grey badge
  pressTrigger: { fill: '#3b82f6', badge: '#22c55e' },     // blue, green badge
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

  const players = getDefaultPositions(sport).home;

  // ResizeObserver for canvas sizing with aspect ratio 145/90
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(300, rect.width);
      const h = rect.height; // Height is calculated from aspect ratio CSS
      setCanvasSize({ w, h: h > 0 ? h : w * (90 / 145) });
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

      // Draw player circle
      ctx.fillStyle = ROLE_COLORS.firstPresser.fill;
      ctx.beginPath();
      ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Draw player number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(player.id), px, py);

      // Draw role badge (12x12 circle top-right)
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
        // Cycle to next role
        const currentRole = playerRoles[player.id] || null;
        const currentIndex = ROLE_CYCLE_ORDER.indexOf(currentRole);
        const nextRole = ROLE_CYCLE_ORDER[(currentIndex + 1) % ROLE_CYCLE_ORDER.length];
        setPlayerRole(player.id, nextRole as PressRole | null);
        return;
      }
    }
  };

  return (
    <div ref={containerRef} className="w-full" style={{ aspectRatio: '145 / 90' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full border border-solid"
        style={{
          borderColor: 'var(--bdr)',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          display: 'block',
        }}
      />
      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs" style={{ color: 'var(--txt2)' }}>
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
    </div>
  );
}
