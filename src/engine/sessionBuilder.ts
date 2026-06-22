import type { Attempt, Item, Mastery } from '@/types';
import { getAllItems, newSkillsForWeek, getSkillById } from '@/content/seed';
import { errorBank, isDue, todayISO } from './srs';

// Adaptive daily session constructor (§6.2).
// Composition target: ~50% new focus items, ~35% review (error bank first),
// ~15% mastered items for confidence, wrapped in a "confidence sandwich".

const TARGET_SIZE = 14;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface BuiltSession {
  itemIds: string[];
}

export function buildDailySession(
  weekIndex: number,
  masteries: Mastery[],
  _attempts: Attempt[],
): BuiltSession {
  void _attempts;
  const today = todayISO();
  const masteryById = new Map(masteries.map((m) => [m.itemId, m]));
  const allItems = getAllItems();

  // Items belonging to the current pair-week focus skills.
  const newSkillIds = new Set(newSkillsForWeek(weekIndex).map((s) => s.id));
  const focusItems = allItems.filter((i) => newSkillIds.has(i.skillId));

  // 1) NEW: focus items never seen yet (no mastery record), easiest skills first.
  const newPool = shuffle(
    focusItems.filter((i) => !masteryById.has(i.id)),
  ).sort((a, b) => (getSkillById(a.skillId)?.difficulty ?? 3) - (getSkillById(b.skillId)?.difficulty ?? 3));

  // 2) REVIEW: due items, error bank prioritised (most-failed first).
  const bank = errorBank(masteries, today);
  const bankIds = new Set(bank.map((m) => m.itemId));
  const dueOther = masteries
    .filter((m) => m.box < 4 && isDue(m, today) && !bankIds.has(m.itemId))
    .map((m) => m.itemId);
  const reviewIds = [...bank.map((m) => m.itemId), ...shuffle(dueOther)].filter((id) =>
    allItems.some((i) => i.id === id),
  );

  // 3) MASTERED: a couple of box-4 items for the confidence sandwich.
  const masteredIds = shuffle(
    masteries.filter((m) => m.box === 4).map((m) => m.itemId),
  );

  const nNew = Math.round(TARGET_SIZE * 0.5);
  const nReview = Math.round(TARGET_SIZE * 0.35);
  const nMastered = TARGET_SIZE - nNew - nReview;

  const chosen: string[] = [];
  const pushUnique = (ids: string[], max: number) => {
    for (const id of ids) {
      if (chosen.length >= TARGET_SIZE) break;
      if (chosen.filter((c) => ids.includes(c)).length >= max) break;
      if (!chosen.includes(id)) chosen.push(id);
    }
  };

  pushUnique(reviewIds, nReview);
  pushUnique(newPool.map((i) => i.id), nNew);
  pushUnique(masteredIds, nMastered);

  // Backfill from any focus item (even seen-but-not-mastered) if short.
  if (chosen.length < TARGET_SIZE) {
    const backfill = shuffle(
      focusItems
        .filter((i) => !chosen.includes(i.id))
        .filter((i) => (masteryById.get(i.id)?.box ?? 1) < 4),
    ).map((i) => i.id);
    for (const id of backfill) {
      if (chosen.length >= TARGET_SIZE) break;
      chosen.push(id);
    }
  }

  // Confidence sandwich: start and end on something the child can succeed at.
  const ordered = arrangeSandwich(chosen, masteryById, allItems);
  return { itemIds: ordered };
}

// Place an easy/known item first and last; interleave the rest.
function arrangeSandwich(
  ids: string[],
  masteryById: Map<string, Mastery>,
  allItems: Item[],
): string[] {
  if (ids.length <= 2) return ids;
  const itemById = new Map(allItems.map((i) => [i.id, i]));
  const easeScore = (id: string): number => {
    const m = masteryById.get(id);
    const skill = getSkillById(itemById.get(id)?.skillId ?? '');
    // Higher box and lower skill difficulty => easier => higher score.
    return (m?.box ?? 1) * 2 - (skill?.difficulty ?? 3);
  };
  const sorted = [...ids].sort((a, b) => easeScore(b) - easeScore(a));
  const opener = sorted[0];
  const closer = sorted[1];
  const middle = shuffle(ids.filter((id) => id !== opener && id !== closer));
  return [opener, ...middle, closer];
}
