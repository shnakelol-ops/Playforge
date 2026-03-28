'use client';

import { useEffect, useRef, useState } from 'react';
import { usePressStore } from '@/lib/press-store';
import { drawPitch } from '@/components/board/PitchRenderer';
import type { Sport } from '@/lib/pitch-config';

const ZONE_COLORS = {
  high: 'rgba(239, 68, 68, 0.45)',      // red
  mid: 'rgba(245, 158, 11, 0.45)',      // amber
  low: 'rgba(59, 130, 246, 0.45)',      // blue
};
const ZONE_COLORS_INACTIVE = {
  high: 'rgba(239, 68, 68, 0.15)',
  mid: 'rgba(245, 158, 11, 0.15)',
  low: 'rgba(59, 130, 246, 0.15)',
};

export default function ZonePitchCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { sport, zoneConfig, setZone, setTriggerLine } = usePressStore();
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [draggingHandle, setDraggingHandle] = useState(false);

  // ResizeObserver — reads both width and height set by aspect-ratio CSS
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(300, rect.width);
      const h = rect.height > 0 ? rect.height : w * (90 / 145);
      setCanvasSize({ w, h });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.w === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    // Draw pitch
    drawPitch(ctx, canvasSize.w, canvasSize.h, sport as Sport);

    // Draw zone overlays
    const zoneHeights = [0.33, 0.66];
    const zoneBounds = [
      { zone: 'high' as const, y: 0, h: zoneHeights[0] },
      { zone: 'mid' as const, y: zoneHeights[0], h: zoneHeights[1] - zoneHeights[0] },
      { zone: 'low' as const, y: zoneHeights[1], h: 1 - zoneHeights[1] },
    ];

    zoneBounds.forEach(({ zone, y, h }) => {
      const isSelected = zoneConfig.zone === zone;
      const color = isSelected ? ZONE_COLORS[zone] : ZONE_COLORS_INACTIVE[zone];
      ctx.fillStyle = color;
      ctx.fillRect(0, y * canvasSize.h, canvasSize.w, h * canvasSize.h);
    });

    // Draw trigger line (white dashed horizontal line)
    const triggerY = zoneConfig.triggerLine * canvasSize.h;
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, triggerY);
    ctx.lineTo(canvasSize.w, triggerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw drag handle (6px circle at center)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(canvasSize.w / 2, triggerY, 6, 0, Math.PI * 2);
    ctx.fill();
  }, [canvasSize, zoneConfig, sport]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const ry = y / canvasSize.h;

    // Determine which zone was clicked
    if (ry < 0.33) {
      setZone('high');
    } else if (ry < 0.66) {
      setZone('mid');
    } else {
      setZone('low');
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const triggerY = zoneConfig.triggerLine * canvasSize.h;

    // Check if clicking on the handle (within 10px)
    if (Math.abs(y - triggerY) < 10) {
      setDraggingHandle(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingHandle || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const ry = Math.max(0, Math.min(1, y / canvasSize.h));

      setTriggerLine(ry);
    };

    const handleMouseUp = () => {
      setDraggingHandle(false);
    };

    if (draggingHandle) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingHandle, canvasSize.h, setTriggerLine]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ aspectRatio: '145 / 90' }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        className="border border-solid"
        style={{
          borderColor: 'var(--bdr)',
          borderRadius: '0.5rem',
          cursor: draggingHandle ? 'grab' : 'pointer',
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
