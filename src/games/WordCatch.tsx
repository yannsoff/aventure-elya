import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PickAnswer, sample, type Choice } from '@/components/PickAnswer';
import type { GameProps } from './types';

// A word flashes briefly while spoken, then hides — the child finds it again.
function FlashWord({ word }: { word: string }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setShow(false), 1900);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="grid h-24 w-56 place-items-center rounded-blob bg-accent shadow-soft">
      <AnimatePresence mode="wait">
        {show ? (
          <motion.span
            key="w"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            className="text-5xl font-extrabold text-white"
          >
            {word}
          </motion.span>
        ) : (
          <motion.span key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl font-extrabold text-white/80">
            ?
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// Word Catch: recognise a high-frequency word among 3-4 options.
export function WordCatch({ item, siblings, onAnswer }: GameProps) {
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
        { text: 'Regarde bien le mot, puis retrouve-le !', lang: 'fr-FR' },
        { text: word, lang: 'en-GB' },
      ]}
      titleFr={`Retrouve le mot « ${word} »`}
      header={<FlashWord word={word} />}
      choices={choices}
      onAnswer={onAnswer}
      columns={2}
      tileClassName="h-20 w-36 text-3xl bg-white text-ink"
    />
  );
}
