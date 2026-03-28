export type PressZone = 'high' | 'mid' | 'low';
export type PressRole = 'firstPresser' | 'coverShadow' | 'holdShape' | 'pressTrigger';
export type PostPressOption = 'playForward' | 'recycleWide' | 'switchPlay' | 'holdAndBuild';

export interface PressZoneConfig {
  zone: PressZone;
  triggerLine: number;
}

export interface PlayerRoleMap {
  [playerId: number]: PressRole;
}

export interface PressTrigger {
  id: string;
  label: string;
  description?: string;
  category: 'universal' | 'gaa' | 'hurling' | 'soccer';
  isKickout?: boolean;
}

export interface PlayerPressTarget {
  playerId: number;
  startRx: number;
  startRy: number;
  endRx: number;
  endRy: number;
}

export interface PressPhase {
  phaseNumber: 1 | 2;
  playerTargets: PlayerPressTarget[];
}

export interface PostPressConfig {
  option: PostPressOption;
  notes: string;
}

export interface PressSchema {
  id: string;
  user_id: string;
  name: string;
  sport: string;
  zoneConfig: PressZoneConfig;
  playerRoles: PlayerRoleMap;
  activeTriggers: string[];
  pressPhases: PressPhase[];
  postPress: PostPressConfig;
  created_at: string;
}

export type PressSchemaInsert = Omit<PressSchema, 'id' | 'user_id' | 'created_at'>;
