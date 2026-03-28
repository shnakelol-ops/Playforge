export function drawArrow(
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
