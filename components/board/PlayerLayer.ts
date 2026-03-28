import type { Player, PlayerDisplayMode } from '@/lib/store';

export function drawPlayers(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  home: Player[],
  away: Player[],
  radius: number,
  displayMode: PlayerDisplayMode = 'number',
  showNumbers: boolean = true,
  showPositions: boolean = false
) {
  for (const p of home) {
    drawPlayer(ctx, w, h, p, radius, '#00e07a', '#00b862', displayMode, showNumbers, showPositions);
  }
  for (const p of away) {
    drawPlayer(ctx, w, h, p, radius, '#f5a623', '#c47d0a', displayMode, showNumbers, showPositions);
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  player: Player,
  radius: number,
  fill: string,
  stroke: string,
  displayMode: PlayerDisplayMode = 'number',
  showNumbers: boolean = true,
  showPositions: boolean = false
) {
  const x = player.rx * w;
  const y = player.ry * h;

  ctx.save();

  // Draw main shape (circle or bib)
  if (displayMode === 'bib') {
    // Bib shape (rounded rect)
    const bibWidth = radius * 1.8;
    const bibHeight = radius * 2.4;
    ctx.fillStyle = fill;
    drawRoundRect(ctx, x - bibWidth / 2, y - bibHeight / 2, bibWidth, bibHeight, radius / 2);
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    drawRoundRect(ctx, x - bibWidth / 2, y - bibHeight / 2, bibWidth, bibHeight, radius / 2);
    ctx.stroke();
  } else {
    // Circle (default for number and name modes)
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw center content based on display mode
  ctx.fillStyle = '#0b0f18';
  ctx.font = `bold ${Math.round(radius * 0.85)}px "DM Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (displayMode === 'number') {
    if (showNumbers) {
      ctx.fillText(player.num, x, y);
    }
  } else if (displayMode === 'name') {
    const displayName = player.name ?? player.num;
    ctx.font = `${Math.round(radius * 0.7)}px "DM Sans", sans-serif`;
    ctx.fillText(displayName, x, y);
  } else if (displayMode === 'bib') {
    ctx.fillText(player.num, x, y);
  }

  // Position label below
  if (showPositions) {
    ctx.font = `${Math.round(radius * 0.6)}px "DM Sans", sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.textBaseline = 'top';
    ctx.fillText(player.pos, x, y + radius + 2);
  }

  ctx.restore();
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}
