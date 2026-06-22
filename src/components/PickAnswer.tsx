import { useMemo, useState, type ReactNode } from 'react';
import { GameShell, ChoiceTile } from './GameShell';
import { useRound } from '@/hooks/useRound';
import type { SpeechChunk } from '@/audio/speech';

export interface Choice {
  id: string;
  correct: boolean;
  node: ReactNode;
  ariaLabel?: string;
}

// Generic "pick the right answer" game body used by most mini-games.
// Shuffles choices, drives the gentle-retry/celebrate round logic, and lets the
// child keep trying until success (the first try feeds the SRS engine).
export function PickAnswer({
  instruction,
  titleFr,
  header,
  choices,
  onAnswer,
  columns = 2,
  tileClassName = 'h-28 w-28 text-4xl bg-white text-ink',
}: {
  instruction: SpeechChunk[];
  titleFr: string;
  header?: ReactNode;
  choices: Choice[];
  onAnswer: (firstTryCorrect: boolean) => void;
  columns?: number;
  tileClassName?: string;
}) {
  const { status, feedback, markWrong, markCorrect } = useRound(onAnswer);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [rightId, setRightId] = useState<string | null>(null);

  // Shuffle once per mounted set of choices.
  const shuffled = useMemo(() => {
    const a = [...choices];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choices.map((c) => c.id).join('|')]);

  const handle = (c: Choice) => {
    if (rightId) return;
    if (c.correct) {
      setRightId(c.id);
      markCorrect();
    } else {
      setWrongId(c.id);
      markWrong();
      window.setTimeout(() => setWrongId((w) => (w === c.id ? null : w)), 700);
    }
  };

  return (
    <GameShell instruction={instruction} titleFr={titleFr} status={status} feedback={feedback}>
      {header && <div className="mb-6 flex flex-col items-center">{header}</div>}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {shuffled.map((c) => (
          <ChoiceTile
            key={c.id}
            ariaLabel={c.ariaLabel}
            onClick={() => handle(c)}
            state={rightId === c.id ? 'right' : wrongId === c.id ? 'wrong' : 'idle'}
            className={tileClassName}
          >
            {c.node}
          </ChoiceTile>
        ))}
      </div>
    </GameShell>
  );
}

// Utility: pick n random distinct elements from arr.
export function sample<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}
