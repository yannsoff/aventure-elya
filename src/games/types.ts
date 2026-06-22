import type { Item } from '@/types';

// Contract every mini-game implements. The session player provides the target
// item plus its same-skill siblings (used to build plausible distractors), and
// receives the first-try correctness to feed the adaptive engine.
export interface GameProps {
  item: Item;
  siblings: Item[];
  onAnswer: (firstTryCorrect: boolean) => void;
}

export function num<T = number>(payload: Record<string, unknown>, key: string, fallback: T): T {
  return (payload[key] as T) ?? fallback;
}
