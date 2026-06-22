import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '@/components/GameShell';
import { useRound } from '@/hooks/useRound';
import { sfx } from '@/audio/sfx';
import { speak } from '@/audio/speech';
import { sample } from '@/components/PickAnswer';
import type { GameProps } from './types';

// Build a Sentence: drag/tap word tiles into order, then add the capital + end mark.
// Reinforces finger spaces, capital letters and full stops / question marks.
export function BuildSentence({ item, onAnswer }: GameProps) {
  const words = item.payload.words as string[];
  const needsQuestion = item.payload.needsQuestion === true;
  const endMark = needsQuestion ? '?' : '.';
  const { status, feedback, markWrong, markCorrect } = useRound(onAnswer);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tray = useMemo(() => sample(words, words.length), [item.id]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [hasCapital, setHasCapital] = useState(false);
  const [hasPunct, setHasPunct] = useState(false);

  const ordered = placed.length === words.length;
  const solved = status === 'correct';

  const tapTray = (w: string, trayIndex: number) => {
    if (ordered || solved || usedIndices.includes(trayIndex)) return;
    if (w === words[placed.length]) {
      sfx.tap();
      speak(w, 'en-GB');
      setPlaced((p) => [...p, w]);
      setUsedIndices((u) => [...u, trayIndex]);
    } else {
      markWrong();
    }
  };

  const tryFinish = (cap: boolean, punct: boolean) => {
    if (cap && punct) markCorrect();
  };

  const renderSentence = () => {
    if (placed.length === 0) return <span className="text-ink/30">…</span>;
    return placed.map((w, i) => {
      const display = i === 0 && hasCapital ? w.charAt(0).toUpperCase() + w.slice(1) : w;
      return (
        <span key={i} className="flex items-center">
          <span className="rounded-xl bg-accent px-3 py-1 text-white">{display}</span>
          {i < placed.length - 1 && <span className="mx-1 h-2 w-2 rounded-full bg-ink/20" />}
        </span>
      );
    });
  };

  return (
    <GameShell
      instruction={[
        { text: 'Range les mots dans le bon ordre, puis ajoute la majuscule et le point !', lang: 'fr-FR' },
        { text: words.join(' '), lang: 'en-GB' },
      ]}
      titleFr="Construis la phrase"
      status={status}
      feedback={feedback}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Sentence line */}
        <div className="flex min-h-[56px] flex-wrap items-center justify-center gap-1 rounded-blob bg-white/70 px-5 py-3 text-2xl font-extrabold shadow-soft">
          {renderSentence()}
          {ordered && hasPunct && <span className="ml-1 text-2xl text-accent">{endMark}</span>}
        </div>

        {/* Word tray */}
        {!ordered && (
          <div className="flex flex-wrap justify-center gap-3">
            {tray.map((w, i) =>
              usedIndices.includes(i) ? (
                <div key={i} className="h-12 w-20 rounded-2xl bg-white/30" />
              ) : (
                <motion.button
                  key={i}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => tapTray(w, i)}
                  className="rounded-2xl bg-white px-4 py-2 font-display text-2xl font-extrabold text-ink shadow-soft"
                >
                  {w}
                </motion.button>
              ),
            )}
          </div>
        )}

        {/* Punctuation step */}
        {ordered && !solved && (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                if (hasCapital) return;
                sfx.tap();
                setHasCapital(true);
                tryFinish(true, hasPunct);
              }}
              className={`btn-3d px-6 py-4 text-2xl text-white ${hasCapital ? 'bg-leaf' : 'bg-grape'}`}
            >
              Aa
            </button>
            <button
              type="button"
              onClick={() => {
                if (hasPunct) return;
                sfx.tap();
                setHasPunct(true);
                tryFinish(hasCapital, true);
              }}
              className={`btn-3d px-7 py-4 text-3xl text-white ${hasPunct ? 'bg-leaf' : 'bg-sun'}`}
            >
              {endMark}
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
