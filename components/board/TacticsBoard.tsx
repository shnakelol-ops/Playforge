'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useBoardStore } from '@/lib/store';
import type { Player } from '@/lib/store';
import { drawPitch } from './PitchRenderer';
import { drawPlayers } from './PlayerLayer';
import { drawRuns, drawControlPointHandles } from './RunLayer';

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
  const animStartPositionsRef = useRef<{ id: number; team: 'home' | 'away'; startRx: number; startRy: number; endRx: number; endRy: number; cpX?: number; cpY?: number }[]>([]);

  const {
    sport, mode, runStyle, phases, currentPhase,
    animating, animationSpeed,
    showHome, showAway,
    updatePlayerPosition, addRun, updateRunControlPoint, setBallPosition,
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

    // Filter runs and players by team visibility
    const visibleRuns = phase.runs.filter(r =>
      (r.team === 'home' && showHome) || (r.team === 'away' && showAway)
    );
    const visibleHome = showHome ? phase.playerPositions.home : [];
    const visibleAway = showAway ? phase.playerPositions.away : [];

    drawRuns(ctx, w, h, visibleRuns);
    if (mode === 'draw') {
      drawControlPointHandles(ctx, w, h, visibleRuns);
    }
    drawPlayers(ctx, w, h, visibleHome, visibleAway, getPlayerRadius(canvas));

    // Ball
    const ball = toPixel(phase.ballPosition.x, phase.ballPosition.y, w, h);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();
  }, [phase, sport, mode, showHome, showAway]);

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

    // Collect start → end positions, filtering by team visibility
    // Animate each player along their run arrow using bezier curves
    const targets = phase.runs
      .filter(r => (r.team === 'home' && showHome) || (r.team === 'away' && showAway))
      .map(run => ({
        id: run.playerId,
        team: run.team,
        startRx: run.startX,
        startRy: run.startY,
        endRx: run.endX,
        endRy: run.endY,
        cpX: run.cpX,
        cpY: run.cpY,
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

      // Interpolate players with runs using quadratic bezier curves
      const bezierPoint = (t: number, p0: number, p1: number, p2: number): number => {
        const t1 = 1 - t;
        return t1 * t1 * p0 + 2 * t1 * t * p1 + t * t * p2;
      };

      const animatedHome = (showHome ? phase.playerPositions.home : []).map(p => {
        const target = animStartPositionsRef.current.find(a => a.id === p.id && a.team === 'home');
        if (!target) return p;
        const cpRx = target.cpX !== undefined ? target.cpX : (target.startRx + target.endRx) / 2;
        const cpRy = target.cpY !== undefined ? target.cpY : (target.startRy + target.endRy) / 2;
        return {
          ...p,
          rx: bezierPoint(eased, target.startRx, cpRx, target.endRx),
          ry: bezierPoint(eased, target.startRy, cpRy, target.endRy),
        };
      });
      const animatedAway = (showAway ? phase.playerPositions.away : []).map(p => {
        const target = animStartPositionsRef.current.find(a => a.id === p.id && a.team === 'away');
        if (!target) return p;
        const cpRx = target.cpX !== undefined ? target.cpX : (target.startRx + target.endRx) / 2;
        const cpRy = target.cpY !== undefined ? target.cpY : (target.startRy + target.endRy) / 2;
        return {
          ...p,
          rx: bezierPoint(eased, target.startRx, cpRx, target.endRx),
          ry: bezierPoint(eased, target.startRy, cpRy, target.endRy),
        };
      });

      // Filter runs by team visibility
      const visibleRuns = phase.runs.filter(r =>
        (r.team === 'home' && showHome) || (r.team === 'away' && showAway)
      );

      drawRuns(ctx, w, h, visibleRuns);
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
  }, [animating, animationSpeed, phase, sport, setAnimating, showHome, showAway]);

  // Interaction state
  const dragRef = useRef<{ type: 'player' | 'ball' | 'controlPoint'; id?: number; team?: 'home' | 'away' } | null>(null);
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

    // Control point hit-testing in draw mode (before player testing)
    if (mode === 'draw') {
      const CP_HIT_RADIUS = 8;
      for (const run of phase.runs) {
        const sx = run.startX * w;
        const sy = run.startY * h;
        const ex = run.endX * w;
        const ey = run.endY * h;
        const cpXpx = run.cpX !== undefined ? run.cpX * w : (sx + ex) / 2;
        const cpYpx = run.cpY !== undefined ? run.cpY * h : (sy + ey) / 2;

        if (Math.hypot(x - cpXpx, y - cpYpx) <= CP_HIT_RADIUS) {
          dragRef.current = { type: 'controlPoint', id: run.playerId, team: run.team };
          return;  // early return prevents starting a new run draw
        }
      }
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

    if (mode === 'draw' && dragRef.current?.type === 'controlPoint') {
      const rel = toRelative(x, y, w, h);
      const cpX = Math.max(0, Math.min(1, rel.rx));
      const cpY = Math.max(0, Math.min(1, rel.ry));
      updateRunControlPoint(currentPhase, dragRef.current.id!, cpX, cpY);
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
