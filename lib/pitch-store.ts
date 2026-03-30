// Central state for the pitch engine.
// Players are stored as a Record<id, PitchPlayer> so each update only mutates
// a single entry – components subscribing to other players never re-render.

import { create } from 'zustand';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PitchPlayer {
  id: string;
  /** X position in the 0-100 coordinate space used by Pitch.tsx. */
  x: number;
  /** Y position in the 0-160 coordinate space used by Pitch.tsx. */
  y: number;
  /** CSS colour string (hex, hsl, etc.). */
  color: string;
  /** Jersey number or player name displayed inside the circle. */
  label: string;
}

interface PitchState {
  players: Record<string, PitchPlayer>;

  /** Move a single player; only that player's component re-renders. */
  updatePosition: (id: string, x: number, y: number) => void;

  /** Replace the full player list (e.g. when switching formation). */
  setPlayers: (players: PitchPlayer[]) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const usePitchStore = create<PitchState>((set) => ({
  players: {},

  updatePosition: (id, x, y) =>
    set((state) => {
      const current = state.players[id];
      if (!current) return state;
      return {
        players: {
          ...state.players,
          // Only this player's reference changes – all others stay identical,
          // so selectors for other players return the same ref → no re-render.
          [id]: { ...current, x, y },
        },
      };
    }),

  setPlayers: (players) =>
    set({
      players: Object.fromEntries(players.map((p) => [p.id, p])),
    }),
}));
