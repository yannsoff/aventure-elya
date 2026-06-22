import { motion } from 'framer-motion';
import { PickAnswer, type Choice } from '@/components/PickAnswer';
import type { GameProps } from './types';

// Ten-frame style dots to make the bond visual.
function TenFrame({ filled, total }: { filled: number; total: number }) {
  const cols = total <= 10 ? 5 : 10;
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-7 w-7 rounded-full ${i < filled ? 'bg-bubble' : 'border-2 border-bubble/40'}`}
        />
      ))}
    </div>
  );
}

// Number Bonds Balloons: pop the number that completes the bond to make `total`.
export function NumberBonds({ item, onAnswer }: GameProps) {
  const total = item.payload.total as number;
  const part = item.payload.part as number;
  const answer = total - part;

  // Distractor numbers near the answer, within [0, total].
  const candidates = new Set<number>([answer]);
  let delta = 1;
  while (candidates.size < 4) {
    const a = answer - delta;
    const b = answer + delta;
    if (a >= 0 && a <= total) candidates.add(a);
    if (b >= 0 && b <= total && candidates.size < 4) candidates.add(b);
    delta++;
    if (delta > total + 2) break;
  }

  const choices: Choice[] = Array.from(candidates).map((n) => ({
    id: `n-${n}`,
    correct: n === answer,
    ariaLabel: String(n),
    node: <span>{n}</span>,
  }));

  return (
    <PickAnswer
      instruction={[
        { text: `Quel nombre va avec ${part} pour faire ${total} ? Éclate le bon ballon !`, lang: 'fr-FR' },
      ]}
      titleFr={`${part} + ? = ${total}`}
      header={
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 font-display text-5xl font-extrabold text-ink">
            <span>{part}</span>
            <span className="text-grape">+</span>
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="grid h-14 w-14 place-items-center rounded-full bg-sun text-white"
            >
              ?
            </motion.span>
            <span className="text-grape">=</span>
            <span>{total}</span>
          </div>
          <TenFrame filled={part} total={total} />
        </div>
      }
      choices={choices}
      onAnswer={onAnswer}
      columns={4}
      tileClassName="h-24 w-20 rounded-full text-4xl bg-bubble text-white"
    />
  );
}
