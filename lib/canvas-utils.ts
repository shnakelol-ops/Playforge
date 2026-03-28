// Shared canvas utility functions used across board and pressing components

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function toPixel(rx: number, ry: number, w: number, h: number) {
  return { x: rx * w, y: ry * h };
}

export function toRelative(x: number, y: number, w: number, h: number) {
  return { rx: x / w, ry: y / h };
}

export function hitTest(px: number, py: number, rx: number, ry: number, w: number, h: number, radius: number) {
  const { x, y } = toPixel(rx, ry, w, h);
  return Math.hypot(px - x, py - y) <= radius + 4;
}
