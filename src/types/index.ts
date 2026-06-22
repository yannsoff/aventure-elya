// Core domain model for "L'Aventure d'Elya".
// All identifiers/comments in English; UI strings live in French in components.

export type BuddyType = 'fox' | 'owl' | 'cat' | 'bunny' | 'unicorn' | 'dolphin';

export type Domain = 'phonics' | 'reading' | 'hfwords' | 'writing' | 'maths';

// The full catalogue of mini-game identifiers driven by the adaptive engine.
export type GameType =
  | 'sound_pop'
  | 'blend_it'
  | 'listen_find'
  | 'word_catch'
  | 'flash_flip'
  | 'memory_match'
  | 'trace_it'
  | 'build_sentence'
  | 'number_bonds'
  | 'double_trouble'
  | 'hop_count'
  | 'tens_ones'
  | 'clock_play'
  | 'add_take'
  | 'fraction_pizza'
  | 'times_groups';

export interface Child {
  id: string;
  name: string; // "Elya"
  buddyType: BuddyType;
  buddyName: string;
  accentColor: string;
  createdAt: string;
}

export interface Skill {
  id: string;
  domain: Domain;
  label: string; // FR label for the parent dashboard
  week: number; // 1..8 focus week
  difficulty: number; // 1..5
}

export interface Item {
  id: string;
  skillId: string;
  gameType: GameType;
  // Free-form payload, shape depends on gameType (e.g. { word: "said" }).
  payload: Record<string, unknown>;
}

export type LeitnerBox = 1 | 2 | 3 | 4; // 4 = mastered

export interface Mastery {
  itemId: string;
  box: LeitnerBox;
  nextDue: string; // ISO date (YYYY-MM-DD)
  correctStreak: number;
  timesWrong: number;
  lastSeen: string;
}

export interface Attempt {
  id: string;
  itemId: string;
  skillId: string;
  correct: boolean;
  timeMs: number;
  date: string; // ISO datetime
  sessionId: string;
}

export interface DaySession {
  id: string;
  weekIndex: number; // 0..7
  dayIndex: number; // 0..4 (Mon..Fri)
  date: string; // YYYY-MM-DD
  completed: boolean;
  validatedByParent: boolean;
  starsEarned: number;
  itemIds: string[];
}

export interface WeekProgress {
  weekIndex: number;
  daysCompleted: number; // 0..5
  chestOpened: boolean;
  badgeAwarded?: string;
}

export interface Reward {
  weekIndex: number;
  label: string; // "une glace"
  icon: string; // lucide icon name, e.g. "IceCream"
  claimed: boolean;
}

export interface ProgressSummary {
  totalStars: number;
  level: number;
  streak: number; // consecutive active days
  badges: string[];
  lastActiveDate: string; // YYYY-MM-DD used to compute streak
}

// A single key/value record for misc settings (PIN, mute, current position...).
export interface Setting {
  key: string;
  value: unknown;
}
