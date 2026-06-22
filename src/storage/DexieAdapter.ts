import type { StorageAdapter } from './StorageAdapter';
import { db } from './db';
import type {
  Attempt,
  Child,
  DaySession,
  Mastery,
  ProgressSummary,
  Reward,
  WeekProgress,
} from '@/types';

const PROGRESS_ID = 'singleton';
const dayId = (w: number, d: number) => `w${w}-d${d}`;

// IndexedDB implementation of the StorageAdapter contract (offline-first).
export class DexieAdapter implements StorageAdapter {
  async getChild(): Promise<Child | undefined> {
    return (await db.child.toArray())[0];
  }
  async saveChild(child: Child): Promise<void> {
    await db.child.put(child);
  }

  async getMastery(itemId: string): Promise<Mastery | undefined> {
    return db.mastery.get(itemId);
  }
  async getAllMastery(): Promise<Mastery[]> {
    return db.mastery.toArray();
  }
  async saveMastery(mastery: Mastery): Promise<void> {
    await db.mastery.put(mastery);
  }

  async addAttempt(attempt: Attempt): Promise<void> {
    await db.attempts.put(attempt);
  }
  async getAttempts(): Promise<Attempt[]> {
    return db.attempts.toArray();
  }

  async saveDaySession(session: DaySession): Promise<void> {
    await db.daySessions.put(session);
  }
  async getDaySession(weekIndex: number, dayIndex: number): Promise<DaySession | undefined> {
    return db.daySessions.get(dayId(weekIndex, dayIndex));
  }
  async getAllDaySessions(): Promise<DaySession[]> {
    return db.daySessions.toArray();
  }

  async saveWeekProgress(week: WeekProgress): Promise<void> {
    await db.weekProgress.put(week);
  }
  async getWeekProgress(weekIndex: number): Promise<WeekProgress | undefined> {
    return db.weekProgress.get(weekIndex);
  }
  async getAllWeekProgress(): Promise<WeekProgress[]> {
    return db.weekProgress.toArray();
  }

  async saveReward(reward: Reward): Promise<void> {
    await db.rewards.put(reward);
  }
  async getReward(weekIndex: number): Promise<Reward | undefined> {
    return db.rewards.get(weekIndex);
  }
  async getAllRewards(): Promise<Reward[]> {
    return db.rewards.toArray();
  }

  async getProgress(): Promise<ProgressSummary | undefined> {
    const row = await db.progress.get(PROGRESS_ID);
    if (!row) return undefined;
    const { id, ...rest } = row;
    void id;
    return rest;
  }
  async saveProgress(progress: ProgressSummary): Promise<void> {
    await db.progress.put({ ...progress, id: PROGRESS_ID });
  }

  async getSetting<T>(key: string): Promise<T | undefined> {
    const row = await db.settings.get(key);
    return row?.value as T | undefined;
  }
  async setSetting<T>(key: string, value: T): Promise<void> {
    await db.settings.put({ key, value });
  }

  async exportAll(): Promise<Record<string, unknown>> {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      child: await db.child.toArray(),
      mastery: await db.mastery.toArray(),
      attempts: await db.attempts.toArray(),
      daySessions: await db.daySessions.toArray(),
      weekProgress: await db.weekProgress.toArray(),
      rewards: await db.rewards.toArray(),
      progress: await db.progress.toArray(),
      settings: await db.settings.toArray(),
    };
  }

  async resetAll(): Promise<void> {
    await db.transaction(
      'rw',
      [
        db.child,
        db.mastery,
        db.attempts,
        db.daySessions,
        db.weekProgress,
        db.rewards,
        db.progress,
        db.settings,
      ],
      async () => {
        await Promise.all([
          db.child.clear(),
          db.mastery.clear(),
          db.attempts.clear(),
          db.daySessions.clear(),
          db.weekProgress.clear(),
          db.rewards.clear(),
          db.progress.clear(),
          db.settings.clear(),
        ]);
      },
    );
  }

  async resetWeek(weekIndex: number): Promise<void> {
    const sessions = await db.daySessions.where('weekIndex').equals(weekIndex).toArray();
    await db.daySessions.bulkDelete(sessions.map((s) => s.id));
    await db.weekProgress.delete(weekIndex);
  }
}

export const storage: StorageAdapter = new DexieAdapter();
