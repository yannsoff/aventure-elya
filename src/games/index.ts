import type { ComponentType } from 'react';
import type { GameType, Item } from '@/types';
import type { GameProps } from './types';
import { BuildSentence } from './BuildSentence';
import { NumberBonds } from './NumberBonds';
import { DoubleTrouble } from './DoubleTrouble';
import { HopCount } from './HopCount';
import { TensOnes } from './TensOnes';
import { ClockPlay } from './ClockPlay';
import { AddTake } from './AddTake';
import { FractionPizza } from './FractionPizza';
import { TimesGroups } from './TimesGroups';

// Active interactive games in the "Aventure". Reading/phonics recognition games
// and letter-tracing were removed: reading is now assessed via WordSwipe flashcards
// (the child reads aloud), which is more meaningful for a Year 2/3 target.
export const GAME_COMPONENTS: Partial<Record<GameType, ComponentType<GameProps>>> = {
  build_sentence: BuildSentence,
  number_bonds: NumberBonds,
  double_trouble: DoubleTrouble,
  hop_count: HopCount,
  tens_ones: TensOnes,
  clock_play: ClockPlay,
  add_take: AddTake,
  fraction_pizza: FractionPizza,
  times_groups: TimesGroups,
};

export const GAME_LABELS: Partial<Record<GameType, string>> = {
  build_sentence: 'La phrase',
  number_bonds: 'Compléments',
  double_trouble: 'Les doubles',
  hop_count: 'Compter',
  tens_ones: 'Dizaines et unités',
  clock_play: "L'heure",
  add_take: 'Plus et moins',
  fraction_pizza: 'Fractions',
  times_groups: 'Les groupes',
};

// Resolve which game renders an item (kept for forward-compat with variants).
export function pickGameType(item: Item): GameType {
  const variants = item.payload.variants as GameType[] | undefined;
  if (variants && variants.length > 0) {
    return variants[Math.floor(Math.random() * variants.length)];
  }
  return item.gameType;
}
