import type { Run } from '@/lib/store';

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

function drawArrow(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  cpX: number,
  cpY: number,
  ex: number,
  ey: number,
  style: 'run' | 'decoy' | 'pass',
  color: string
) {
  const headLen = 12;

  // Arrowhead angle: tangent at curve end points from control point to endpoint
  // For quadratic bezier, derivative at t=1 is 2*(P2 - P1), which simplifies to direction from P1 to P2
  const tangentDX = ex - cpX;
  const tangentDY = ey - cpY;
  const angle = (Math.abs(tangentDX) < 0.001 && Math.abs(tangentDY) < 0.001)
    ? Math.atan2(ey - sy, ex - sx)  // fallback: degenerate case where cp = endpoint
    : Math.atan2(tangentDY, tangentDX);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  if (style === 'run') {
    ctx.setLineDash([]);
  } else if (style === 'decoy') {
    ctx.setLineDash([8, 4]);
  } else {
    ctx.setLineDash([3, 3]);
  }

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.quadraticCurveTo(cpX, cpY, ex, ey);  // bezier curve instead of straight line
  ctx.stroke();

  // Arrowhead (always solid)
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(
    ex - headLen * Math.cos(angle - Math.PI / 6),
    ey - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    ex - headLen * Math.cos(angle + Math.PI / 6),
    ey - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
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
