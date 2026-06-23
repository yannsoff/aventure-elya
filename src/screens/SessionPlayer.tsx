import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Icon } from '@/components/Icon';
import { Buddy } from '@/components/Buddy';
import { BigButton } from '@/components/ui/Button';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { buildDailySession } from '@/engine/sessionBuilder';
import { getItemById, getSiblings } from '@/content/seed';
import { GAME_COMPONENTS, pickGameType } from '@/games';
import type { GameType } from '@/types';
import { celebrate } from '@/components/confetti';
import { speak } from '@/audio/speech';
import { sfx, haptic } from '@/audio/sfx';
import { fillPhrase, pick, SESSION_END } from '@/content/encouragements';

const STAR_CORRECT = 5;
const STAR_TRY = 2;

export function SessionPlayer() {
  const child = useGameStore((s) => s.child)!;
  const week = useGameStore((s) => s.activeWeek);
  const day = useGameStore((s) => s.activeDay);
  const level = useGameStore((s) => s.progress.level);
  const recordAttempt = useGameStore((s) => s.recordAttempt);
  const finishDay = useGameStore((s) => s.finishDay);
  const setScreen = useGameStore((s) => s.setScreen);

  // Build the adaptive session once, from a snapshot of the current state.
  const sessionId = useMemo(() => `sess-${Date.now()}`, []);
  const itemIds = useRef<string[]>([]);
  if (itemIds.current.length === 0) {
    const { masteries, attempts } = useGameStore.getState();
    itemIds.current = buildDailySession(week, masteries, attempts).itemIds.filter((id) => {
      const it = getItemById(id);
      return !!it && !!GAME_COMPONENTS[it.gameType];
    });
  }

  const [index, setIndex] = useState(0);
  const [sessionStars, setSessionStars] = useState(0);
  const [finished, setFinished] = useState(false);
  const startTime = useRef(Date.now());
  // Fix the rendered game type per item so it stays stable across re-renders.
  const gameTypes = useRef<Record<string, GameType>>({});

  useEffect(() => {
    const t = window.setTimeout(
      () => speak(`On joue, ${child.name} ! ${child.buddyName} est prêt !`, 'fr-FR'),
      300,
    );
    return () => window.clearTimeout(t);
  }, [child.name, child.buddyName]);

  const total = itemIds.current.length;
  const currentId = itemIds.current[index];
  const item = currentId ? getItemById(currentId) : undefined;

  if (item && !gameTypes.current[item.id]) {
    gameTypes.current[item.id] = pickGameType(item);
  }

  const handleAnswer = async (firstTryCorrect: boolean) => {
    if (!item) return;
    const timeMs = Date.now() - startTime.current;
    await recordAttempt(item, firstTryCorrect, timeMs, sessionId);
    setSessionStars((s) => s + (firstTryCorrect ? STAR_CORRECT : STAR_TRY));
    startTime.current = Date.now();

    if (index + 1 >= total) {
      endSession();
    } else {
      setIndex((i) => i + 1);
    }
  };

  const endSession = async () => {
    setFinished(true);
    celebrate('big');
    sfx.levelUp();
    haptic([30, 50, 30, 50]);
    speak(fillPhrase(pick(SESSION_END), { name: child.name, buddy: child.buddyName }), 'fr-FR');
    await finishDay(week, day, itemIds.current, sessionStars);
  };

  // Skip past any items that failed to resolve (defensive).
  useEffect(() => {
    if (!finished && currentId && !item) {
      if (index + 1 >= total) endSession();
      else setIndex((i) => i + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, item]);

  if (finished) {
    return <SessionComplete onContinue={() => setScreen('week')} sessionStars={sessionStars} />;
  }

  if (!item) return null;
  const GameComponent = GAME_COMPONENTS[gameTypes.current[item.id]];
  if (!GameComponent) return null;
  const siblings = getSiblings(item);

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Top bar: progress pips + quit */}
      <div className="flex items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),14px)]">
        <button
          type="button"
          aria-label="Quitter la séance"
          onClick={() => {
            sfx.tap();
            setScreen('week');
          }}
          className="grid h-11 w-11 place-items-center rounded-full bg-white/80 shadow-soft"
        >
          <Icon name="X" size={22} />
        </button>

        <div className="flex flex-1 items-center justify-center gap-1.5">
          {itemIds.current.map((_, i) => (
            <div
              key={i}
              className={`h-2.5 rounded-full transition-all ${
                i < index ? 'w-2.5 bg-leaf' : i === index ? 'w-7 bg-accent' : 'w-2.5 bg-white'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-pill bg-sun px-3 py-1.5 font-display font-extrabold text-white shadow-soft">
          <Icon name="Star" size={18} />
          <AnimatedNumber value={sessionStars} />
        </div>
      </div>

      {/* Game area */}
      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <GameComponent item={item} siblings={siblings} onAnswer={handleAnswer} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Little buddy cheering in the corner */}
      <div className="pointer-events-none absolute bottom-2 right-2 opacity-90">
        <Buddy type={child.buddyType} mood="idle" level={level} size={72} />
      </div>
    </div>
  );
}

function SessionComplete({ onContinue, sessionStars }: { onContinue: () => void; sessionStars: number }) {
  const child = useGameStore((s) => s.child)!;
  const level = useGameStore((s) => s.progress.level);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 160 }}
      >
        <Buddy type={child.buddyType} mood="cheer" level={level} size={190} />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center font-display text-4xl font-extrabold text-ink"
      >
        Bravo <span className="text-accent">{child.name}</span> !
      </motion.h1>
      <div className="flex items-center gap-2 rounded-pill bg-sun px-6 py-3 font-display text-2xl font-extrabold text-white shadow-pop">
        <Icon name="Star" size={28} />+{sessionStars + 20} étoiles
      </div>
      <BigButton onClick={onContinue} className="mt-2 px-12">
        Continuer
      </BigButton>
    </div>
  );
}
