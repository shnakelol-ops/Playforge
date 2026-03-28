'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useBoardStore } from '@/lib/store';
import type { Player, FreehandStroke } from '@/lib/store';
import { easeInOut, toPixel, toRelative, hitTest } from '@/lib/canvas-utils';
import { drawPitch } from './PitchRenderer';
import { drawPlayers } from './PlayerLayer';
import { drawRuns, drawControlPointHandles } from './RunLayer';
import { drawTrainingItems, drawTrainingItemControlPoint } from './TrainingLayer';
import { drawInkStrokes } from './InkLayer';
import { drawTextLabels } from './TextLayer';

const PLAYER_RADIUS_DESKTOP = 14;
const PLAYER_RADIUS_MOBILE = 12;
const BALL_RADIUS = 8;

function getPlayerRadius(canvas: HTMLCanvasElement) {
  return canvas.width < 600 ? PLAYER_RADIUS_MOBILE : PLAYER_RADIUS_DESKTOP;
}

export default function TacticsBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const animStartRef = useRef<number>(0);
  const animStartPositionsRef = useRef<{ id: number; team: 'home' | 'away'; startRx: number; startRy: number; endRx: number; endRy: number; cpX?: number; cpY?: number }[]>([]);
  const inkStrokeRef = useRef<FreehandStroke | null>(null);
  const inkPointsRef = useRef<Array<{ rx: number; ry: number }>>([]);
  const [textInputState, setTextInputState] = useState<{ visible: boolean; cx: number; cy: number; rx: number; ry: number; value: string } | null>(null);

  const {
    sport, mode, runStyle, phases, currentPhase,
    animating, animationSpeed,
    showHome, showAway,
    inkColor, inkWidth, inkShapeType, isZoneFill,
    selectedTrainingType, playerDisplayMode, showNumbers, showPositions,
    selectedEntityId,
    updatePlayerPosition, addRun, updateRunControlPoint, setBallPosition,
    setAnimating, addTrainingItem, moveTrainingItem, removeTrainingItem, updateTrainingItemPath,
    addInkStroke, addTextLabel, moveTextLabel, removeTextLabel,
    setSelectedEntityId,
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

    // Render layers in order
    drawInkStrokes(ctx, w, h, phase.inkStrokes ?? []);
    drawRuns(ctx, w, h, visibleRuns);
    if (mode === 'draw') {
      drawControlPointHandles(ctx, w, h, visibleRuns);
    }
    drawTrainingItems(ctx, w, h, phase.trainingItems ?? [], selectedEntityId);
    if (mode === 'draw') {
      drawTrainingItemControlPoint(ctx, w, h, phase.trainingItems ?? []);
    }
    drawPlayers(ctx, w, h, visibleHome, visibleAway, getPlayerRadius(canvas), playerDisplayMode, showNumbers, showPositions);

    // Ball
    const ball = toPixel(phase.ballPosition.x, phase.ballPosition.y, w, h);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    drawTextLabels(ctx, w, h, phase.textLabels ?? [], selectedEntityId);
  }, [phase, sport, mode, showHome, showAway, playerDisplayMode, showNumbers, showPositions, selectedEntityId]);

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

      // Animate training items with paths
      const animatedTrainingItems = (phase.trainingItems ?? []).map(item => {
        if (!item.runEndX || !item.runEndY) return item;
        const cpRx = item.runCpX !== undefined ? item.runCpX : (item.rx + item.runEndX) / 2;
        const cpRy = item.runCpY !== undefined ? item.runCpY : (item.ry + item.runEndY) / 2;
        return {
          ...item,
          rx: bezierPoint(eased, item.rx, cpRx, item.runEndX),
          ry: bezierPoint(eased, item.ry, cpRy, item.runEndY),
        };
      });

      // Filter runs by team visibility
      const visibleRuns = phase.runs.filter(r =>
        (r.team === 'home' && showHome) || (r.team === 'away' && showAway)
      );

      drawInkStrokes(ctx, w, h, phase.inkStrokes ?? []);
      drawRuns(ctx, w, h, visibleRuns);
      drawTrainingItems(ctx, w, h, animatedTrainingItems, selectedEntityId);
      drawPlayers(ctx, w, h, animatedHome, animatedAway, getPlayerRadius(canvas), playerDisplayMode, showNumbers, showPositions);

      // Ball
      const ball = toPixel(phase.ballPosition.x, phase.ballPosition.y, w, h);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      drawTextLabels(ctx, w, h, phase.textLabels ?? [], selectedEntityId);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setAnimating(false);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animating, animationSpeed, phase, sport, setAnimating, showHome, showAway, playerDisplayMode, showNumbers, showPositions, selectedEntityId]);

  // Interaction state
  const dragRef = useRef<{ type: 'player' | 'ball' | 'controlPoint' | 'trainingItem' | 'trainingItemCp' | 'textLabel'; id?: number | string; team?: 'home' | 'away' } | null>(null);
  const drawStartRef = useRef<{ id: number | string; team?: 'home' | 'away'; sx: number; sy: number; isTrainingItem?: boolean } | null>(null);

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
    const rel = toRelative(x, y, w, h);

    if (mode === 'ball') {
      dragRef.current = { type: 'ball' };
      return;
    }

    // Training mode: place training item
    if (mode === 'training' && selectedTrainingType) {
      const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
      addTrainingItem(currentPhase, {
        id: uuid(),
        type: selectedTrainingType,
        rx: Math.max(0, Math.min(1, rel.rx)),
        ry: Math.max(0, Math.min(1, rel.ry)),
      });
      return;
    }

    // Ink mode: start stroke
    if (mode === 'ink') {
      const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
      inkStrokeRef.current = {
        id: uuid(),
        shapeType: inkShapeType,
        color: inkColor,
        width: inkWidth,
        isZoneFill,
        ...(inkShapeType === 'freehand' ? { points: [{ rx: rel.rx, ry: rel.ry }] } : { x1: rel.rx, y1: rel.ry }),
      };
      inkPointsRef.current = inkShapeType === 'freehand' ? [{ rx: rel.rx, ry: rel.ry }] : [];
      return;
    }

    // Draw mode: training item CP hit-test (before run CP)
    if (mode === 'draw') {
      const CP_HIT_RADIUS = 8;
      for (const item of phase.trainingItems ?? []) {
        if (!item.runEndX || !item.runEndY) continue;
        const sx = item.rx * w;
        const sy = item.ry * h;
        const ex = item.runEndX * w;
        const ey = item.runEndY * h;
        const cpXpx = item.runCpX !== undefined ? item.runCpX * w : (sx + ex) / 2;
        const cpYpx = item.runCpY !== undefined ? item.runCpY * h : (sy + ey) / 2;

        if (Math.hypot(x - cpXpx, y - cpYpx) <= CP_HIT_RADIUS) {
          dragRef.current = { type: 'trainingItemCp', id: item.id };
          return;
        }
      }

      // Draw mode: training item path start (before run CP)
      for (const item of phase.trainingItems ?? []) {
        if (Math.hypot(x - item.rx * w, y - item.ry * h) <= 16) {
          drawStartRef.current = { id: item.id, sx: item.rx * w, sy: item.ry * h, isTrainingItem: true };
          return;
        }
      }
    }

    // Run control point hit-testing in draw mode (before player testing)
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

    // Move mode: training item and text label hit test (before players)
    if (mode === 'move') {
      for (const item of phase.trainingItems ?? []) {
        if (Math.hypot(x - item.rx * w, y - item.ry * h) <= 16) {
          dragRef.current = { type: 'trainingItem', id: item.id };
          setSelectedEntityId(item.id);
          return;
        }
      }

      for (const label of phase.textLabels ?? []) {
        const labelX = label.rx * w;
        const labelY = label.ry * h;
        const fontSize = (label.fontSize * Math.min(w, h)) / 400;
        const metrics = new OffscreenCanvas(100, 100).getContext('2d')!;
        metrics.font = `${fontSize}px "DM Sans", sans-serif`;
        const textMetrics = metrics.measureText(label.text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;

        if (x >= labelX - textWidth / 2 - 4 && x <= labelX + textWidth / 2 + 4 &&
            y >= labelY - textHeight / 2 - 2 && y <= labelY + textHeight / 2 + 2) {
          dragRef.current = { type: 'textLabel', id: label.id };
          setSelectedEntityId(label.id);
          return;
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
          setSelectedEntityId(null);
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
    const rel = toRelative(x, y, w, h);

    if (mode === 'move' && dragRef.current?.type === 'player') {
      const rx = Math.max(0, Math.min(1, rel.rx));
      const ry = Math.max(0, Math.min(1, rel.ry));
      updatePlayerPosition(currentPhase, dragRef.current.team!, dragRef.current.id as number, rx, ry);
    }

    if (mode === 'move' && dragRef.current?.type === 'trainingItem') {
      const rx = Math.max(0, Math.min(1, rel.rx));
      const ry = Math.max(0, Math.min(1, rel.ry));
      moveTrainingItem(currentPhase, dragRef.current.id as string, rx, ry);
    }

    if (mode === 'move' && dragRef.current?.type === 'textLabel') {
      const rx = Math.max(0, Math.min(1, rel.rx));
      const ry = Math.max(0, Math.min(1, rel.ry));
      moveTextLabel(currentPhase, dragRef.current.id as string, rx, ry);
    }

    if (mode === 'ball' && dragRef.current?.type === 'ball') {
      setBallPosition(currentPhase, { x: Math.max(0, Math.min(1, rel.rx)), y: Math.max(0, Math.min(1, rel.ry)) });
    }

    if (mode === 'draw' && dragRef.current?.type === 'controlPoint') {
      const cpX = Math.max(0, Math.min(1, rel.rx));
      const cpY = Math.max(0, Math.min(1, rel.ry));
      updateRunControlPoint(currentPhase, dragRef.current.id as number, cpX, cpY);
    }

    if (mode === 'draw' && dragRef.current?.type === 'trainingItemCp') {
      const cpX = Math.max(0, Math.min(1, rel.rx));
      const cpY = Math.max(0, Math.min(1, rel.ry));
      updateTrainingItemPath(currentPhase, dragRef.current.id as string, 0, 0, cpX, cpY);
    }

    if (mode === 'ink' && inkStrokeRef.current) {
      if (inkShapeType === 'freehand') {
        inkPointsRef.current.push({ rx: rel.rx, ry: rel.ry });
        inkStrokeRef.current = { ...inkStrokeRef.current, points: [...inkPointsRef.current] };
      } else {
        inkStrokeRef.current = { ...inkStrokeRef.current, x2: rel.rx, y2: rel.ry };
      }
      draw();
      // Draw preview of ink stroke
      const ctx = canvas.getContext('2d')!;
      ctx.save();
      drawInkStrokes(ctx, w, h, [inkStrokeRef.current]);
      ctx.restore();
    }

    if (mode === 'draw' && drawStartRef.current) {
      // Preview line while dragging
      draw();
      const ctx = canvas.getContext('2d')!;
      const { sx, sy, isTrainingItem } = drawStartRef.current;
      ctx.save();
      if (!isTrainingItem) {
        ctx.strokeStyle = drawStartRef.current.team === 'home' ? '#ffffff' : '#f5a623';
        ctx.lineWidth = 2;
        if (runStyle === 'decoy') ctx.setLineDash([8, 4]);
        else if (runStyle === 'pass') ctx.setLineDash([3, 3]);
        else ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 2;
      }
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

    // Ink stroke completion
    if (mode === 'ink' && inkStrokeRef.current) {
      const stroke = inkStrokeRef.current;
      let isValid = false;

      if (stroke.shapeType === 'freehand' && stroke.points && stroke.points.length >= 2) {
        isValid = true;
      } else if (stroke.shapeType !== 'freehand' && stroke.x1 !== undefined && stroke.y1 !== undefined &&
                 stroke.x2 !== undefined && stroke.y2 !== undefined) {
        const dist = Math.hypot(
          (stroke.x2 - stroke.x1) * Math.min(w, h),
          (stroke.y2 - stroke.y1) * Math.min(w, h)
        );
        if (dist > 5) isValid = true;
      }

      if (isValid) {
        addInkStroke(currentPhase, stroke);
      }
      inkStrokeRef.current = null;
      inkPointsRef.current = [];
    }

    if (mode === 'draw' && drawStartRef.current) {
      const { id, team, sx, sy, isTrainingItem } = drawStartRef.current;
      const dist = Math.hypot(x - sx, y - sy);
      if (dist > 20) {
        const startRel = toRelative(sx, sy, w, h);
        const endRel = toRelative(x, y, w, h);

        if (isTrainingItem) {
          const cpX = (startRel.rx + endRel.rx) / 2;
          const cpY = (startRel.ry + endRel.ry) / 2;
          updateTrainingItemPath(currentPhase, id as string, endRel.rx, endRel.ry, cpX, cpY);
        } else {
          addRun(currentPhase, {
            playerId: id as number,
            startX: startRel.rx,
            startY: startRel.ry,
            endX: endRel.rx,
            endY: endRel.ry,
            style: runStyle,
            team: team!,
          });
        }
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

  function handleDoubleClick(e: React.MouseEvent) {
    if (mode !== 'move') return;
    const { x, y } = getCanvasPoint(e);
    const canvas = canvasRef.current!;
    const { width: w, height: h } = canvas;
    const rel = toRelative(x, y, w, h);

    // Check if no entity was hit
    for (const item of phase.trainingItems ?? []) {
      if (Math.hypot(x - item.rx * w, y - item.ry * h) <= 16) return;
    }
    for (const label of phase.textLabels ?? []) {
      const labelX = label.rx * w;
      const labelY = label.ry * h;
      const fontSize = (label.fontSize * Math.min(w, h)) / 400;
      const metrics = new OffscreenCanvas(100, 100).getContext('2d')!;
      metrics.font = `${fontSize}px "DM Sans", sans-serif`;
      const textMetrics = metrics.measureText(label.text);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;
      if (x >= labelX - textWidth / 2 - 4 && x <= labelX + textWidth / 2 + 4 &&
          y >= labelY - textHeight / 2 - 2 && y <= labelY + textHeight / 2 + 2) return;
    }

    setTextInputState({ visible: true, cx: e.clientX, cy: e.clientY, rx: rel.rx, ry: rel.ry, value: '' });
  }

  // Keyboard delete handler
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement as Element)?.tagName)) return;
      if (!selectedEntityId) return;
      e.preventDefault();

      const item = (phase.trainingItems ?? []).find(i => i.id === selectedEntityId);
      if (item) {
        removeTrainingItem(currentPhase, selectedEntityId);
        setSelectedEntityId(null);
        return;
      }

      const label = (phase.textLabels ?? []).find(l => l.id === selectedEntityId);
      if (label) {
        removeTextLabel(currentPhase, selectedEntityId);
        setSelectedEntityId(null);
        return;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedEntityId, phase, currentPhase, removeTrainingItem, removeTextLabel, setSelectedEntityId]);

  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ aspectRatio: '145 / 90' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          touchAction: 'none',
          cursor: mode === 'draw' ? 'crosshair' : mode === 'ball' ? 'grab' : mode === 'ink' ? 'crosshair' : mode === 'training' ? 'cell' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { dragRef.current = null; drawStartRef.current = null; }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      />
      {textInputState?.visible && (
        <input
          type="text"
          autoFocus
          value={textInputState.value}
          onChange={(e) => setTextInputState({ ...textInputState, value: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && textInputState.value.trim()) {
              const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
              addTextLabel(currentPhase, {
                id: uuid(),
                text: textInputState.value,
                rx: textInputState.rx,
                ry: textInputState.ry,
                fontSize: 14,
                color: '#ffffff',
              });
              setTextInputState(null);
            } else if (e.key === 'Escape') {
              setTextInputState(null);
            }
          }}
          onBlur={() => setTextInputState(null)}
          style={{
            position: 'fixed',
            left: `${textInputState.cx}px`,
            top: `${textInputState.cy}px`,
            zIndex: 50,
            padding: '4px 8px',
            fontSize: '14px',
            border: '1px solid var(--acc)',
            borderRadius: '4px',
            backgroundColor: 'var(--bg)',
            color: 'var(--txt)',
          }}
        />
      )}
    </div>
  );
}
