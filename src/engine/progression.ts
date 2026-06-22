import type { Mastery, WeekProgress } from '@/types';
import { getItemById, getSkillById } from '@/content/seed';

// Buddy level economy: the companion grows every STARS_PER_LEVEL points.
export const STARS_PER_LEVEL = 120;

export function levelForStars(stars: number): number {
  return Math.floor(stars / STARS_PER_LEVEL) + 1;
}

export function starsIntoLevel(stars: number): { current: number; needed: number } {
  return { current: stars % STARS_PER_LEVEL, needed: STARS_PER_LEVEL };
}

// Badge catalogue. Each badge has an FR label + lucide icon name + a predicate.
export interface BadgeDef {
  id: string;
  label: string;
  icon: string;
}

export const BADGES: Record<string, BadgeDef> = {
  first_steps: { id: 'first_steps', label: 'Premiers pas', icon: 'Footprints' },
  words_10: { id: 'words_10', label: '10 premiers mots', icon: 'BookOpen' },
  words_25: { id: 'words_25', label: 'Super lectrice', icon: 'BookOpenCheck' },
  bonds_10: { id: 'bonds_10', label: 'Compléments à 10', icon: 'Calculator' },
  bonds_20: { id: 'bonds_20', label: 'Compléments à 20', icon: 'Sigma' },
  streak_5: { id: 'streak_5', label: 'Série de 5 jours', icon: 'Flame' },
  island_1: { id: 'island_1', label: 'Première île', icon: 'Flag' },
  mathlete: { id: 'mathlete', label: 'Championne des maths', icon: 'Medal' },
  writer: { id: 'writer', label: 'Petite écrivaine', icon: 'PenTool' },
};

function countMasteredInSkill(masteries: Mastery[], skillId: string): number {
  return masteries.filter((m) => m.box === 4 && getItemById(m.itemId)?.skillId === skillId).length;
}

function countMasteredInDomain(masteries: Mastery[], domain: string): number {
  return masteries.filter((m) => {
    if (m.box !== 4) return false;
    const item = getItemById(m.itemId);
    const skill = item ? getSkillById(item.skillId) : undefined;
    return skill?.domain === domain;
  }).length;
}

// Recompute the full set of earned badges from current state.
export function computeBadges(
  masteries: Mastery[],
  weekProgress: WeekProgress[],
  streak: number,
  daysCompletedTotal: number,
): string[] {
  const earned: string[] = [];

  if (daysCompletedTotal >= 1) earned.push('first_steps');

  const masteredWords = countMasteredInDomain(masteries, 'hfwords');
  if (masteredWords >= 10) earned.push('words_10');
  if (masteredWords >= 25) earned.push('words_25');

  if (countMasteredInSkill(masteries, 'sk-nb10') >= 11) earned.push('bonds_10');
  if (countMasteredInSkill(masteries, 'sk-nb20') >= 15) earned.push('bonds_20');

  if (streak >= 5) earned.push('streak_5');

  if (weekProgress.some((w) => w.chestOpened)) earned.push('island_1');

  if (countMasteredInDomain(masteries, 'maths') >= 20) earned.push('mathlete');
  if (countMasteredInSkill(masteries, 'sk-trace') >= 8) earned.push('writer');

  return earned;
}

// Days between two ISO dates (b - a). Used for streak continuity.
export function dayDiff(aISO: string, bISO: string): number {
  const a = new Date(aISO + 'T00:00:00').getTime();
  const b = new Date(bISO + 'T00:00:00').getTime();
  return Math.round((b - a) / 86400000);
}
