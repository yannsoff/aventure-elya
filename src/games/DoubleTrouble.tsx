import { PickAnswer, type Choice } from '@/components/PickAnswer';
import { nearbyNumbers } from './helpers';
import type { GameProps } from './types';

// Double Trouble: match a number to its double.
export function DoubleTrouble({ item, onAnswer }: GameProps) {
  const n = item.payload.n as number;
  const answer = n * 2;
  const choices: Choice[] = nearbyNumbers(answer, 4, 0, 30).map((v) => ({
    id: `n-${v}`,
    correct: v === answer,
    ariaLabel: String(v),
    node: <span>{v}</span>,
  }));

  return (
    <PickAnswer
      instruction={[{ text: `Quel est le double de ${n} ?`, lang: 'fr-FR' }]}
      titleFr={`Le double de ${n}`}
      header={
        <div className="flex items-center gap-3 font-display text-5xl font-extrabold text-ink">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sky text-white">{n}</span>
          <span className="text-grape">+</span>
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sky text-white">{n}</span>
          <span className="text-grape">=</span>
          <span className="grid h-14 w-14 place-items-center rounded-full bg-sun text-white">?</span>
        </div>
      }
      choices={choices}
      onAnswer={onAnswer}
      columns={4}
      tileClassName="h-24 w-20 rounded-full text-4xl bg-leaf text-white"
    />
  );
}
