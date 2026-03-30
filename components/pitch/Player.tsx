'use client';

// Draggable player token rendered over a <Pitch /> SVG.
//
// Architecture
// ────────────
// • Pitch.tsx uses a viewBox of "0 0 100 160".
// • Player x/y are stored in that same 100×160 space.
// • This component is an absolutely-positioned div whose CSS `left`/`top`
//   map those coordinates to percentages of the container.
// • framer-motion's `drag` handles both mouse AND pointer/touch events,
//   making it fully iPad-compatible out of the box.
// • On drag-end the pixel offset is converted back to coordinate-space,
//   the store is updated, and the motion values are reset to 0 so the
//   element snaps to its new CSS position without a visual jump.

import React, { RefObject, useRef } from 'react';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import { usePitchStore } from '@/lib/pitch-store';

// ── Coordinate-space dimensions (must match Pitch.tsx) ────────────────────────
const VW = 100;
const VH = 160;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PlayerProps {
  id: string;
  /**
   * Ref to the container element whose dimensions define the coordinate
   * transform.  Typically the wrapper div that also holds `<Pitch />`.
   */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Visual radius of the circle in CSS pixels (default 14). */
  radius?: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Player({ id, containerRef, radius = 14 }: PlayerProps) {
  const player       = usePitchStore((state) => state.players[id]);
  const updatePosition = usePitchStore((state) => state.updatePosition);

  // Tracks the framer-motion drag offset (reset to 0 after each drag ends).
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Snapshot of the player's coordinate position at drag-start.
  const dragOrigin = useRef({ x: 0, y: 0 });

  if (!player) return null;

  const { x, y, color, label } = player;

  // ── Coordinate helpers ─────────────────────────────────────────────────────

  function getContainerSize() {
    const el = containerRef.current;
    if (!el) return { w: 1, h: 1 };
    return { w: el.clientWidth, h: el.clientHeight };
  }

  function pxToCoord(dxPx: number, dyPx: number) {
    const { w, h } = getContainerSize();
    return {
      dx: (dxPx / w) * VW,
      dy: (dyPx / h) * VH,
    };
  }

  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  function handleDragStart() {
    dragOrigin.current = { x, y };
  }

  function handleDragEnd(_: PointerEvent, info: PanInfo) {
    const { dx, dy } = pxToCoord(info.offset.x, info.offset.y);
    const newX = clamp(dragOrigin.current.x + dx, 0, VW);
    const newY = clamp(dragOrigin.current.y + dy, 0, VH);
    updatePosition(id, newX, newY);

    // Reset so the div returns to being driven purely by CSS `left`/`top`.
    dragX.set(0);
    dragY.set(0);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  // Map coordinate space → CSS percentages.
  const leftPct = `${(x / VW) * 100}%`;
  const topPct  = `${(y / VH) * 100}%`;

  // Diameter for the label font size.
  const fontSize = radius < 12 ? radius * 0.7 : radius * 0.65;

  return (
    <motion.div
      // Position the centre of the circle at (x, y).
      style={{
        position: 'absolute',
        left: leftPct,
        top: topPct,
        // Centre the div on its coordinate point.
        translateX: '-50%',
        translateY: '-50%',
        // Motion values drive the drag offset on top of the CSS position.
        x: dragX,
        y: dragY,
        width:  radius * 2,
        height: radius * 2,
        borderRadius: '50%',
        backgroundColor: color,
        border: '2px solid rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        userSelect: 'none',
        // Lift above the pitch SVG during drag.
        zIndex: 10,
        // Hardware-accelerated layer for smooth 60 fps dragging.
        willChange: 'transform',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        touchAction: 'none',  // required for pointer-event drag on iOS
      }}
      whileDrag={{ cursor: 'grabbing', scale: 1.1, zIndex: 20 }}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={containerRef}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <span
        style={{
          fontSize,
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1,
          // Prevent the label from swallowing pointer events.
          pointerEvents: 'none',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}
