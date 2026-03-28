import type { Run } from '@/lib/store';
import { drawArrow } from './arrowUtils';

export function drawRuns(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  runs: Run[]
) {
  for (const run of runs) {
    const sx = run.startX * w;
    const sy = run.startY * h;
    const ex = run.endX * w;
    const ey = run.endY * h;
    // Control point: use stored value or fallback to midpoint for backward compat
    const cpX = run.cpX !== undefined ? run.cpX * w : (sx + ex) / 2;
    const cpY = run.cpY !== undefined ? run.cpY * h : (sy + ey) / 2;
    const color = run.team === 'home' ? 'rgba(255,255,255,0.9)' : '#f5a623';
    drawArrow(ctx, sx, sy, cpX, cpY, ex, ey, run.style, color);
  }
}

export function drawControlPointHandles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  runs: Run[]
) {
  for (const run of runs) {
    const sx = run.startX * w;
    const sy = run.startY * h;
    const ex = run.endX * w;
    const ey = run.endY * h;
    const cpXpx = run.cpX !== undefined ? run.cpX * w : (sx + ex) / 2;
    const cpYpx = run.cpY !== undefined ? run.cpY * h : (sy + ey) / 2;
    const color = run.team === 'home' ? 'rgba(255,255,255,0.9)' : '#f5a623';

    ctx.save();

    // Dashed guide line from straight-line midpoint to control point
    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(cpXpx, cpYpx);
    ctx.stroke();

    // Control point handle circle
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(cpXpx, cpYpx, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0b0f18';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}
