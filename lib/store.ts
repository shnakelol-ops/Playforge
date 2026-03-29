import { create } from 'zustand';
import type { Sport, InteractionMode, RunStyle, PlayerConfig, TrainingItemType, InkShapeType, InkColor, InkWidth, PlayerDisplayMode } from './pitch-config';
import { getDefaultPositions } from './pitch-config';

export type { PlayerDisplayMode, TrainingItemType, InkShapeType, InkColor, InkWidth };

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

export interface TrainingItem {
  id: string;
  type: TrainingItemType;
  rx: number;
  ry: number;
  runEndX?: number;
  runEndY?: number;
  runCpX?: number;
  runCpY?: number;
}

export interface FreehandStroke {
  id: string;
  shapeType: InkShapeType;
  color: InkColor;
  width: InkWidth;
  isZoneFill?: boolean;
  points?: Array<{ rx: number; ry: number }>;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

export interface TextLabel {
  id: string;
  text: string;
  rx: number;
  ry: number;
  fontSize: number;
  color: string;
}

export interface Phase {
  phaseNumber: number;
  playerPositions: {
    home: Player[];
    away: Player[];
  };
  runs: Run[];
  ballPosition: BallPosition;
  trainingItems?: TrainingItem[];
  inkStrokes?: FreehandStroke[];
  textLabels?: TextLabel[];
  notes?: string;
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

  // Ink mode
  inkColor: InkColor;
  inkWidth: InkWidth;
  inkShapeType: InkShapeType;
  isZoneFill: boolean;

  // Training
  selectedTrainingType: TrainingItemType | null;

  // Appearance
  playerDisplayMode: PlayerDisplayMode;
  showNumbers: boolean;
  showPositions: boolean;

  // Selection
  selectedEntityId: string | null;

  // Bench (substitutions)
  benchPlayers: Player[];
  pendingSubId: string | null;

  // Player names
  playerNames: Record<'home' | 'away', Record<number, string>>;

  setSport: (sport: Sport) => void;
  setMode: (mode: InteractionMode) => void;
  setRunStyle: (style: RunStyle) => void;
  setCurrentPhase: (index: number) => void;
  setAnimating: (val: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setShowHome: (val: boolean) => void;
  setShowAway: (val: boolean) => void;
  setInkColor: (color: InkColor) => void;
  setInkWidth: (width: InkWidth) => void;
  setInkShapeType: (shapeType: InkShapeType) => void;
  setIsZoneFill: (val: boolean) => void;
  setSelectedTrainingType: (type: TrainingItemType | null) => void;
  setPlayerDisplayMode: (mode: PlayerDisplayMode) => void;
  setShowNumbers: (val: boolean) => void;
  setShowPositions: (val: boolean) => void;
  setSelectedEntityId: (id: string | null) => void;
  setBenchPlayers: (players: Player[]) => void;
  setPendingSubId: (id: string | null) => void;
  addPhase: () => void;
  deletePhase: (phaseIndex: number) => void;
  updatePlayerPosition: (phaseIndex: number, team: 'home' | 'away', playerId: number, rx: number, ry: number) => void;
  addRun: (phaseIndex: number, run: Run) => void;
  removeRun: (phaseIndex: number, playerId: number) => void;
  updateRunControlPoint: (phaseIndex: number, playerId: number, cpX: number, cpY: number) => void;
  setBallPosition: (phaseIndex: number, pos: BallPosition) => void;
  addTrainingItem: (phaseIndex: number, item: TrainingItem) => void;
  moveTrainingItem: (phaseIndex: number, id: string, rx: number, ry: number) => void;
  removeTrainingItem: (phaseIndex: number, id: string) => void;
  updateTrainingItemPath: (phaseIndex: number, id: string, endX: number, endY: number, cpX: number, cpY: number) => void;
  addInkStroke: (phaseIndex: number, stroke: FreehandStroke) => void;
  clearInkStrokes: (phaseIndex: number) => void;
  addTextLabel: (phaseIndex: number, label: TextLabel) => void;
  moveTextLabel: (phaseIndex: number, id: string, rx: number, ry: number) => void;
  updateTextLabelText: (phaseIndex: number, id: string, text: string) => void;
  removeTextLabel: (phaseIndex: number, id: string) => void;
  setPlayerName: (team: 'home' | 'away', playerId: number, name: string) => void;
  setPhaseNotes: (phaseIndex: number, notes: string) => void;
  loadPlay: (phases: Phase[], sport: Sport, playerNames?: Record<'home' | 'away', Record<number, string>>) => void;
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
    trainingItems: [],
    inkStrokes: [],
    textLabels: [],
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

  inkColor: 'white',
  inkWidth: 'medium',
  inkShapeType: 'freehand',
  isZoneFill: false,

  selectedTrainingType: null,

  playerDisplayMode: 'number',
  showNumbers: true,
  showPositions: false,

  selectedEntityId: null,

  benchPlayers: [],
  pendingSubId: null,

  playerNames: { home: {}, away: {} },

  setSport: (sport) => set({ sport, phases: [createInitialPhase(sport)], currentPhase: 0 }),
  setMode: (mode) => set({ mode }),
  setRunStyle: (runStyle) => set({ runStyle }),
  setCurrentPhase: (index) => set({ currentPhase: index }),
  setAnimating: (animating) => set({ animating }),
  setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
  setShowHome: (showHome) => set({ showHome }),
  setShowAway: (showAway) => set({ showAway }),
  setInkColor: (inkColor) => set({ inkColor }),
  setInkWidth: (inkWidth) => set({ inkWidth }),
  setInkShapeType: (inkShapeType) => set({ inkShapeType }),
  setIsZoneFill: (isZoneFill) => set({ isZoneFill }),
  setSelectedTrainingType: (selectedTrainingType) => set({ selectedTrainingType }),
  setPlayerDisplayMode: (playerDisplayMode) => set({ playerDisplayMode }),
  setShowNumbers: (showNumbers) => set({ showNumbers }),
  setShowPositions: (showPositions) => set({ showPositions }),
  setSelectedEntityId: (selectedEntityId) => set({ selectedEntityId }),
  setBenchPlayers: (benchPlayers) => set({ benchPlayers }),
  setPendingSubId: (pendingSubId) => set({ pendingSubId }),

  setPlayerName: (team, playerId, name) => {
    const { playerNames } = get();
    set({
      playerNames: {
        ...playerNames,
        [team]: { ...playerNames[team], [playerId]: name },
      },
    });
  },

  setPhaseNotes: (phaseIndex, notes) => {
    const phases = [...get().phases];
    phases[phaseIndex] = { ...phases[phaseIndex], notes };
    set({ phases });
  },

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

  deletePhase: (phaseIndex: number) => {
    const { phases, currentPhase } = get();
    // Cannot delete phase 1 (index 0) or if less than 2 phases
    if (phaseIndex === 0 || phases.length <= 1) return;
    const newPhases = phases.filter((_, i) => i !== phaseIndex);
    const newCurrentPhase = currentPhase >= phaseIndex ? Math.max(0, currentPhase - 1) : currentPhase;
    set({ phases: newPhases, currentPhase: newCurrentPhase });
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

  addTrainingItem: (phaseIndex, item) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.trainingItems = [...(phase.trainingItems ?? []), item];
    phases[phaseIndex] = phase;
    set({ phases });
  },

  moveTrainingItem: (phaseIndex, id, rx, ry) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.trainingItems = (phase.trainingItems ?? []).map(item =>
      item.id === id ? { ...item, rx, ry } : item
    );
    phases[phaseIndex] = phase;
    set({ phases });
  },

