import { useCallback, useRef, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { speak } from '@/audio/speech';
import { sfx, haptic } from '@/audio/sfx';
import { celebrate } from '@/components/confetti';
import { GENTLE_RETRY, PRAISE, fillPhrase, pick } from '@/content/encouragements';

export type RoundStatus = 'idle' | 'wrong' | 'correct';

// Shared round logic for every mini-game.
// Confidence-first: a wrong answer is never punished — it shows a gentle prompt,
// lets the child retry, and the child always ends on a success. The *first-try*
// correctness is what feeds the spaced-repetition engine.
export function useRound(onAnswer: (firstTryCorrect: boolean) => void) {
  const child = useGameStore((s) => s.child);
  const [status, setStatus] = useState<RoundStatus>('idle');
  const [feedback, setFeedback] = useState('');
  const firstTry = useRef(true);
  const done = useRef(false);

  const name = child?.name ?? 'Elya';
  const buddy = child?.buddyName ?? 'ton ami';

  const markWrong = useCallback(() => {
    if (done.current) return;
    firstTry.current = false;
    sfx.soft();
    haptic(15);
    const phrase = fillPhrase(pick(GENTLE_RETRY), { name, buddy });
    setFeedback(phrase);
    setStatus('wrong');
    speak(phrase, 'fr-FR');
    // Auto-clear the gentle prompt so the child can try again.
    window.setTimeout(() => setStatus((s) => (s === 'wrong' ? 'idle' : s)), 1400);
  }, [name, buddy]);

  const markCorrect = useCallback(() => {
    if (done.current) return;
    done.current = true;
    sfx.correct();
    sfx.star();
    haptic([20, 40, 20]);
    celebrate('small');
    const phrase = fillPhrase(pick(PRAISE), { name, buddy });
    setFeedback(phrase);
    setStatus('correct');
    speak(phrase, 'fr-FR');
    const wasFirstTry = firstTry.current;
    window.setTimeout(() => onAnswer(wasFirstTry), 1300);
  }, [name, buddy, onAnswer]);

  return { status, feedback, markWrong, markCorrect, isFirstTry: () => firstTry.current };
}
