// SVG-based responsive pitch component.
// Coordinate space: 100 × 160 units (viewBox="0 0 100 160").
// All markings are defined in this normalised space so the pitch scales
// perfectly to any container – from a phone screen to a projector.

import React from 'react';

// ── Coordinate constants ──────────────────────────────────────────────────────
const VW = 100;
const VH = 160;

// Pitch boundary (3-unit margin on all sides)
const L = 3;           // left:   3
const R = VW - 3;      // right:  97
const T = 3;           // top:    3
const B = VH - 3;      // bottom: 157
const PW = R - L;      // pitch width:  94
const PH = B - T;      // pitch height: 154
const CX = VW / 2;     // centre X: 50
const CY = VH / 2;     // centre Y: 80

// ── Colour tokens ─────────────────────────────────────────────────────────────
const GRASS   = '#1a6b30';
const STRIPE  = 'rgba(0,0,0,0.07)';
const LINE    = 'rgba(255,255,255,0.85)';
const LINE_HI = 'rgba(255,255,255,0.95)';
const SPOT    = 'rgba(255,255,255,0.9)';
const LW      = 0.6;   // default stroke-width
const LW_HI   = 1.0;   // highlighted stroke-width (goals / posts)

// ── Soccer pitch constants ────────────────────────────────────────────────────
// Source: FIFA standard 105 m × 68 m.
// Scale factors: PW / 68 ≈ 1.38 u/m wide,  PH / 105 ≈ 1.47 u/m tall.
const SOC = {
  paW:        55,    // penalty-area width  (40.32 m → 55.6)
  paH:        24,    // penalty-area depth  (16.5 m  → 24.2)
  gaW:        25,    // goal-area width     (18.32 m → 25.3)
  gaH:         8,    // goal-area depth     ( 5.5 m  →  8.1)
  penDist:    16,    // penalty-spot dist   (11 m    → 16.2)
  centreR:     9,    // centre-circle radius (kept compact for visual clarity)
  arcR:        9,    // D-arc radius
  goalW:      10,    // goal width          ( 7.32 m → 10.1)
  goalDepth:   3,    // goal depth behind end line
  cornerR:   1.8,    // corner-arc radius   ( 1 m)
} as const;

// Pre-computed D-arc intersection points (where the arc crosses the PA line)
const _paTopY  = T + SOC.paH;                                        // 27
const _paBotY  = B - SOC.paH;                                        // 133
const _penTopY = T + SOC.penDist;                                     // 19
const _dArcDy  = _paTopY - _penTopY;                                  // 8
const _dArcDx  = Math.sqrt(SOC.arcR ** 2 - _dArcDy ** 2).toFixed(3); // ≈ 4.123