  removeTrainingItem: (phaseIndex, id) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.trainingItems = (phase.trainingItems ?? []).filter(item => item.id !== id);
    phases[phaseIndex] = phase;
    set({ phases });
  },

  updateTrainingItemPath: (phaseIndex, id, endX, endY, cpX, cpY) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.trainingItems = (phase.trainingItems ?? []).map(item =>
      item.id === id ? { ...item, runEndX: endX, runEndY: endY, runCpX: cpX, runCpY: cpY } : item
    );
    phases[phaseIndex] = phase;
    set({ phases });
  },

  addInkStroke: (phaseIndex, stroke) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.inkStrokes = [...(phase.inkStrokes ?? []), stroke];
    phases[phaseIndex] = phase;
    set({ phases });
  },

  clearInkStrokes: (phaseIndex) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.inkStrokes = [];
    phases[phaseIndex] = phase;
    set({ phases });
  },

  addTextLabel: (phaseIndex, label) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.textLabels = [...(phase.textLabels ?? []), label];
    phases[phaseIndex] = phase;
    set({ phases });
  },

  moveTextLabel: (phaseIndex, id, rx, ry) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.textLabels = (phase.textLabels ?? []).map(label =>
      label.id === id ? { ...label, rx, ry } : label
    );
    phases[phaseIndex] = phase;
    set({ phases });
  },

  updateTextLabelText: (phaseIndex, id, text) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.textLabels = (phase.textLabels ?? []).map(label =>
      label.id === id ? { ...label, text } : label
    );
    phases[phaseIndex] = phase;
    set({ phases });
  },

  removeTextLabel: (phaseIndex, id) => {
    const phases = [...get().phases];
    const phase = { ...phases[phaseIndex] };
    phase.textLabels = (phase.textLabels ?? []).filter(label => label.id !== id);
    phases[phaseIndex] = phase;
    set({ phases });
  },

  loadPlay: (phases, sport, playerNames) => set({
    phases,
    sport,
    currentPhase: 0,
    animating: false,
    playerNames: playerNames ?? { home: {}, away: {} },
  }),

  resetBoard: (sport) => set({ phases: [createInitialPhase(sport)], currentPhase: 0, animating: false }),
}));
