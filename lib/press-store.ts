import { create } from 'zustand';
import type { PressZone, PressRole, PostPressOption, PressZoneConfig, PlayerRoleMap, PressPhase, PostPressConfig, PressSchema } from './press-types';
import { getDefaultPositions } from './pitch-config';

interface PressState {
  // Core schema data
  sport: 'gaa' | 'hurling' | 'soccer';
  name: string;
  zoneConfig: PressZoneConfig;
  playerRoles: PlayerRoleMap;
  activeTriggers: string[];
  pressPhases: PressPhase[];
  postPress: PostPressConfig;

  // UI state
  currentSection: 1 | 2 | 3 | 4 | 5;
  currentPhase: 1 | 2;

  // Actions
  setSport: (sport: 'gaa' | 'hurling' | 'soccer') => void;
  setName: (name: string) => void;
  setZone: (zone: PressZone) => void;
  setTriggerLine: (ry: number) => void;
  setPlayerRole: (playerId: number, role: PressRole | null) => void;
  toggleTrigger: (triggerId: string) => void;
  setPlayerTarget: (phaseNumber: 1 | 2, playerId: number, endRx: number, endRy: number) => void;
  selectSection: (section: 1 | 2 | 3 | 4 | 5) => void;
  selectPhase: (phase: 1 | 2) => void;
  setPostPress: (option: PostPressOption, notes: string) => void;
  reset: (sport: 'gaa' | 'hurling' | 'soccer') => void;
  loadSchema: (schema: PressSchema) => void;
}

function initializePhases(sport: 'gaa' | 'hurling' | 'soccer'): PressPhase[] {
  const positions = getDefaultPositions(sport).home;
  return [1, 2].map(phaseNumber => ({
    phaseNumber: phaseNumber as 1 | 2,
    playerTargets: positions.map(p => ({
      playerId: p.id,
      startRx: p.rx,
      startRy: p.ry,
      endRx: p.rx,
      endRy: p.ry,
    })),
  }));
}

function getInitialState(sport: 'gaa' | 'hurling' | 'soccer') {
  return {
    sport,
    name: '',
    zoneConfig: {
      zone: 'low' as const,
      triggerLine: 0.6,
    },
    playerRoles: {},
    activeTriggers: [],
    pressPhases: initializePhases(sport),
    postPress: {
      option: 'playForward' as const,
      notes: '',
    },
    currentSection: 1 as const,
    currentPhase: 1 as const,
  };
}

export const usePressStore = create<PressState>((set) => ({
  ...getInitialState('gaa'),

  setSport: (sport) => set((state) => {
    if (state.sport === sport) return state;
    return {
      sport,
      pressPhases: initializePhases(sport),
      playerRoles: {},
    };
  }),

  setName: (name) => set({ name }),

  setZone: (zone) => set((state) => ({
    zoneConfig: { ...state.zoneConfig, zone },
  })),

  setTriggerLine: (ry) => set((state) => ({
    zoneConfig: { ...state.zoneConfig, triggerLine: Math.max(0, Math.min(1, ry)) },
  })),

  setPlayerRole: (playerId, role) => set((state) => {
    const newRoles = { ...state.playerRoles };
    if (role === null) {
      delete newRoles[playerId];
    } else {
      newRoles[playerId] = role;
    }
    return { playerRoles: newRoles };
  }),

  toggleTrigger: (triggerId) => set((state) => {
    const activeTriggers = state.activeTriggers.includes(triggerId)
      ? state.activeTriggers.filter(t => t !== triggerId)
      : [...state.activeTriggers, triggerId];
    return { activeTriggers };
  }),

  setPlayerTarget: (phaseNumber, playerId, endRx, endRy) => set((state) => {
    const pressPhases = state.pressPhases.map(phase => {
      if (phase.phaseNumber !== phaseNumber) return phase;
      return {
        ...phase,
        playerTargets: phase.playerTargets.map(target => {
          if (target.playerId !== playerId) return target;
          return {
            ...target,
            endRx: Math.max(0, Math.min(1, endRx)),
            endRy: Math.max(0, Math.min(1, endRy)),
          };
        }),
      };
    });
    return { pressPhases };
  }),

  selectSection: (section) => set({ currentSection: section }),

  selectPhase: (phase) => set({ currentPhase: phase }),

  setPostPress: (option, notes) => set({
    postPress: { option, notes },
  }),

  reset: (sport) => set(getInitialState(sport)),

  loadSchema: (schema) => set({
    sport: schema.sport as 'gaa' | 'hurling' | 'soccer',
    name: schema.name,
    zoneConfig: schema.zoneConfig,
    playerRoles: schema.playerRoles,
    activeTriggers: schema.activeTriggers,
    pressPhases: schema.pressPhases,
    postPress: schema.postPress,
  }),
}));
