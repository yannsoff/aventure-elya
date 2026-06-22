import type { ComponentType } from 'react';
import type { GameType, Item } from '@/types';
import type { GameProps } from './types';
import { SoundPop } from './SoundPop';
import { BlendIt } from './BlendIt';
import { ListenFind } from './ListenFind';
import { WordCatch } from './WordCatch';
import { FlashFlip } from './FlashFlip';
import { MemoryMatch } from './MemoryMatch';
import { TraceIt } from './TraceIt';
import { BuildSentence } from './BuildSentence';
import { NumberBonds } from './NumberBonds';
import { DoubleTrouble } from './DoubleTrouble';
import { HopCount } from './HopCount';
import { TensOnes } from './TensOnes';
import { ClockPlay } from './ClockPlay';
import { AddTake } from './AddTake';
import { FractionPizza } from './FractionPizza';
import { TimesGroups } from './TimesGroups';

export const GAME_COMPONENTS: Record<GameType, ComponentType<GameProps>> = {
  sound_pop: SoundPop,
  blend_it: BlendIt,
  listen_find: ListenFind,
  word_catch: WordCatch,
  flash_flip: FlashFlip,
  memory_match: MemoryMatch,
  trace_it: TraceIt,
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

// FR label per game type (used in the parent dashboard / session pips).
export const GAME_LABELS: Record<GameType, string> = {
  sound_pop: 'Les sons',
  blend_it: 'Fusionner',
  listen_find: 'Écoute et trouve',
  word_catch: 'Attrape le mot',
  flash_flip: 'Carte éclair',
  memory_match: 'Les paires',
  trace_it: 'Tracer',
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

// Resolve which game variant renders an item (HF words rotate through variants).
export function pickGameType(item: Item): GameType {
  const variants = item.payload.variants as GameType[] | undefined;
  if (variants && variants.length > 0) {
    return variants[Math.floor(Math.random() * variants.length)];
  }
  return item.gameType;
}