// ── GAA pitch constants ───────────────────────────────────────────────────────
// Source: standard GAA pitch 145 m × 90 m.
// Scale factors: PW / 90 ≈ 1.04 u/m wide,  PH / 145 ≈ 1.06 u/m tall.
const GAA = {
  // Yard lines measured from each end line
  line13: +(PH * 13 / 145).toFixed(2),   // ≈ 13.8
  line20: +(PH * 20 / 145).toFixed(2),   // ≈ 21.2
  line45: +(PH * 45 / 145).toFixed(2),   // ≈ 47.8
  line65: +(PH * 65 / 145).toFixed(2),   // ≈ 69.1

  // Goal-end geometry (proportions match existing PitchRenderer.ts)
  smallW:  PW * 0.30,    // ≈ 28.2 – small rectangle width
  smallH:  PH * 0.055,   // ≈  8.5 – small rectangle depth
  largeW:  PW * 0.55,    // ≈ 51.7 – large rectangle width
  largeH:  PH * 0.10,    // ≈ 15.4 – large rectangle depth
  dArcR:   PH * 0.08,    // ≈ 12.3 – D semi-circle radius

  centreR: PW * 0.08,    // ≈  7.5 – centre circle radius
  penDist: PH * 0.076,   // ≈ 11.7 – penalty-spot distance (11 m)

  // H-post dimensions
  postW:   PW * 0.085,   // ≈  8.0 – post-to-post span
  postExt:          6,   // units posts extend beyond boundary
  crossbarExt:      3,   // units crossbar sits from boundary
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PitchProps {
  /** Sport determines which set of markings is drawn. */
  type: 'soccer' | 'gaa';
  className?: string;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Alternating grass stripes spanning the full SVG area. */
function GrassStripes() {
  const stripeH = VH / 10;
  return (
    <>
      {Array.from({ length: 10 }, (_, i) =>
        i % 2 === 0 ? (
          <rect
            key={i}
            x={0}
            y={+(i * stripeH).toFixed(2)}
            width={VW}
            height={+stripeH.toFixed(2)}
            fill={STRIPE}
          />
        ) : null,
      )}
    </>
  );
}

/** All FIFA-standard soccer markings. */
function SoccerMarkings() {
  const penBotY = B - SOC.penDist;  // 141

  return (
    <g stroke={LINE} strokeWidth={LW} fill="none">
      {/* ── Boundary ── */}
      <rect x={L} y={T} width={PW} height={PH} />

      {/* ── Centre ── */}
      <line x1={L} y1={CY} x2={R} y2={CY} />
      <circle cx={CX} cy={CY} r={SOC.centreR} />
      <circle cx={CX} cy={CY} r={0.7} fill={SPOT} stroke="none" />

      {/* ── Top penalty area ── */}
      <rect x={CX - SOC.paW / 2} y={T} width={SOC.paW} height={SOC.paH} />

      {/* Top goal area */}
      <rect x={CX - SOC.gaW / 2} y={T} width={SOC.gaW} height={SOC.gaH} />

      {/* Top penalty spot */}
      <circle cx={CX} cy={_penTopY} r={0.6} fill={SPOT} stroke="none" />

      {/*
        Top D-arc: semi-circle centred on the penalty spot that bows INTO the
        pitch. Only the portion that falls outside the penalty area is visible.
        Intersection x = CX ± √(arcR² − dy²)
        sweep=1 (clockwise) → arc bows downward (away from goal) ✓
      */}
      <path
        d={`M ${+( CX - +_dArcDx).toFixed(3)} ${_paTopY}
            A ${SOC.arcR} ${SOC.arcR} 0 0 1
              ${+(CX + +_dArcDx).toFixed(3)} ${_paTopY}`}
      />

      {/* ── Bottom penalty area ── */}
      <rect x={CX - SOC.paW / 2} y={_paBotY} width={SOC.paW} height={SOC.paH} />

      {/* Bottom goal area */}
      <rect x={CX - SOC.gaW / 2} y={B - SOC.gaH} width={SOC.gaW} height={SOC.gaH} />

      {/* Bottom penalty spot */}
      <circle cx={CX} cy={penBotY} r={0.6} fill={SPOT} stroke="none" />

      {/*
        Bottom D-arc: bows INTO pitch (upward).
        sweep=0 (counter-clockwise) from left to right → bows upward ✓
      */}
      <path
        d={`M ${+(CX - +_dArcDx).toFixed(3)} ${_paBotY}
            A ${SOC.arcR} ${SOC.arcR} 0 0 0
              ${+(CX + +_dArcDx).toFixed(3)} ${_paBotY}`}
      />

      {/* ── Goals (slightly bolder) ── */}
      <rect
        x={CX - SOC.goalW / 2}
        y={T - SOC.goalDepth}
        width={SOC.goalW}
        height={SOC.goalDepth}
        stroke={LINE_HI}
        strokeWidth={LW_HI}
      />
      <rect
        x={CX - SOC.goalW / 2}
        y={B}
        width={SOC.goalW}
        height={SOC.goalDepth}
        stroke={LINE_HI}
        strokeWidth={LW_HI}
      />

      {/* ── Corner arcs ── */}
      {/* top-left  */ }
      <path d={`M ${L + SOC.cornerR} ${T} A ${SOC.cornerR} ${SOC.cornerR} 0 0 0 ${L} ${T + SOC.cornerR}`} />
      {/* top-right */}
      <path d={`M ${R - SOC.cornerR} ${T} A ${SOC.cornerR} ${SOC.cornerR} 0 0 1 ${R} ${T + SOC.cornerR}`} />
      {/* bottom-left  */}
      <path d={`M ${L} ${B - SOC.cornerR} A ${SOC.cornerR} ${SOC.cornerR} 0 0 1 ${L + SOC.cornerR} ${B}`} />
      {/* bottom-right */}
      <path d={`M ${R} ${B - SOC.cornerR} A ${SOC.cornerR} ${SOC.cornerR} 0 0 0 ${R - SOC.cornerR} ${B}`} />
    </g>
  );
}

/**
 * One goal end for a GAA pitch (top or bottom).
 *
 * Draws:
 *  • small rectangle (goal area)
 *  • large rectangle (21-yard box equivalent)
 *  • D semi-circle bowing into the pitch beyond the large rectangle
 *  • H-shaped goal posts extending beyond the boundary
 */
function GAAGoalEnd({ endY, isTop }: { endY: number; isTop: boolean }) {
  // sign=+1 means "into the pitch from top end"; sign=-1 for bottom end
  const sign = isTop ? 1 : -1;

  // Rectangle y-origins (SVG rects need the smaller y value)
  const smallRectY = isTop ? endY            : endY - GAA.smallH;
  const largeRectY = isTop ? endY            : endY - GAA.largeH;

  // D arc: semi-circle centred at the inner edge of the large rectangle
  const arcCY    = endY + GAA.largeH * sign;
  // Top: sweep=1 (clockwise) → bows DOWN into pitch
  // Bottom: sweep=0 (counter-clockwise) → bows UP into pitch
  const arcSweep = isTop ? 1 : 0;

  // Goal posts
  const postTip   = endY - GAA.postExt      * sign;  // extends beyond boundary
  const crossbarY = endY - GAA.crossbarExt  * sign;
  const halfPost  = GAA.postW / 2;

  return (
    <g fill="none">
      {/* Small rectangle */}
      <rect
        x={CX - GAA.smallW / 2}
        y={smallRectY}
        width={GAA.smallW}
        height={GAA.smallH}
        stroke={LINE}
        strokeWidth={LW}
      />

      {/* Large rectangle */}
      <rect
        x={CX - GAA.largeW / 2}
        y={largeRectY}
        width={GAA.largeW}
        height={GAA.largeH}
        stroke={LINE}
        strokeWidth={LW}
      />

      {/*
        D semi-circle: full half-circle from (CX − dArcR, arcCY) to
        (CX + dArcR, arcCY) sweeping into the pitch.
      */}
      <path
        d={`M ${+(CX - GAA.dArcR).toFixed(2)} ${+arcCY.toFixed(2)}
            A ${+GAA.dArcR.toFixed(2)} ${+GAA.dArcR.toFixed(2)} 0 0 ${arcSweep}
              ${+(CX + GAA.dArcR).toFixed(2)} ${+arcCY.toFixed(2)}`}
        stroke={LINE}
        strokeWidth={LW}
      />

      {/* H-shaped goal posts – bolder so they read as solid structures */}
      <g stroke={LINE_HI} strokeWidth={LW_HI}>
        {/* Left post */}
        <line
          x1={CX - halfPost} y1={endY}
          x2={CX - halfPost} y2={postTip}
        />
        {/* Right post */}
        <line
          x1={CX + halfPost} y1={endY}
          x2={CX + halfPost} y2={postTip}
        />
        {/* Crossbar */}
        <line
          x1={CX - halfPost} y1={crossbarY}
          x2={CX + halfPost} y2={crossbarY}
        />
      </g>
    </g>
  );
}

/** All GAA markings: boundary, yard lines (13 m / 20 m / 45 m / 65 m), centre,
 *  penalty spots, and goal ends. */
function GAAMarkings() {
  const penTopY = T + GAA.penDist;
  const penBotY = B - GAA.penDist;

  return (
    <g stroke={LINE} strokeWidth={LW} fill="none">
      {/* ── Boundary ── */}
      <rect x={L} y={T} width={PW} height={PH} />

      {/* ── Centre ── */}
      <line x1={L} y1={CY} x2={R} y2={CY} />
      <circle cx={CX} cy={CY} r={GAA.centreR} />

      {/* ── Yard lines from top end ── */}
      <line x1={L} y1={+(T + GAA.line13).toFixed(2)} x2={R} y2={+(T + GAA.line13).toFixed(2)} />
      <line x1={L} y1={+(T + GAA.line20).toFixed(2)} x2={R} y2={+(T + GAA.line20).toFixed(2)} />
      <line x1={L} y1={+(T + GAA.line45).toFixed(2)} x2={R} y2={+(T + GAA.line45).toFixed(2)} />
      <line x1={L} y1={+(T + GAA.line65).toFixed(2)} x2={R} y2={+(T + GAA.line65).toFixed(2)} />

      {/* ── Yard lines from bottom end ── */}
      <line x1={L} y1={+(B - GAA.line13).toFixed(2)} x2={R} y2={+(B - GAA.line13).toFixed(2)} />
      <line x1={L} y1={+(B - GAA.line20).toFixed(2)} x2={R} y2={+(B - GAA.line20).toFixed(2)} />
      <line x1={L} y1={+(B - GAA.line45).toFixed(2)} x2={R} y2={+(B - GAA.line45).toFixed(2)} />
      <line x1={L} y1={+(B - GAA.line65).toFixed(2)} x2={R} y2={+(B - GAA.line65).toFixed(2)} />

      {/* ── Penalty spots ── */}
      <circle cx={CX} cy={+penTopY.toFixed(2)} r={0.7} fill={SPOT} stroke="none" />
      <circle cx={CX} cy={+penBotY.toFixed(2)} r={0.7} fill={SPOT} stroke="none" />

      {/* ── Goal ends ── */}
      <GAAGoalEnd endY={T} isTop={true}  />
      <GAAGoalEnd endY={B} isTop={false} />
    </g>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

/**
 * `<Pitch>` renders a fully responsive SVG pitch.
 *
 * All coordinates live in a normalised 100 × 160 unit space, so the pitch
 * scales to any container size without distortion.  Use CSS / Tailwind on the
 * parent element to control the rendered size.
 *
 * @example
 * // Full-width, preserving aspect ratio
 * <div className="w-full aspect-[100/160]">
 *   <Pitch type="gaa" />
 * </div>
 */
export function Pitch({ type, className = '' }: PitchProps) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      className={className}
      aria-label={type === 'soccer' ? 'Soccer pitch' : 'GAA pitch'}
      role="img"
    >
      {/* ── Grass base ── */}
      <rect x={0} y={0} width={VW} height={VH} fill={GRASS} />
      <GrassStripes />

      {/* ── Sport-specific markings ── */}
      {type === 'soccer' ? <SoccerMarkings /> : <GAAMarkings />}
    </svg>
  );
}
