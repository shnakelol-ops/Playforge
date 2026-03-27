'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useBoardStore } from '@/lib/store';
import type { Player } from '@/lib/store';
import { drawPitch } from './PitchRenderer';
import { drawPlayers } from './PlayerLayer';
import { drawRuns } from './RunLayer';

const PLAYER_RADIUS_DESKTOP = 14;
const PLAYER_RADIUS_MOBILE = 12;
const BALL_RADIUS = 8;

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function toPixel(rx: number, ry: number, w: number, h: number) {
  return { x: rx * w, y: ry * h };
}

function toRelative(x: number, y: number, w: number, h: number) {
  return { rx: x / w, ry: y / h };
}

function getPlayerRadius(canvas: HTMLCanvasElement) {
  return canvas.width < 600 ? PLAYER_RADIUS_MOBILE : PLAYER_RADIUS_DESKTOP;
}

function hitTest(px: number, py: number, rx: number, ry: number, w: number, h: number, radius: number) {
  const { x, y } = toPixel(rx, ry, w, h);
  return Math.hypot(px - x, py - y) <= radius + 4;
}

export default function TacticsBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const animStartRef = useRef<number>(0);
  const animStartPositionsRef = useRef<{ id: number; team: 'home' | 'away'; startRx: number; startRy: number; endRx: number; endRy: number }[]>([]);

  const {
    sport, mode, runStyle, phases, currentPhase,
    animating, animationSpeed,
    updatePlayerPosition, addRun, setBallPosition,
    setAnimating,
  } = useBoardStore();

  const phase = phases[currentPhase];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width: w, height: h } = canvas;

    ctx.clearRect(0, 0, w, h);
    drawPitch(ctx, w, h, sport);

    drawRuns(ctx, w, h, phase.runs);
    drawPlayers(ctx, w, h, phase.playerPositions.home, phase.playerPositions.away, getPlayerRadius(canvas));

    // Ball
    const ball = toPixel(phase.ballPosition.x, phase.ballPosition.y, w, h);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();
  }, [phase, sport]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    });

    observer.observe(container);
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    draw();

    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Animation
  useEffect(() => {
    if (!animating) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width: w, height: h } = canvas;

    // Collect start → end positions (end = where players currently are, we animate FROM default to current)
    // Actually: animate from current positions using runs as target offsets.
    // Simple approach: animate each player along their run arrow.
    const targets = phase.runs.map(run => ({
      id: run.playerId,
      team: run.team,
      startRx: run.startX,
      startRy: run.startY,
      endRx: run.endX,
      endRy: run.endY,
    }));

    animStartPositionsRef.current = targets;
    animStartRef.current = performance.now();
    const duration = 2500 / animationSpeed;

    function tick(now: number) {
      const elapsed = now - animStartRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOut(t);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);
      drawPitch(ctx, w, h, sport);

      // Interpolate players with runs
      const animatedHome = phase.playerPositions.home.map(p => {
        const target = animStartPositionsRef.current.find(a => a.id === p.id && a.team === 'home');
        if (!target) return p;
        return {
          ...p,
          rx: target.startRx + (target.endRx - target.startRx) * eased,
          ry: target.startRy + (target.endRy - target.startRy) * eased,
        };
      });
      const animatedAway = phase.playerPositions.away.map(p => {
        const target = animStartPositionsRef.current.find(a => a.id === p.id && a.team === 'away');
        if (!target) return p;
        return {
          ...p,
          rx: target.startRx + (target.endRx - target.startRx) * eased,
          ry: target.startRy + (target.endRy - target.startRy) * eased,
        };
      });

      drawRuns(ctx, w, h, phase.runs);
      drawPlayers(ctx, w, h, animatedHome, animatedAway, getPlayerRadius(canvas));

      // Ball
      const ball = toPixel(phase.ballPosition.x, phase.ballPosition.y, w, h);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setAnimating(false);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animating, animationSpeed, phase, sport, setAnimating]);

  // Interaction state
  const dragRef = useRef<{ type: 'player' | 'ball'; id?: number; team?: 'home' | 'away' } | null>(null);
  const drawStartRef = useRef<{ id: number; team: 'home' | 'away'; sx: number; sy: number } | null>(null);

  function getCanvasPoint(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function onPointerDown(x: number, y: number) {
    const canvas = canvasRef.current!;
    const { width: w, height: h } = canvas;
    const radius = getPlayerRadius(canvas);

    if (mode === 'ball') {
      dragRef.current = { type: 'ball' };
      return;
    }

    const allPlayers: (Player & { team: 'home' | 'away' })[] = [
      ...phase.playerPositions.home.map(p => ({ ...p, team: 'home' as const })),
      ...phase.playerPositions.away.map(p => ({ ...p, team: 'away' as const })),
    ];

    for (const p of allPlayers) {
      if (hitTest(x, y, p.rx, p.ry, w, h, radius)) {
        if (mode === 'move') {
          dragRef.current = { type: 'player', id: p.id, team: p.team };
        } else if (mode === 'draw') {
          const px = toPixel(p.rx, p.ry, w, h);
          drawStartRef.current = { id: p.id, team: p.team, sx: px.x, sy: px.y };
        }
        return;
      }
    }
  }

  function onPointerMove(x: number, y: number) {
    const canvas = canvasRef.current!;
    const { width: w, height: h } = canvas;

    if (mode === 'move' && dragRef.current?.type === 'player') {
      const rel = toRelative(x, y, w, h);
      const rx = Math.max(0, Math.min(1, rel.rx));
      const ry = Math.max(0, Math.min(1, rel.ry));
      updatePlayerPosition(currentPhase, dragRef.current.team!, dragRef.current.id!, rx, ry);
    }

    if (mode === 'ball' && dragRef.current?.type === 'ball') {
      const rel = toRelative(x, y, w, h);
      setBallPosition(currentPhase, { x: Math.max(0, Math.min(1, rel.rx)), y: Math.max(0, Math.min(1, rel.ry)) });
    }

    if (mode === 'draw' && drawStartRef.current) {
      // Preview line while dragging
      draw();
      const ctx = canvas.getContext('2d')!;
      const { sx, sy } = drawStartRef.current;
      ctx.save();
      ctx.strokeStyle = drawStartRef.current.team === 'home' ? '#ffffff' : '#f5a623';
      ctx.lineWidth = 2;
      if (runStyle === 'decoy') ctx.setLineDash([8, 4]);
      else if (runStyle === 'pass') ctx.setLineDash([3, 3]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    }
  }

  function onPointerUp(x: number, y: number) {
    const canvas = canvasRef.current!;
    const { width: w, height: h } = canvas;

    if (mode === 'draw' && drawStartRef.current) {
      const { id, team, sx, sy } = drawStartRef.current;
      const dist = Math.hypot(x - sx, y - sy);
      if (dist > 20) {
        const startRel = toRelative(sx, sy, w, h);
        const endRel = toRelative(x, y, w, h);
        addRun(currentPhase, {
          playerId: id,
          startX: startRel.rx,
          startY: startRel.ry,
          endX: endRel.rx,
          endY: endRel.ry,
          style: runStyle,
          team,
        });
      }
      drawStartRef.current = null;
    }

    dragRef.current = null;
  }

  function handleMouseDown(e: React.MouseEvent) {
    const { x, y } = getCanvasPoint(e);
    onPointerDown(x, y);
  }

  function handleMouseMove(e: React.MouseEvent) {
    const { x, y } = getCanvasPoint(e);
    onPointerMove(x, y);
  }

  function handleMouseUp(e: React.MouseEvent) {
    const { x, y } = getCanvasPoint(e);
    onPointerUp(x, y);
  }

  function handleTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    const { x, y } = getCanvasPoint(e);
    onPointerDown(x, y);
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    const { x, y } = getCanvasPoint(e);
    onPointerMove(x, y);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    e.preventDefault();
    if (e.changedTouches.length > 0) {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const t = e.changedTouches[0];
      const x = (t.clientX - rect.left) * (canvas.width / rect.width);
      const y = (t.clientY - rect.top) * (canvas.height / rect.height);
      onPointerUp(x, y);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none', cursor: mode === 'draw' ? 'crosshair' : mode === 'ball' ? 'grab' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { dragRef.current = null; drawStartRef.current = null; }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}
