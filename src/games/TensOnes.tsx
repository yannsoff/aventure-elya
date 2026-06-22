import { useState } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '@/components/GameShell';
import { useRound } from '@/hooks/useRound';
import { sfx } from '@/audio/sfx';
import type { GameProps } from './types';

// Tens & Ones: build a 2-digit number with base-ten blocks (place value).
export function TensOnes({ item, onAnswer }: GameProps) {
  const target = item.payload.number as number;
  const { status, feedback, markWrong, markCorrect } = useRound(onAnswer);
  const [tens, setTens] = useState(0);
  const [ones, setOnes] = useState(0);
  const sum = tens * 10 + ones;
  const solved = status === 'correct';

  const add = (t: number, o: number) => {
    if (solved) return;
    const next = (tens + t) * 10 + (ones + o);
    if (next > target) {
      markWrong();
      return;
    }
    sfx.tap();
    setTens((v) => v + t);
    setOnes((v) => v + o);
    if (next === target) markCorrect();
  };

  return (
    <GameShell
      instruction={[{ text: `Construis le nombre ${target} avec les dizaines et les unités !`, lang: 'fr-FR' }]}
      titleFr={`Construis ${target}`}
      status={status}
      feedback={feedback}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="font-display text-6xl font-extrabold text-ink">{sum}</div>

        <div className="flex min-h-[120px] items-end gap-4 rounded-blob bg-white/60 p-4 shadow-soft">
          <div className="flex items-end gap-1">
            {Array.from({ length: tens }).map((_, i) => (
              <motion.div key={i} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="h-24 w-6 rounded bg-grape" />
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: ones }).map((_, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="h-5 w-5 rounded bg-sun" />
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => add(1, 0)}
            className="btn-3d bg-grape px-7 py-4 text-2xl text-white"
          >
            + 10
          </button>
          <button
            type="button"
            onClick={() => add(0, 1)}
            className="btn-3d bg-sun px-7 py-4 text-2xl text-white"
          >
            + 1
          </button>
          <button
            type="button"
            onClick={() => {
              if (solved) return;
              sfx.tap();
              setTens(0);
              setOnes(0);
            }}
            className="btn-3d bg-ink/30 px-5 py-4 text-xl text-white"
          >
            ↺
          </button>
        </div>
      </div>
    </GameShell>
  );
}
