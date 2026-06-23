import { create } from 'zustand';
import type {
  Attempt,
  Child,
  DaySession,
  Item,
  Mastery,
  ProgressSummary,
  Reward,
  WeekProgress,
} from '@/types';
import { storage } from '@/storage/DexieAdapter';
import { gradeMastery, todayISO } from '@/engine/srs';
import {
  computeBadges,
  dayDiff,
  levelForStars,
} from '@/engine/progression';
import { setMuted as setSpeechMuted } from '@/audio/speech';
import { setSfxMuted } from '@/audio/sfx';

export const TOTAL_WEEKS = 8;
const STAR_CORRECT = 5;
const STAR_TRY = 2;
const DAY_BONUS = 20;

export type Screen =
  | 'splash'
  | 'onboarding'
  | 'hub'
  | 'flashcards'
  | 'map'
  | 'week'
  | 'session'
  | 'chest'
  | 'trophies'
  | 'parent';

export type DeckMode = 'reading' | 'maths';

const dayId = (w: number, d: number) => `w${w}-d${d}`;

function emptyProgress(): ProgressSummary {
  return { totalStars: 0, level: 1, streak: 0, badges: [], lastActiveDate: '' };
}

interface GameState {
  loaded: boolean;
  child: Child | null;
  progress: ProgressSummary;
  masteries: Mastery[];
  attempts: Attempt[];
  daySessions: DaySession[];
  weekProgress: WeekProgress[];
  rewards: Reward[];
  muted: boolean;
  unlockAllDays: boolean;

  // Navigation
  screen: Screen;
  activeWeek: number;
  activeDay: number;
  deckMode: DeckMode;

