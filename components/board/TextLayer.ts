import type { TextLabel } from '@/lib/store';

export function drawTextLabels(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  labels: TextLabel[],
  selectedId: string | null
) {
  for (const label of labels) {
    const x = label.rx * w;
    const y = label.ry * h;

    ctx.save();

    const fontSize = (label.fontSize * Math.min(w, h)) / 400;
    ctx.font = `${fontSize}px "DM Sans", sans-serif`;
    ctx.fillStyle = label.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text
    ctx.fillText(label.text, x, y);

    // Draw selection rect
    if (label.id === selectedId) {
      const metrics = ctx.measureText(label.text);
      const textWidth = metrics.width;
      const textHeight = fontSize;

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(
        x - textWidth / 2 - 4,
        y - textHeight / 2 - 2,
        textWidth + 8,
        textHeight + 4
      );
    }

    ctx.restore();
  }
}
