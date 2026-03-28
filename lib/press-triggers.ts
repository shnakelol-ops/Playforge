import type { PressTrigger } from './press-types';

export const PRESS_TRIGGERS: PressTrigger[] = [
  // Universal triggers (all sports)
  {
    id: 'universal_short_kickout',
    label: 'Short kickout',
    description: 'Press immediately when short kick is taken',
    category: 'universal',
  },
  {
    id: 'universal_long_kickout',
    label: 'Long kickout',
    description: 'Press when long kick is taken',
    category: 'universal',
  },
  {
    id: 'universal_bad_pass',
    label: 'Bad/backward pass',
    description: 'Press when opposition makes poor or backward pass',
    category: 'universal',
  },
  {
    id: 'universal_turnover',
    label: 'Turnover',
    description: 'Press immediately after losing possession',
    category: 'universal',
  },
  {
    id: 'universal_dropped_ball',
    label: 'Dropped ball',
    description: 'Press during contested dropped ball situations',
    category: 'universal',
  },
  {
    id: 'universal_loose_ball',
    label: 'Loose ball',
    description: 'Press when ball is loose and contested',
    category: 'universal',
  },
  {
    id: 'universal_high_ball',
    label: 'High ball',
    description: 'Press when high ball is played',
    category: 'universal',
  },
  {
    id: 'universal_wide_pass',
    label: 'Wide pass',
    description: 'Press when opposition plays to the wing',
    category: 'universal',
  },

  // GAA-specific triggers
  {
    id: 'gaa_kickout_high',
    label: 'Kickout high',
    description: 'Press immediately when goalkeeper takes high kick',
    category: 'gaa',
    isKickout: true,
  },
  {
    id: 'gaa_kickout_short',
    label: 'Kickout short',
    description: 'Press when goalkeeper takes short kick',
    category: 'gaa',
    isKickout: true,
  },
  {
    id: 'gaa_short_puckout',
    label: 'Short puck-out',
    description: 'Press when hurling puck-out is short',
    category: 'gaa',
  },
  {
    id: 'gaa_long_puckout',
    label: 'Long puck-out',
    description: 'Press when hurling puck-out is long',
    category: 'gaa',
  },
  {
    id: 'gaa_free_in',
    label: 'Free in',
    description: 'Press when opposition takes free in',
    category: 'gaa',
  },

  // Soccer-specific triggers
  {
    id: 'soccer_goal_kick_short',
    label: 'Goal kick short',
    description: 'Press when goalkeeper takes short goal kick',
    category: 'soccer',
    isKickout: true,
  },
  {
    id: 'soccer_goal_kick_long',
    label: 'Goal kick long',
    description: 'Press when goalkeeper takes long goal kick',
    category: 'soccer',
    isKickout: true,
  },
  {
    id: 'soccer_throw_in',
    label: 'Throw-in',
    description: 'Press when opposition takes throw-in',
    category: 'soccer',
  },
  {
    id: 'soccer_free_kick',
    label: 'Free kick',
    description: 'Press when opposition takes free kick',
    category: 'soccer',
  },
];

export function getTriggersByCategory(category: 'universal' | 'gaa' | 'hurling' | 'soccer'): PressTrigger[] {
  if (category === 'hurling') {
    return PRESS_TRIGGERS.filter(t => t.category === 'gaa' || t.category === 'universal');
  }
  return PRESS_TRIGGERS.filter(t => t.category === 'universal' || t.category === category);
}

export function getTriggerById(id: string): PressTrigger | undefined {
  return PRESS_TRIGGERS.find(t => t.id === id);
}
