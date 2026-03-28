import type { FreehandStroke } from '@/lib/store';
import { INK_COLORS, INK_WIDTHS } from '@/lib/pitch-config';
import { drawArrow } from './arrowUtils';

export function drawInkStrokes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  strokes: FreehandStroke[]
) {
  for (const stroke of strokes) {
    ctx.save();

    const color = INK_COLORS[stroke.color];
    const width = INK_WIDTHS[stroke.width];

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (stroke.shapeType) {
      case 'freehand':
        if (stroke.points && stroke.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].rx * w, stroke.points[0].ry * h);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].rx * w, stroke.points[i].ry * h);
          }
          ctx.stroke();
        }
        break;

      case 'line':
        if (stroke.x1 !== undefined && stroke.y1 !== undefined && stroke.x2 !== undefined && stroke.y2 !== undefined) {
          ctx.beginPath();
          ctx.moveTo(stroke.x1 * w, stroke.y1 * h);
          ctx.lineTo(stroke.x2 * w, stroke.y2 * h);
          ctx.stroke();
        }
        break;

      case 'arrow':
        if (stroke.x1 !== undefined && stroke.y1 !== undefined && stroke.x2 !== undefined && stroke.y2 !== undefined) {
          const sx = stroke.x1 * w;
          const sy = stroke.y1 * h;
          const ex = stroke.x2 * w;
          const ey = stroke.y2 * h;
          const cpX = (sx + ex) / 2;
          const cpY = (sy + ey) / 2;
          drawArrow(ctx, sx, sy, cpX, cpY, ex, ey, 'run', color);
        }
        break;

      case 'circle':
        if (stroke.x1 !== undefined && stroke.y1 !== undefined && stroke.x2 !== undefined && stroke.y2 !== undefined) {
          const cx = ((stroke.x1 + stroke.x2) / 2) * w;
          const cy = ((stroke.y1 + stroke.y2) / 2) * h;
          const dx = (stroke.x2 - stroke.x1) * w;
          const dy = (stroke.y2 - stroke.y1) * h;
          const radius = Math.hypot(dx, dy) / 2;

          if (stroke.isZoneFill) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case 'rect':
        if (stroke.x1 !== undefined && stroke.y1 !== undefined && stroke.x2 !== undefined && stroke.y2 !== undefined) {
          const x1 = stroke.x1 * w;
          const y1 = stroke.y1 * h;
          const x2 = stroke.x2 * w;
          const y2 = stroke.y2 * h;
          const width = x2 - x1;
          const height = y2 - y1;

          if (stroke.isZoneFill) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillRect(x1, y1, width, height);
            ctx.restore();
          }

          ctx.strokeRect(x1, y1, width, height);
        }
        break;
    }

    ctx.restore();
  }
}
