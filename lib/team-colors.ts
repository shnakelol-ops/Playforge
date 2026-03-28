/**
 * Centralized team color palette
 * Used throughout the app for consistent home/away team coloring
 */

export const TEAM_COLORS = {
  home: {
    fill: '#00e07a',      // Home team player circle fill
    stroke: '#007a38',    // Home team player circle stroke
    run: '#ffffff',       // Home team run arrow color
    runArrow: '#00d46e',  // Home team run arrowhead
  },
  away: {
    fill: '#f59e0b',      // Away team player circle fill
    stroke: '#b45309',    // Away team player circle stroke
    run: '#f59e0b',       // Away team run arrow color
    runArrow: '#d97706',  // Away team run arrowhead
  },
};

export const CANVAS_COLORS = {
  pitch: {
    grass: '#1a6b30',
    grassStripe: 'rgba(0,0,0,0.07)',
    line: 'rgba(255,255,255,0.85)',
    penaltySpot: 'rgba(255,255,255,0.85)',
  },
  ball: {
    fill: '#ffffff',
    stroke: '#cccccc',
  },
  ui: {
    darkText: '#0b0f18',  // Same as --bg
    destructive: '#ef4444', // Same as --red
  },
};