  // Actions
  init: () => Promise<void>;
  completeOnboarding: (child: Child) => Promise<void>;
  setScreen: (s: Screen) => void;
  openDeck: (deck: DeckMode) => void;
  goToWeek: (weekIndex: number) => void;
  startDay: (weekIndex: number, dayIndex: number) => void;
  recordAttempt: (item: Item, firstTryCorrect: boolean, timeMs: number, sessionId: string) => Promise<void>;
  recordCard: (cardId: string, category: string, correct: boolean) => Promise<void>;
  finishFlashcards: () => Promise<void>;
  finishDay: (weekIndex: number, dayIndex: number, itemIds: string[], sessionStars: number) => Promise<void>;
  openChest: (weekIndex: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  setUnlockAllDays: (value: boolean) => Promise<void>;
  setReward: (reward: Reward) => Promise<void>;
  validateDay: (weekIndex: number, dayIndex: number) => Promise<void>;
  resetWeek: (weekIndex: number) => Promise<void>;
  resetAll: () => Promise<void>;
  exportData: () => Promise<Record<string, unknown>>;

  // Selectors
  currentWeekIndex: () => number;
  currentDayIndex: () => number;
  masteryFor: (itemId: string) => Mastery | undefined;
}

export const useGameStore = create<GameState>((set, get) => ({
  loaded: false,
  child: null,
  progress: emptyProgress(),
  masteries: [],
  attempts: [],
  daySessions: [],
  weekProgress: [],
  rewards: [],
  muted: false,
  unlockAllDays: false,

  screen: 'splash',
  activeWeek: 0,
  activeDay: 0,
  deckMode: 'reading',

  init: async () => {
    const [child, progress, masteries, attempts, daySessions, weekProgress, rewards, muted, unlockAllDays] =
      await Promise.all([
        storage.getChild(),
        storage.getProgress(),
        storage.getAllMastery(),
        storage.getAttempts(),
        storage.getAllDaySessions(),
        storage.getAllWeekProgress(),
        storage.getAllRewards(),
        storage.getSetting<boolean>('muted'),
        storage.getSetting<boolean>('unlockAllDays'),
      ]);

    setSpeechMuted(muted ?? false);
    setSfxMuted(muted ?? false);

    set({
      loaded: true,
      child: child ?? null,
      progress: progress ?? emptyProgress(),
      masteries,
      attempts,
      daySessions,
      weekProgress,
      rewards,
      muted: muted ?? false,
      unlockAllDays: unlockAllDays ?? false,
      screen: child ? 'splash' : 'onboarding',
    });
  },

  completeOnboarding: async (child) => {
    await storage.saveChild(child);
    document.documentElement.style.setProperty('--accent', child.accentColor);
    set({ child, screen: 'hub' });
  },

  setScreen: (s) => set({ screen: s }),
  openDeck: (deck) => set({ deckMode: deck, screen: 'flashcards' }),
  goToWeek: (weekIndex) => set({ activeWeek: weekIndex, screen: 'week' }),
  startDay: (weekIndex, dayIndex) =>
    set({ activeWeek: weekIndex, activeDay: dayIndex, screen: 'session' }),

  recordAttempt: async (item, firstTryCorrect, timeMs, sessionId) => {
    const state = get();
    const prevMastery = state.masteries.find((m) => m.itemId === item.id);
    const newMastery = gradeMastery(prevMastery, item.id, firstTryCorrect);

    const attempt: Attempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      itemId: item.id,
      skillId: item.skillId,
      correct: firstTryCorrect,
      timeMs,
      date: new Date().toISOString(),
      sessionId,
    };

    const gained = firstTryCorrect ? STAR_CORRECT : STAR_TRY;
    const totalStars = state.progress.totalStars + gained;
    const progress: ProgressSummary = {
      ...state.progress,
      totalStars,
      level: levelForStars(totalStars),
    };

    const masteries = [
      ...state.masteries.filter((m) => m.itemId !== item.id),
      newMastery,
    ];

    set({ masteries, attempts: [...state.attempts, attempt], progress });

    await Promise.all([
      storage.saveMastery(newMastery),
      storage.addAttempt(attempt),
      storage.saveProgress(progress),
    ]);
  },

  // Records one flashcard swipe: right = known (correct), left = "à revoir".
  // Reuses the Leitner engine + error bank; both directions earn points (effort-first).
  recordCard: async (cardId, category, correct) => {
    const state = get();
    const prevMastery = state.masteries.find((m) => m.itemId === cardId);
    const newMastery = gradeMastery(prevMastery, cardId, correct);

    const attempt: Attempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      itemId: cardId,
      skillId: category,
      correct,
      timeMs: 0,
      date: new Date().toISOString(),
      sessionId: 'flashcards',
    };

    const gained = correct ? STAR_CORRECT : STAR_TRY;
    const totalStars = state.progress.totalStars + gained;
    const progress: ProgressSummary = {
      ...state.progress,
      totalStars,
      level: levelForStars(totalStars),
    };
    const masteries = [...state.masteries.filter((m) => m.itemId !== cardId), newMastery];

    set({ masteries, attempts: [...state.attempts, attempt], progress });
    await Promise.all([
      storage.saveMastery(newMastery),
      storage.addAttempt(attempt),
      storage.saveProgress(progress),
    ]);
  },

  // Completing a flashcard deck counts as a daily activity: bumps the streak.
  finishFlashcards: async () => {
    const state = get();
    const today = todayISO();
    let streak = state.progress.streak;
    const last = state.progress.lastActiveDate;
    if (last !== today) {
      if (last && dayDiff(last, today) === 1) streak += 1;
      else streak = 1;
    } else if (streak === 0) {
      streak = 1;
    }
    const daysCompletedTotal = state.daySessions.filter((s) => s.completed).length;
    const badges = computeBadges(state.masteries, state.weekProgress, streak, daysCompletedTotal);
    const progress: ProgressSummary = { ...state.progress, streak, badges, lastActiveDate: today };
    set({ progress });
    await storage.saveProgress(progress);
  },

  finishDay: async (weekIndex, dayIndex, itemIds, sessionStars) => {
    const state = get();
    const today = todayISO();

    const session: DaySession = {
      id: dayId(weekIndex, dayIndex),
      weekIndex,
      dayIndex,
      date: today,
      completed: true,
      validatedByParent: state.daySessions.find((s) => s.id === dayId(weekIndex, dayIndex))?.validatedByParent ?? false,
      starsEarned: sessionStars + DAY_BONUS,
      itemIds,
    };

    // Streak continuity.
    let streak = state.progress.streak;
    const last = state.progress.lastActiveDate;
    if (last !== today) {
      if (last && dayDiff(last, today) === 1) streak += 1;
      else streak = 1;
    } else if (streak === 0) {
      streak = 1;
    }

    const daySessions = [
      ...state.daySessions.filter((s) => s.id !== session.id),
      session,
    ];

    const daysCompleted = daySessions.filter(
      (s) => s.weekIndex === weekIndex && s.completed,
    ).length;

    const prevWeek = state.weekProgress.find((w) => w.weekIndex === weekIndex);
    const week: WeekProgress = {
      weekIndex,
      daysCompleted,
      chestOpened: prevWeek?.chestOpened ?? false,
      badgeAwarded: prevWeek?.badgeAwarded,
    };
    const weekProgress = [
      ...state.weekProgress.filter((w) => w.weekIndex !== weekIndex),
      week,
    ];

    const totalStars = state.progress.totalStars + DAY_BONUS;
    const daysCompletedTotal = daySessions.filter((s) => s.completed).length;
    const badges = computeBadges(state.masteries, weekProgress, streak, daysCompletedTotal);

    const progress: ProgressSummary = {
      ...state.progress,
      totalStars,
      level: levelForStars(totalStars),
      streak,
      badges,
      lastActiveDate: today,
    };

    set({ daySessions, weekProgress, progress });

    await Promise.all([
      storage.saveDaySession(session),
      storage.saveWeekProgress(week),
      storage.saveProgress(progress),
    ]);
  },

  openChest: async (weekIndex) => {
    const state = get();
    const prevWeek = state.weekProgress.find((w) => w.weekIndex === weekIndex);
    const week: WeekProgress = {
      weekIndex,
      daysCompleted: prevWeek?.daysCompleted ?? 5,
      chestOpened: true,
      badgeAwarded: prevWeek?.badgeAwarded ?? 'island_1',
    };
    const weekProgress = [
      ...state.weekProgress.filter((w) => w.weekIndex !== weekIndex),
      week,
    ];
    const reward = state.rewards.find((r) => r.weekIndex === weekIndex);
    const rewards = reward
      ? [
          ...state.rewards.filter((r) => r.weekIndex !== weekIndex),
          { ...reward, claimed: true },
        ]
      : state.rewards;

    set({ weekProgress, rewards });
    await Promise.all([
      storage.saveWeekProgress(week),
      ...(reward ? [storage.saveReward({ ...reward, claimed: true })] : []),
    ]);
  },

  toggleMute: async () => {
    const muted = !get().muted;
    setSpeechMuted(muted);
    setSfxMuted(muted);
    set({ muted });
    await storage.setSetting('muted', muted);
  },

  setUnlockAllDays: async (value) => {
    set({ unlockAllDays: value });
    await storage.setSetting('unlockAllDays', value);
  },

  setReward: async (reward) => {
    const state = get();
    const rewards = [
      ...state.rewards.filter((r) => r.weekIndex !== reward.weekIndex),
      reward,
    ];
    set({ rewards });
    await storage.saveReward(reward);
  },

  validateDay: async (weekIndex, dayIndex) => {
    const state = get();
    const id = dayId(weekIndex, dayIndex);
    const existing = state.daySessions.find((s) => s.id === id);
    const session: DaySession = existing
      ? { ...existing, validatedByParent: true }
      : {
          id,
          weekIndex,
          dayIndex,
          date: todayISO(),
          completed: true,
          validatedByParent: true,
          starsEarned: 0,
          itemIds: [],
        };
    const daySessions = [...state.daySessions.filter((s) => s.id !== id), session];
    const daysCompleted = daySessions.filter((s) => s.weekIndex === weekIndex && s.completed).length;
    const prevWeek = state.weekProgress.find((w) => w.weekIndex === weekIndex);
    const week: WeekProgress = {
      weekIndex,
      daysCompleted,
      chestOpened: prevWeek?.chestOpened ?? false,
      badgeAwarded: prevWeek?.badgeAwarded,
    };
    const weekProgress = [...state.weekProgress.filter((w) => w.weekIndex !== weekIndex), week];
    set({ daySessions, weekProgress });
    await Promise.all([storage.saveDaySession(session), storage.saveWeekProgress(week)]);
  },

  resetWeek: async (weekIndex) => {
    await storage.resetWeek(weekIndex);
    const [daySessions, weekProgress] = await Promise.all([
      storage.getAllDaySessions(),
      storage.getAllWeekProgress(),
    ]);
    set({ daySessions, weekProgress });
  },

  resetAll: async () => {
    await storage.resetAll();
    set({
      child: null,
      progress: emptyProgress(),
      masteries: [],
      attempts: [],
      daySessions: [],
      weekProgress: [],
      rewards: [],
      screen: 'onboarding',
    });
  },

  exportData: async () => storage.exportAll(),

  currentWeekIndex: () => {
    const { weekProgress } = get();
    for (let w = 0; w < TOTAL_WEEKS; w++) {
      const wp = weekProgress.find((x) => x.weekIndex === w);
      if (!wp || wp.daysCompleted < 5) return w;
    }
    return TOTAL_WEEKS - 1;
  },

  currentDayIndex: () => {
    const week = get().currentWeekIndex();
    const { daySessions } = get();
    for (let d = 0; d < 5; d++) {
      const s = daySessions.find((x) => x.weekIndex === week && x.dayIndex === d);
      if (!s || !s.completed) return d;
    }
    return 4;
  },

  masteryFor: (itemId) => get().masteries.find((m) => m.itemId === itemId),
}));
