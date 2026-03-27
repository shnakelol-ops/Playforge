export type Sport = 'gaa' | 'hurling' | 'soccer';
export type RunStyle = 'run' | 'decoy' | 'pass';
export type InteractionMode = 'move' | 'draw' | 'ball';

export interface PlayerConfig {
  id: number;
  num: string;
  pos: string;
  rx: number;
  ry: number;
}

export const GAA_HOME_POSITIONS: PlayerConfig[] = [
  { id: 1,  num: '1',  pos: 'GK', rx: 0.50, ry: 0.91 },
  { id: 2,  num: '2',  pos: 'FB', rx: 0.22, ry: 0.80 },
  { id: 3,  num: '3',  pos: 'FB', rx: 0.50, ry: 0.80 },
  { id: 4,  num: '4',  pos: 'FB', rx: 0.78, ry: 0.80 },
  { id: 5,  num: '5',  pos: 'HB', rx: 0.15, ry: 0.68 },
  { id: 6,  num: '6',  pos: 'HB', rx: 0.50, ry: 0.68 },
  { id: 7,  num: '7',  pos: 'HB', rx: 0.85, ry: 0.68 },
  { id: 8,  num: '8',  pos: 'MF', rx: 0.28, ry: 0.56 },
  { id: 9,  num: '9',  pos: 'MF', rx: 0.50, ry: 0.56 },
  { id: 10, num: '10', pos: 'MF', rx: 0.72, ry: 0.56 },
  { id: 11, num: '11', pos: 'HF', rx: 0.15, ry: 0.44 },
  { id: 12, num: '12', pos: 'HF', rx: 0.50, ry: 0.44 },
  { id: 13, num: '13', pos: 'HF', rx: 0.85, ry: 0.44 },
  { id: 14, num: '14', pos: 'FF', rx: 0.32, ry: 0.30 },
  { id: 15, num: '15', pos: 'FF', rx: 0.68, ry: 0.30 },
];

export const GAA_AWAY_POSITIONS: PlayerConfig[] = GAA_HOME_POSITIONS.map(p => ({
  ...p,
  id: p.id + 100,
  ry: 1 - p.ry,
}));

export const SOCCER_HOME_POSITIONS: PlayerConfig[] = [
  { id: 1,  num: '1',  pos: 'GK', rx: 0.50, ry: 0.92 },
  { id: 2,  num: '2',  pos: 'LB', rx: 0.20, ry: 0.75 },
  { id: 3,  num: '3',  pos: 'CB', rx: 0.40, ry: 0.78 },
  { id: 4,  num: '4',  pos: 'CB', rx: 0.60, ry: 0.78 },
  { id: 5,  num: '5',  pos: 'RB', rx: 0.80, ry: 0.75 },
  { id: 6,  num: '6',  pos: 'LM', rx: 0.25, ry: 0.60 },
  { id: 7,  num: '7',  pos: 'CM', rx: 0.50, ry: 0.62 },
  { id: 8,  num: '8',  pos: 'RM', rx: 0.75, ry: 0.60 },
  { id: 9,  num: '9',  pos: 'LF', rx: 0.35, ry: 0.42 },
  { id: 10, num: '10', pos: 'RF', rx: 0.65, ry: 0.42 },
  { id: 11, num: '11', pos: 'ST', rx: 0.50, ry: 0.25 },
];

export const SOCCER_AWAY_POSITIONS: PlayerConfig[] = SOCCER_HOME_POSITIONS.map(p => ({
  ...p,
  id: p.id + 100,
  ry: 1 - p.ry,
}));

export function getDefaultPositions(sport: Sport): { home: PlayerConfig[]; away: PlayerConfig[] } {
  if (sport === 'soccer') {
    return { home: SOCCER_HOME_POSITIONS, away: SOCCER_AWAY_POSITIONS };
  }
  return { home: GAA_HOME_POSITIONS, away: GAA_AWAY_POSITIONS };
}
