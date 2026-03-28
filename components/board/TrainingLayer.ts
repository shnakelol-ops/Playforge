import type { TrainingItem } from '@/lib/store';
import { drawArrow } from './arrowUtils';

export function drawTrainingItems(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  items: TrainingItem[],
  selectedId: string | null
) {
  for (const item of items) {
    const x = item.rx * w;
    const y = item.ry * h;

    ctx.save();

    // Draw animated path if present
    if (item.runEndX !== undefined && item.runEndY !== undefined) {
      const sx = item.rx * w;
      const sy = item.ry * h;
      const ex = item.runEndX * w;
      const ey = item.runEndY * h;
      const cpX = item.runCpX !== undefined ? item.runCpX * w : (sx + ex) / 2;
      const cpY = item.runCpY !== undefined ? item.runCpY * h : (sy + ey) / 2;
      const color = '#888888';
      drawArrow(ctx, sx, sy, cpX, cpY, ex, ey, 'run', color);
    }

    // Draw item icon
    switch (item.type) {
      case 'cone':
        drawCone(ctx, x, y);
        break;
      case 'ball':
        drawBall(ctx, x, y);
        break;
      case 'pole':
        drawPole(ctx, x, y);
        break;
      case 'ladder':
        drawLadder(ctx, x, y);
        break;
      case 'hurdle':
        drawHurdle(ctx, x, y);
        break;
      case 'mannequin':
        drawMannequin(ctx, x, y);
        break;
      case 'mini-goal':
        drawMiniGoal(ctx, x, y);
        break;
      case 'zone-marker':
        drawZoneMarker(ctx, x, y);
        break;
    }

    // Draw selection ring
    if (item.id === selectedId) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

function drawCone(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#fb923c';
  ctx.beginPath();
  ctx.moveTo(x, y - 9);
  ctx.lineTo(x + 7, y + 9);
  ctx.lineTo(x - 7, y + 9);
  ctx.closePath();
  ctx.fill();
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPole(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 2, y - 10, 4, 20);

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x + 4, y - 6);
  ctx.lineTo(x - 4, y - 6);
  ctx.closePath();
  ctx.fill();
}

function drawLadder(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1;
  const cellW = 10;
  const cellH = 5;

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.strokeRect(
        x - 10 + col * cellW,
        y - 10 + row * cellH,
        cellW,
        cellH
      );
    }
  }
}

function drawHurdle(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  // Left post
  ctx.strokeRect(x - 10, y - 8, 4, 16);
  // Right post
  ctx.strokeRect(x + 6, y - 8, 4, 16);
  // Horizontal bar
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.lineTo(x + 10, y);
  ctx.stroke();
}

function drawMannequin(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#a78bfa';
  // Head
  ctx.beginPath();
  ctx.arc(x, y - 8, 6, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillRect(x - 2, y - 2, 4, 10);
}

function drawMiniGoal(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;

  // Goal frame: 3 sides (open on right)
  ctx.beginPath();
  ctx.moveTo(x - 15, y - 6);
  ctx.lineTo(x - 15, y + 6);
  ctx.lineTo(x + 0, y + 6);
  ctx.lineTo(x + 0, y - 6);
  ctx.lineTo(x - 15, y - 6);
  ctx.stroke();
}

function drawZoneMarker(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
}

export function drawTrainingItemControlPoint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  items: TrainingItem[]
) {
  for (const item of items) {
    if (item.runEndX === undefined || item.runEndY === undefined) continue;

    const sx = item.rx * w;
    const sy = item.ry * h;
    const ex = item.runEndX * w;
    const ey = item.runEndY * h;
    const cpXpx = item.runCpX !== undefined ? item.runCpX * w : (sx + ex) / 2;
    const cpYpx = item.runCpY !== undefined ? item.runCpY * h : (sy + ey) / 2;

    ctx.save();

    // Dashed guide line
    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2;
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(cpXpx, cpYpx);
    ctx.stroke();

    // Control point circle
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(cpXpx, cpYpx, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0b0f18';
    ctx.fill();
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}
