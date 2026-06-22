import { PickAnswer, type Choice } from '@/components/PickAnswer';
import { nearbyNumbers } from './helpers';
import type { GameProps } from './types';

// Hop Count: hop along the stones counting in 2s / 5s / 10s — find the next stone.
export function HopCount({ item, onAnswer }: GameProps) {
  const step = item.payload.step as number;
  const start = (item.payload.start as number) ?? 0;
  const shown = 4;
  const stones = Array.from({ length: shown }, (_, i) => start + i * step);
  const answer = start + shown * step;

  const choices: Choice[] = nearbyNumbers(answer, 3, 0, answer + step * 2)
    .filter((v) => v >= 0)
    .map((v) => ({ id: `n-${v}`, correct: v === answer, ariaLabel: String(v), node: <span>{v}</span> }));

  return (
    <PickAnswer
      instruction={[{ text: `Compte de ${step} en ${step}. Sur quelle pierre faut-il sauter ?`, lang: 'fr-FR' }]}
      titleFr={`Compter en ${step}`}
      header={
        <div className="flex items-end gap-2">
          {stones.map((s, i) => (
            <div
              key={i}
              className="grid h-16 w-16 place-items-center rounded-full bg-leaf font-display text-2xl font-extrabold text-white shadow-soft"
              style={{ transform: `translateY(${i % 2 === 0 ? 0 : -10}px)` }}
            >
              {s}
            </div>
          ))}
          <div className="grid h-16 w-16 place-items-center rounded-full bg-sun font-display text-2xl font-extrabold text-white shadow-soft">
            ?
          </div>
        </div>
      }
      choices={choices}
      onAnswer={onAnswer}
      columns={3}
      tileClassName="h-24 w-24 rounded-full text-4xl bg-white text-ink"
    />
  );
}
