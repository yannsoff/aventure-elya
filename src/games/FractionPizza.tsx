import { PickAnswer, type Choice } from '@/components/PickAnswer';
import type { GameProps } from './types';

const FRACTIONS: Record<number, string> = { 2: '1/2', 3: '1/3', 4: '1/4' };

function slicePath(i: number, n: number, cx: number, cy: number, r: number): string {
  const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
  const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z`;
}

// Fraction Pizza: share a pizza into halves/thirds/quarters; name the shaded part.
export function FractionPizza({ item, onAnswer }: GameProps) {
  const denom = item.payload.denom as number;
  const answer = FRACTIONS[denom];

  const choices: Choice[] = [2, 3, 4].map((d) => ({
    id: `f-${d}`,
    correct: FRACTIONS[d] === answer,
    ariaLabel: FRACTIONS[d],
    node: <span>{FRACTIONS[d]}</span>,
  }));

  return (
    <PickAnswer
      instruction={[{ text: 'Quelle part de la pizza est coloriée ?', lang: 'fr-FR' }]}
      titleFr="La fraction coloriée"
      header={
        <svg viewBox="0 0 120 120" width={170} height={170}>
          {Array.from({ length: denom }).map((_, i) => (
            <path
              key={i}
              d={slicePath(i, denom, 60, 60, 52)}
              fill={i === 0 ? '#ff8a5c' : '#ffe9d6'}
              stroke="#e0651c"
              strokeWidth={2}
            />
          ))}
        </svg>
      }
      choices={choices}
      onAnswer={onAnswer}
      columns={3}
      tileClassName="h-24 w-24 text-4xl bg-white text-ink"
    />
  );
}
