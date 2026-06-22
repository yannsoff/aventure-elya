import { PickAnswer, sample, type Choice } from '@/components/PickAnswer';
import type { GameProps } from './types';

function fmt(h: number, m: number): string {
  return `${h}:${m.toString().padStart(2, '0')}`;
}

// Clock Play: read the analog clock and choose the matching time.
export function ClockPlay({ item, onAnswer }: GameProps) {
  const hour = item.payload.hour as number;
  const minute = item.payload.minute as number;
  const answer = fmt(hour, minute);

  // Plausible distractor times (swap hour or minute).
  const pool = new Set<string>();
  [-1, 1, 2].forEach((dh) => pool.add(fmt(((hour + dh + 11) % 12) + 1, minute)));
  [0, 15, 30, 45].forEach((mm) => mm !== minute && pool.add(fmt(hour, mm)));
  pool.delete(answer);
  const distractors = sample(Array.from(pool), 2);

  const choices: Choice[] = [answer, ...distractors].map((t, i) => ({
    id: `t-${i}`,
    correct: t === answer,
    ariaLabel: t,
    node: <span>{t}</span>,
  }));

  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minAngle = minute * 6;

  return (
    <PickAnswer
      instruction={[{ text: "Quelle heure est-il sur l'horloge ?", lang: 'fr-FR' }]}
      titleFr="Lis l'heure"
      header={
        <svg viewBox="0 0 120 120" width={180} height={180}>
          <circle cx="60" cy="60" r="54" fill="#fff" stroke="#7c5cff" strokeWidth={5} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
            return (
              <circle key={i} cx={60 + 44 * Math.cos(a)} cy={60 + 44 * Math.sin(a)} r={2.5} fill="#7c5cff" />
            );
          })}
          <line
            x1="60" y1="60"
            x2={60 + 26 * Math.cos((hourAngle - 90) * (Math.PI / 180))}
            y2={60 + 26 * Math.sin((hourAngle - 90) * (Math.PI / 180))}
            stroke="#3b2a55" strokeWidth={6} strokeLinecap="round"
          />
          <line
            x1="60" y1="60"
            x2={60 + 40 * Math.cos((minAngle - 90) * (Math.PI / 180))}
            y2={60 + 40 * Math.sin((minAngle - 90) * (Math.PI / 180))}
            stroke="#ff7eb6" strokeWidth={4} strokeLinecap="round"
          />
          <circle cx="60" cy="60" r="4" fill="#3b2a55" />
        </svg>
      }
      choices={choices}
      onAnswer={onAnswer}
      columns={3}
      tileClassName="h-20 w-24 text-3xl bg-white text-ink"
    />
  );
}
