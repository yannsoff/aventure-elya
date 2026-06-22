import { PickAnswer, sample, type Choice } from '@/components/PickAnswer';
import type { GameProps } from './types';

// Sound Pop: a word is said (en-GB); pop the bubble with its first grapheme.
export function SoundPop({ item, siblings, onAnswer }: GameProps) {
  const grapheme = item.payload.grapheme as string;
  const example = item.payload.example as string;

  const distractors = sample(
    siblings.map((s) => s.payload.grapheme as string).filter((g) => g !== grapheme),
    3,
  );

  const choices: Choice[] = [grapheme, ...distractors].map((g, i) => ({
    id: `${g}-${i}`,
    correct: g === grapheme,
    ariaLabel: g,
    node: <span>{g}</span>,
  }));

  return (
    <PickAnswer
      instruction={[
        { text: 'Écoute le mot, puis éclate sa première lettre !', lang: 'fr-FR' },
        { text: example, lang: 'en-GB' },
      ]}
      titleFr={`Le son du mot « ${example} »`}
      choices={choices}
      onAnswer={onAnswer}
      columns={4}
      tileClassName="h-24 w-24 rounded-full text-4xl bg-white text-ink"
    />
  );
}
