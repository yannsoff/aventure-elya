import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from './Icon';
import { speakSequence, type SpeechChunk } from '@/audio/speech';
import type { RoundStatus } from '@/hooks/useRound';

interface GameShellProps {
  instruction: SpeechChunk[]; // spoken on mount + on replay (FR + EN mix)
  titleFr: string; // on-screen text fallback for the parent
  status: RoundStatus;
  feedback: string;
  children: ReactNode;
}

// Shared layout for all mini-games: a big replay-audio button, the play area,
// and a gentle/celebratory feedback overlay. Navigation is icon + audio only.
export function GameShell({ instruction, titleFr, status, feedback, children }: GameShellProps) {
  useEffect(() => {
    const t = window.setTimeout(() => speakSequence(instruction), 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-4">
      <div className="mb-2 flex items-center gap-3">
        <button
          type="button"
          aria-label="Réécouter la consigne"
          onClick={() => speakSequence(instruction)}
          className="flex items-center gap-2 rounded-pill bg-white px-4 py-2 font-display text-base font-bold text-ink shadow-soft active:scale-95"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-white">
            <Icon name="Volume2" size={20} />
          </span>
          <span className="max-w-[60vw] truncate text-ink/70">{titleFr}</span>
        </button>
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-center">{children}</div>

      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="pointer-events-none absolute bottom-10 z-30"
          >
            <div
              className={`flex items-center gap-2 rounded-pill px-6 py-3 font-display text-xl font-extrabold text-white shadow-pop ${
                status === 'correct' ? 'bg-leaf' : 'bg-sun'
              }`}
            >
              <Icon name={status === 'correct' ? 'Sparkles' : 'Heart'} size={24} />
              {feedback}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Shared big tappable answer choice tile.
export function ChoiceTile({
  children,
  onClick,
  state = 'idle',
  className = '',
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  state?: 'idle' | 'right' | 'wrong';
  className?: string;
  ariaLabel?: string;
}) {
  const ring =
    state === 'right'
      ? 'ring-4 ring-leaf'
      : state === 'wrong'
        ? 'ring-4 ring-sun opacity-60'
        : 'ring-0';
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      whileTap={{ scale: 0.92 }}
      animate={state === 'wrong' ? { x: [0, -8, 8, -6, 6, 0] } : {}}
      onClick={onClick}
      className={`grid place-items-center rounded-blob font-display font-extrabold shadow-soft transition ${ring} ${className}`}
    >
      {children}
    </motion.button>
  );
}
