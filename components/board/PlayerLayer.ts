import type { Player } from '@/lib/store';

export function drawPlayers(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  home: Player[],
  away: Player[],
  radius: number
) {
  for (const p of home) {
    drawPlayer(ctx, w, h, p, radius, '#00e07a', '#00b862');
  }
  for (const p of away) {
    drawPlayer(ctx, w, h, p, radius, '#f5a623', '#c47d0a');
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  player: Player,
  radius: number,
  fill: string,
  stroke: string
) {
  const x = player.rx * w;
  const y = player.ry * h;

  // Circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Jersey number
  ctx.fillStyle = '#0b0f18';
  ctx.font = `bold ${Math.round(radius * 0.85)}px "DM Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(player.num, x, y);

  // Position label below
  ctx.font = `${Math.round(radius * 0.6)}px "DM Sans", sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textBaseline = 'top';
  ctx.fillText(player.pos, x, y + radius + 2);
}
