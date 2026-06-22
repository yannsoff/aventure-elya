import { PickAnswer, sample, type Choice } from '@/components/PickAnswer';
import type { GameProps } from './types';

// Flash & Flip: the flashcard word stays visible while the child finds its twin.
export function FlashFlip({ item, siblings, onAnswer }: GameProps) {
  const word = item.payload.word as string;
  const distractors = sample(
    siblings.map((s) => s.payload.word as string).filter((w) => w !== word),
    3,
  );
  const choices: Choice[] = [word, ...distractors].map((w, i) => ({
    id: `${w}-${i}`,
    correct: w === word,
    ariaLabel: w,
    node: <span>{w}</span>,
  }));

  return (
    <PickAnswer
      instruction={[
        { text: 'Voici la carte. Touche le même mot en dessous !', lang: 'fr-FR' },
        { text: word, lang: 'en-GB' },
      ]}
      titleFr={`La carte dit « ${word} »`}
      header={
        <div className="grid h-24 w-56 place-items-center rounded-blob bg-white shadow-soft ring-4 ring-accent">
          <span className="text-5xl font-extrabold text-accent">{word}</span>
        </div>
      }
      choices={choices}
      onAnswer={onAnswer}
      columns={2}
      tileClassName="h-20 w-36 text-3xl bg-white text-ink"
    />
  );
}
