import { motion } from 'framer-motion';
import { PickAnswer, sample, type Choice } from '@/components/PickAnswer';
import type { GameProps } from './types';

// Blend It: letters slide together to make a word; choose the correct word.
export function BlendIt({ item, siblings, onAnswer }: GameProps) {
  const word = item.payload.word as string;
  const sounds = (item.payload.sounds as string[]) ?? word.split('');

  const distractors = sample(
    siblings.map((s) => s.payload.word as string).filter((w) => w !== word),
    2,
  );

  const choices: Choice[] = [word, ...distractors].map((w, i) => ({
    id: `${w}-${i}`,
    correct: w === word,
    ariaLabel: w,
    node: <span className="lowercase">{w}</span>,
  }));

  return (
    <PickAnswer
      instruction={[
        { text: 'Assemble les sons et touche le bon mot !', lang: 'fr-FR' },
        { text: word, lang: 'en-GB' },
      ]}
      titleFr="Quel mot est-ce ?"
      header={
        <div className="flex gap-2">
          {sounds.map((s, i) => (
            <motion.div
              key={i}
              initial={{ x: (i - sounds.length / 2) * 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.25, type: 'spring', stiffness: 200 }}
              className="grid h-16 w-14 place-items-center rounded-2xl bg-accent text-3xl font-extrabold text-white shadow-soft"
            >
              {s}
            </motion.div>
          ))}
        </div>
      }
      choices={choices}
      onAnswer={onAnswer}
      columns={3}
      tileClassName="h-24 w-28 text-3xl bg-white text-ink"
    />
  );
}
