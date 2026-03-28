import { create } from 'zustand';
import type { Sport, InteractionMode, RunStyle, PlayerConfig } from './pitch-config';
import { getDefaultPositions } from './pitch-config';

export interface Player extends PlayerConfig {
  team: 'home' | 'away';
  name?: string;
}

export interface Run {
  playerId: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  style: RunStyle;
  team: 'home' | 'away';
  cpX?: number;  // control point X, 0-1 relative (optional for backward compat)
  cpY?: number;  // control point Y, 0-1 relative (optional for backward compat)
}

export interface BallPosition {
  x: number;
  y: number;
}

export interface Phase {
  phaseNumber: number;
  playerPositions: {
    home: Player[];
    away: Player[];
  };
  runs: Run[];
  ballPosition: BallPosition;
}

interface BoardStore {
  sport: Sport;
  mode: InteractionMode;
  runStyle: RunStyle;
  phases: Phase[];
  currentPhase: number;
  animating: boolean;
  animationSpeed: number;
  showHome: boolean;
  showAway: boolean;

  setSport: (sport: Sport) => void;
  setMode: (mode: InteractionMode) => void;
  setRunStyle: (style: RunStyle) => void;
  setCurrentPhase: (index: number) => void;
  setAnimating: (val: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setShowHome: (val: boolean) => void;
  setShowAway: (val: boolean) => void;
  addPhase: () => void;
  updatePlayerPosition: (phaseIndex: number, team: 'home' | 'away', playerId: number, rx: number, ry: number) => void;
  addRun: (phaseIndex: number, run: Run) => void;
  removeRun: (phaseIndex: number, playerId: number) => void;
  updateRunControlPoint: (phaseIndex: number, playerId: number, cpX: number, cpY: number) => void;
  setBallPosition: (phaseIndex: number, pos: BallPosition) => void;
  loadPlay: (phases: Phase[], sport: Sport) => void;
  resetBoard: (sport: Sport) => void;
}

function createInitialPhase(sport: Sport): Phase {
  const { home, away } = getDefaultPositions(sport);
  return {
    phaseNumber: 1,
    playerPositions: {
      home: home.map(p => ({ ...p, team: 'home' as const })),
      away: away.map(p => ({ ...p, team: 'away' as const })),
    },
    runs: [],
    ballPosition: { x: 0.5, y: 0.5 },
  };
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  sport: 'gaa',
  mode: 'move',
  runStyle: 'run',
  phases: [createInitialPhase('gaa')],
  currentPhase: 0,
  animating: false,
  animationSpeed: 1,
  showHome: true,
  showAway: true,

  setSport: (sport) => set({ sport, phases: [createInitialPhase(sport)], currentPhase: 0 }),
  setMode: (mode) => set({ mode }),
  setRunStyle: (runStyle) => set({ runStyle }),
  setCurrentPhase: (index) => set({ currentPhase: index }),
  setAnimating: (animating) => set({ animating }),
  setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
  setShowHome: (showHome) => set({ showHome }),
  setShowAway: (showAway) => set({ showAway }),

  addPhase: () => {
    const { phases } = get();
    const lastPhase = phases[phases.length - 1];
    const newPhase: Phase = {
      phaseNumber: phases.length + 1,
      playerPositions: {
        home: lastPhase.playerPositions.home.map(p => ({ ...p })),
        away: lastPhase.playerPositions.away.map(p => ({ ...p })),
      },
      runs: [],
      ballPosition: { ...lastPhase.ballPosition },
    };
    set({ phases: [...phases, newPhase], currentPhase: phases.length });
  },

  updatePlayerPosition: (phaseIndex, team, playerId, rx, ry) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.playerPositions = { ...phase.playerPositions };
    phase.playerPositions[team] = phase.playerPositions[team].map(p =>
      p.id === playerId ? { ...p, rx, ry } : p
    );
    phases[phaseIndex] = phase;
    set({ phases });
  },

  addRun: (phaseIndex, run) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.runs = [
      ...phase.runs.filter(r => r.playerId !== run.playerId),
      run,
    ];
    phases[phaseIndex] = phase;
    set({ phases });
  },

  removeRun: (phaseIndex, playerId) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.runs = phase.runs.filter(r => r.playerId !== playerId);
    phases[phaseIndex] = phase;
    set({ phases });
  },

  updateRunControlPoint: (phaseIndex, playerId, cpX, cpY) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.runs = phase.runs.map(r =>
      r.playerId === playerId ? { ...r, cpX, cpY } : r
    );
    phases[phaseIndex] = phase;
    set({ phases });
  },

  setBallPosition: (phaseIndex, pos) => {
    const phases = [...get().phases];
    phases[phaseIndex] = { ...phases[phaseIndex], ballPosition: pos };
    set({ phases });
  },

  loadPlay: (phases, sport) => set({ phases, sport, currentPhase: 0, animating: false }),

  resetBoard: (sport) => set({ phases: [createInitialPhase(sport)], currentPhase: 0, animating: false }),
}));
