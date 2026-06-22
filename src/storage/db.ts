import Dexie, { type Table } from 'dexie';
import type {
  Attempt,
  Child,
  DaySession,
  Mastery,
  ProgressSummary,
  Reward,
  Setting,
  WeekProgress,
} from '@/types';

// Single IndexedDB database for the whole app.
// ProgressSummary is stored as a singleton row under a fixed id.
export class ElyaDB extends Dexie {
  child!: Table<Child, string>;
  mastery!: Table<Mastery, string>;
  attempts!: Table<Attempt, string>;
  daySessions!: Table<DaySession, string>;
  weekProgress!: Table<WeekProgress, number>;
  rewards!: Table<Reward, number>;
  progress!: Table<ProgressSummary & { id: string }, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('aventure-elya');
    this.version(1).stores({
      child: 'id',
      mastery: 'itemId, box, nextDue, skillId',
      attempts: 'id, itemId, skillId, date, sessionId',
      daySessions: 'id, weekIndex, dayIndex, date',
      weekProgress: 'weekIndex',
      rewards: 'weekIndex',
      progress: 'id',
      settings: 'key',
    });
  }
}

export const db = new ElyaDB();
