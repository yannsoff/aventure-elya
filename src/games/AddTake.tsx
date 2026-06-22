import { PickAnswer, type Choice } from '@/components/PickAnswer';
import { nearbyNumbers } from './helpers';
import type { GameProps } from './types';

// Visual counters supporting addition / subtraction within 20.
function Dots({ n, color }: { n: number; color: string }) {
  return (
    <div className="grid max-w-[140px] grid-cols-5 gap-1">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-5 w-5 rounded-full" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

// Add & Take: addition and subtraction within 20 with visual support.
export function AddTake({ item, onAnswer }: GameProps) {
  const a = item.payload.a as number;
  const b = item.payload.b as number;
  const op = (item.payload.op as '+' | '-') ?? '+';
  const answer = op === '+' ? a + b : a - b;

  const choices: Choice[] = nearbyNumbers(answer, 4, 0, 25).map((v) => ({
    id: `n-${v}`,
    correct: v === answer,
    ariaLabel: String(v),
    node: <span>{v}</span>,
  }));

  return (
    <PickAnswer
      instruction={[{ text: `Combien font ${a} ${op === '+' ? 'plus' : 'moins'} ${b} ?`, lang: 'fr-FR' }]}
      titleFr={`${a} ${op} ${b} = ?`}
      header={
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-4 font-display text-5xl font-extrabold text-ink">
            <span>{a}</span>
            <span className="text-grape">{op}</span>
            <span>{b}</span>
            <span className="text-grape">=</span>
            <span className="grid h-14 w-14 place-items-center rounded-full bg-sun text-white">?</span>
          </div>
          <div className="flex items-center gap-4">
            <Dots n={a} color="#43c6f0" />
            <span className="font-display text-3xl text-grape">{op}</span>
            <Dots n={b} color="#ff7eb6" />
          </div>
        </div>
      }
      choices={choices}
      onAnswer={onAnswer}
      columns={4}
      tileClassName="h-20 w-20 rounded-full text-3xl bg-coral text-white"
    />
  );
}
