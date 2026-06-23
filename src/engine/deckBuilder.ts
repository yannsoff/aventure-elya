import type { Mastery } from '@/types';
import { cardsForDeck, getCardById, type Deck } from '@/content/flashcards';
import { errorBank, isDue, todayISO } from './srs';

// Builds an adaptive flashcard deck for a parent-led session.
// Mix: due review (error bank first) + new focus cards + a few known cards,
// opened on something the child can succeed at (confidence first).

const TARGET = 12;

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function buildDeck(deck: Deck, weekIndex: number, masteries: Mastery[]): string[] {
  const today = todayISO();
  const weekNo = weekIndex + 1;
  const pairStart = weekNo % 2 === 1 ? weekNo : weekNo - 1;

  const deckCards = cardsForDeck(deck);
  const deckIds = new Set(deckCards.map((c) => c.id));
  const masteryById = new Map(masteries.map((m) => [m.itemId, m]));

  const focus = deckCards.filter((c) => c.week === pairStart || c.week === pairStart + 1);
  const available = deckCards.filter((c) => c.week <= weekNo);

  // Review: due cards from this deck, error bank prioritised.
  const bank = errorBank(masteries, today).filter((m) => deckIds.has(m.itemId));
  const bankIds = new Set(bank.map((m) => m.itemId));
  const dueOther = masteries
    .filter((m) => deckIds.has(m.itemId) && m.box < 4 && isDue(m, today) && !bankIds.has(m.itemId))
    .map((m) => m.itemId);
  const review = [...bank.map((m) => m.itemId), ...shuffle(dueOther)];

  // New: focus cards never seen.
  const fresh = shuffle(focus.filter((c) => !masteryById.has(c.id)).map((c) => c.id));

  // Mastered: a couple of box-4 cards for confidence.
  const mastered = shuffle(
    available.filter((c) => masteryById.get(c.id)?.box === 4).map((c) => c.id),
  );

  const chosen: string[] = [];
  const push = (ids: string[], max: number) => {
    let n = 0;
    for (const id of ids) {
      if (chosen.length >= TARGET || n >= max) break;
      if (!chosen.includes(id)) {
        chosen.push(id);
        n++;
      }
    }
  };

  push(review, Math.round(TARGET * 0.4));
  push(fresh, Math.round(TARGET * 0.5));
  push(mastered, TARGET - chosen.length);

  // Backfill from any available, not-yet-mastered card.
  if (chosen.length < TARGET) {
    const backfill = shuffle(
      available.filter((c) => !chosen.includes(c.id) && (masteryById.get(c.id)?.box ?? 1) < 4).map((c) => c.id),
    );
    push(backfill, TARGET - chosen.length);
  }

  // Confidence sandwich: lead with the most-known card.
  if (chosen.length > 2) {
    const ease = (id: string) => masteryById.get(id)?.box ?? 1;
    chosen.sort((a, b) => ease(b) - ease(a));
    const opener = chosen[0];
    const rest = shuffle(chosen.slice(1));
    return [opener, ...rest];
  }
  return chosen;
}

export function deckCardCount(deck: Deck): number {
  return cardsForDeck(deck).length;
}

export { getCardById };
