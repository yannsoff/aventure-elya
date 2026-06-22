import type { Attempt } from '@/types';

// Tracks rolling accuracy per skill to drive difficulty adjustment (§6.3).

const WINDOW = 10; // last N attempts per skill

export function skillAccuracy(attempts: Attempt[], skillId: string): number | null {
  const recent = attempts
    .filter((a) => a.skillId === skillId)
    .slice(-WINDOW);
  if (recent.length === 0) return null;
  const correct = recent.filter((a) => a.correct).length;
  return correct / recent.length;
}

export type DifficultyHint = 'scaffold' | 'hold' | 'advance';

// < 60% accuracy -> offer an easier variant / scaffold and stay on the skill.
// > 85% accuracy -> unlock the harder variant / next skill.
export function difficultyHint(accuracy: number | null): DifficultyHint {
  if (accuracy === null) return 'hold';
  if (accuracy < 0.6) return 'scaffold';
  if (accuracy > 0.85) return 'advance';
  return 'hold';
}

// Count of consecutive recent wrong attempts on a skill — used to force a softer
// fallback so the child never chains 3 errors on the same notion (§6.3).
export function consecutiveWrong(attempts: Attempt[], skillId: string): number {
  let n = 0;
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (attempts[i].skillId !== skillId) continue;
    if (attempts[i].correct) break;
    n++;
  }
  return n;
}
