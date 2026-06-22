import type {
  Attempt,
  Child,
  DaySession,
  Mastery,
  ProgressSummary,
  Reward,
  WeekProgress,
} from '@/types';

// Abstract persistence contract. The app only ever talks to this interface,
// so a SupabaseAdapter (cloud sync) can be swapped in later without rewrites.
export interface StorageAdapter {
  // Child profile
  getChild(): Promise<Child | undefined>;
  saveChild(child: Child): Promise<void>;

  // Mastery (Leitner state) keyed by itemId
  getMastery(itemId: string): Promise<Mastery | undefined>;
  getAllMastery(): Promise<Mastery[]>;
  saveMastery(mastery: Mastery): Promise<void>;

  // Attempts log
  addAttempt(attempt: Attempt): Promise<void>;
  getAttempts(): Promise<Attempt[]>;

  // Day sessions
  saveDaySession(session: DaySession): Promise<void>;
  getDaySession(weekIndex: number, dayIndex: number): Promise<DaySession | undefined>;
  getAllDaySessions(): Promise<DaySession[]>;

  // Week progress
  saveWeekProgress(week: WeekProgress): Promise<void>;
  getWeekProgress(weekIndex: number): Promise<WeekProgress | undefined>;
  getAllWeekProgress(): Promise<WeekProgress[]>;

  // Rewards (parent-defined per week)
  saveReward(reward: Reward): Promise<void>;
  getReward(weekIndex: number): Promise<Reward | undefined>;
  getAllRewards(): Promise<Reward[]>;

  // Progress summary (stars/level/streak/badges) — single row
  getProgress(): Promise<ProgressSummary | undefined>;
  saveProgress(progress: ProgressSummary): Promise<void>;

  // Generic settings (PIN, mute, current week/day position...)
  getSetting<T>(key: string): Promise<T | undefined>;
  setSetting<T>(key: string, value: T): Promise<void>;

  // Maintenance
  exportAll(): Promise<Record<string, unknown>>;
  resetAll(): Promise<void>;
  resetWeek(weekIndex: number): Promise<void>;
}
