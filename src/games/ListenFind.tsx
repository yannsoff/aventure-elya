import { PickAnswer, sample, type Choice } from '@/components/PickAnswer';
import { Icon } from '@/components/Icon';
import type { GameProps } from './types';

// Listen & Find: a word is said (en-GB); touch the matching picture.
export function ListenFind({ item, siblings, onAnswer }: GameProps) {
  const word = item.payload.word as string;
  const icon = item.payload.icon as string;

  const distractors = sample(
    siblings.filter((s) => s.payload.word !== word),
    3,
  );

  const choices: Choice[] = [
    { id: 'target', correct: true, ariaLabel: word, node: <Icon name={icon} size={56} /> },
    ...distractors.map((d, i) => ({
      id: `d-${i}`,
      correct: false,
      ariaLabel: d.payload.word as string,
      node: <Icon name={d.payload.icon as string} size={56} />,
    })),
  ];

  return (
    <PickAnswer
      instruction={[
        { text: 'Écoute et trouve la bonne image !', lang: 'fr-FR' },
        { text: word, lang: 'en-GB' },
      ]}
      titleFr={`Trouve : « ${word} »`}
      choices={choices}
      onAnswer={onAnswer}
      columns={2}
      tileClassName="h-28 w-28 text-accent bg-white"
    />
  );
}
