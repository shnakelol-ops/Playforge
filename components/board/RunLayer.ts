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
    const color = run.team === 'home' ? 'rgba(255,255,255,0.9)' : '#f5a623';
    drawArrow(ctx, sx, sy, ex, ey, run.style, color);
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  style: 'run' | 'decoy' | 'pass',
  color: string
) {
  const headLen = 12;
  const angle = Math.atan2(ey - sy, ex - sx);

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
  ctx.lineTo(ex, ey);
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
