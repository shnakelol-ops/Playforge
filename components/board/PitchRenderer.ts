import type { Sport } from '@/lib/pitch-config';
import { CANVAS_COLORS } from '@/lib/team-colors';

export function drawPitch(ctx: CanvasRenderingContext2D, w: number, h: number, sport: Sport) {
  // Background
  ctx.fillStyle = CANVAS_COLORS.pitch.grass;
  ctx.fillRect(0, 0, w, h);

  // Grass stripes
  const stripeCount = 10;
  for (let i = 0; i < stripeCount; i++) {
    if (i % 2 === 0) {
      ctx.fillStyle = CANVAS_COLORS.pitch.grassStripe;
      ctx.fillRect(0, (i / stripeCount) * h, w, h / stripeCount);
    }
  }

  ctx.strokeStyle = CANVAS_COLORS.pitch.line;
  ctx.lineWidth = 1.5;

  if (sport === 'soccer') {
    drawSoccerPitch(ctx, w, h);
  } else {
    drawGAAPitch(ctx, w, h, sport === 'hurling');
  }
}

function drawSoccerPitch(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const pad = w * 0.04;
  const top = h * 0.03;
  const bottom = h * 0.97;
  const left = pad;
  const right = w - pad;

  // Outer boundary
  ctx.strokeRect(left, top, right - left, bottom - top);

  // Centre line
  ctx.beginPath();
  ctx.moveTo(left, h / 2);
  ctx.lineTo(right, h / 2);
  ctx.stroke();

  // Centre circle
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.10, 0, Math.PI * 2);
  ctx.stroke();

  // Centre dot
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = CANVAS_COLORS.pitch.penaltySpot;
  ctx.fill();

  // Penalty areas
  const paW = (right - left) * 0.55;
  const paH = h * 0.15;
  const paCX = w / 2;

  // Top penalty area
  ctx.strokeRect(paCX - paW / 2, top, paW, paH);
  // Bottom penalty area
  ctx.strokeRect(paCX - paW / 2, bottom - paH, paW, paH);

  // Goal areas
  const gaW = paW * 0.45;
  const gaH = paH * 0.40;
  ctx.strokeRect(paCX - gaW / 2, top, gaW, gaH);
  ctx.strokeRect(paCX - gaW / 2, bottom - gaH, gaW, gaH);

  // D-arcs on penalty areas
  const dArcR = w * 0.06;
  ctx.beginPath();
  ctx.arc(paCX, top + paH, dArcR, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(paCX, bottom - paH, dArcR, Math.PI, 0);
  ctx.stroke();

  // Penalty spots
  const penaltySpotX = paCX;
  const penaltySpotY1 = top + paH * 0.4;
  const penaltySpotY2 = bottom - paH * 0.4;
  ctx.beginPath();
  ctx.arc(penaltySpotX, penaltySpotY1, 2, 0, Math.PI * 2);
  ctx.fillStyle = CANVAS_COLORS.pitch.penaltySpot;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(penaltySpotX, penaltySpotY2, 2, 0, Math.PI * 2);
  ctx.fill();

  // Goals
  const goalW = gaW * 0.7;
  const goalH = h * 0.025;
  ctx.strokeRect(paCX - goalW / 2, top - goalH, goalW, goalH);
  ctx.strokeRect(paCX - goalW / 2, bottom, goalW, goalH);

  // Corner arcs
  const arcR = w * 0.018;
  [[left, top], [right, top], [left, bottom], [right, bottom]].forEach(([cx, cy], i) => {
    ctx.beginPath();
    const startAngle = [0, Math.PI / 2, -Math.PI / 2, Math.PI][i];
    ctx.arc(cx, cy, arcR, startAngle, startAngle + Math.PI / 2);
    ctx.stroke();
  });
}

function drawGAAPitch(ctx: CanvasRenderingContext2D, w: number, h: number, isHurling: boolean) {
  const pad = w * 0.04;
  const top = h * 0.03;
  const bottom = h * 0.97;
  const left = pad;
  const right = w - pad;
  const pitchH = bottom - top;

  // Outer boundary
  ctx.strokeRect(left, top, right - left, pitchH);

  // Centre line
  ctx.beginPath();
  ctx.moveTo(left, h / 2);
  ctx.lineTo(right, h / 2);
  ctx.stroke();

  // Centre circle
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.08, 0, Math.PI * 2);
  ctx.stroke();

  // 45m lines (from each end)
  const line45 = pitchH * 0.27;
  ctx.beginPath();
  ctx.moveTo(left, top + line45);
  ctx.lineTo(right, top + line45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(left, bottom - line45);
  ctx.lineTo(right, bottom - line45);
  ctx.stroke();

  // 65m lines
  const line65 = pitchH * 0.39;
  ctx.beginPath();
  ctx.moveTo(left, top + line65);
  ctx.lineTo(right, top + line65);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(left, bottom - line65);
  ctx.lineTo(right, bottom - line65);
  ctx.stroke();

  // 20m lines (hurling only)
  if (isHurling) {
    const line20 = pitchH * 0.14;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(left, top + line20);
    ctx.lineTo(right, top + line20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(left, bottom - line20);
    ctx.lineTo(right, bottom - line20);
    ctx.stroke();
    ctx.restore();
  }

  // Goal areas + goals at each end
  drawGAAGoalEnd(ctx, w, h, left, right, top, true);
  drawGAAGoalEnd(ctx, w, h, left, right, bottom, false);

  // Penalty spots
  const penaltyY = pitchH * 0.07;
  ctx.beginPath();
  ctx.arc(w / 2, top + penaltyY, 3, 0, Math.PI * 2);
  ctx.fillStyle = CANVAS_COLORS.pitch.penaltySpot;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w / 2, bottom - penaltyY, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawGAAGoalEnd(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  left: number,
  right: number,
  endY: number,
  isTop: boolean
) {
  const pitchW = right - left;

  // Small rectangle (goal area)
  const smallW = pitchW * 0.30;
  const smallH = h * 0.055 * (isTop ? 1 : -1);
  ctx.strokeRect(w / 2 - smallW / 2, endY, smallW, smallH);

  // Large rectangle
  const largeW = pitchW * 0.55;
  const largeH = h * 0.10 * (isTop ? 1 : -1);
  ctx.strokeRect(w / 2 - largeW / 2, endY, largeW, largeH);

  // D semi-circle
  const dR = h * 0.08;
  ctx.beginPath();
  if (isTop) {
    ctx.arc(w / 2, endY + largeH, dR, Math.PI, 0);
  } else {
    ctx.arc(w / 2, endY + largeH, dR, 0, Math.PI);
  }
  ctx.stroke();

  // Goal posts
  const goalW = pitchW * 0.085;
  const goalH = h * 0.04 * (isTop ? 1 : -1);
  const crossbarH = h * 0.025 * (isTop ? 1 : -1);

  // Posts
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(w / 2 - goalW / 2, endY);
  ctx.lineTo(w / 2 - goalW / 2, endY - goalH * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w / 2 + goalW / 2, endY);
  ctx.lineTo(w / 2 + goalW / 2, endY - goalH * 2);
  ctx.stroke();

  // Crossbar
  ctx.beginPath();
  ctx.moveTo(w / 2 - goalW / 2, endY - crossbarH);
  ctx.lineTo(w / 2 + goalW / 2, endY - crossbarH);
  ctx.stroke();
  ctx.lineWidth = 1.5;
}
