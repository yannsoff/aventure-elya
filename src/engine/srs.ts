import type { LeitnerBox, Mastery } from '@/types';

// Simplified Leitner spaced-repetition (4 boxes; box 4 = mastered).
// Confidence-first: a wrong answer never punishes the child, it just sends the
// item back to box 1 and into the error bank so it resurfaces next session.

// Interval (in days) for the box an item lands in. Box 1 = next session (same day).
const BOX_INTERVAL_DAYS: Record<LeitnerBox, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
};

export function todayISO(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return todayISO(d);
}

export function isDue(mastery: Mastery, today = todayISO()): boolean {
  return mastery.nextDue <= today;
}

// Create the initial mastery record for a brand new item (box 1, due now).
export function freshMastery(itemId: string): Mastery {
  const today = todayISO();
  return {
    itemId,
    box: 1,
    nextDue: today,
    correctStreak: 0,
    timesWrong: 0,
    lastSeen: today,
  };
}

// Apply a graded attempt and return the updated mastery record.
export function gradeMastery(prev: Mastery | undefined, itemId: string, correct: boolean): Mastery {
  const base = prev ?? freshMastery(itemId);
  const today = todayISO();

  if (correct) {
    const nextBox = Math.min(4, base.box + 1) as LeitnerBox;
    return {
      ...base,
      box: nextBox,
      correctStreak: base.correctStreak + 1,
      nextDue: addDays(today, BOX_INTERVAL_DAYS[nextBox]),
      lastSeen: today,
    };
  }

  // Wrong: back to box 1, due immediately, logged in the error bank via timesWrong.
  return {
    ...base,
    box: 1,
    correctStreak: 0,
    timesWrong: base.timesWrong + 1,
    nextDue: today,
    lastSeen: today,
  };
}

export function isMastered(mastery: Mastery | undefined): boolean {
  return mastery?.box === 4;
}

// The error bank: items the child got wrong and that are not yet mastered.
// Sorted most-failed first so the constructor can prioritise them.
export function errorBank(masteries: Mastery[], today = todayISO()): Mastery[] {
  return masteries
    .filter((m) => m.timesWrong > 0 && m.box < 4 && m.nextDue <= today)
    .sort((a, b) => b.timesWrong - a.timesWrong);
}
