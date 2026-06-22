import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '@/components/GameShell';
import { ChoiceTile } from '@/components/GameShell';
import { useRound } from '@/hooks/useRound';
import { sample } from '@/components/PickAnswer';
import { speak } from '@/audio/speech';
import { sfx } from '@/audio/sfx';
import type { GameProps } from './types';

interface Card {
  id: string;
  word: string;
}

// Memory Match: flip cards to find matching high-frequency word pairs.
export function MemoryMatch({ item, siblings, onAnswer }: GameProps) {
  const word = item.payload.word as string;
  const { status, feedback, markCorrect } = useRound(onAnswer);

  const cards = useMemo<Card[]>(() => {
    const others = sample(
      siblings.map((s) => s.payload.word as string).filter((w) => w !== word),
      2,
    );
    const words = [word, ...others];
    const deck: Card[] = words.flatMap((w, i) => [
      { id: `${w}-a-${i}`, word: w },
      { id: `${w}-b-${i}`, word: w },
    ]);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [lock, setLock] = useState(false);

  const flip = (card: Card) => {
    if (lock || flipped.includes(card.id) || matched.includes(card.word)) return;
    sfx.tap();
    speak(card.word, 'en-GB');
    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next.map((id) => cards.find((c) => c.id === id)!);
      if (a.word === b.word) {
        const newMatched = [...matched, a.word];
        setMatched(newMatched);
        setFlipped([]);
        sfx.correct();
        if (newMatched.length === 3) markCorrect();
      } else {
        setLock(true);
        window.setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, 800);
      }
    }
  };

  return (
    <GameShell
      instruction={[{ text: 'Retourne les cartes et trouve les paires de mots !', lang: 'fr-FR' }]}
      titleFr="Trouve les paires"
      status={status}
      feedback={feedback}
    >
      <div className="grid grid-cols-3 gap-3">
        {cards.map((c) => {
          const isUp = flipped.includes(c.id) || matched.includes(c.word);
          return (
            <ChoiceTile
              key={c.id}
              onClick={() => flip(c)}
              state={matched.includes(c.word) ? 'right' : 'idle'}
              className={`h-24 w-24 text-2xl text-ink ${isUp ? 'bg-white' : 'bg-accent'}`}
            >
              {isUp ? (
                <motion.span initial={{ rotateY: 90 }} animate={{ rotateY: 0 }}>{c.word}</motion.span>
              ) : (
                <span className="text-white/70 text-3xl">?</span>
              )}
            </ChoiceTile>
          );
        })}
      </div>
    </GameShell>
  );
}
