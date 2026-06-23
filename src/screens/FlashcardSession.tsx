import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Icon } from '@/components/Icon';
import { Buddy } from '@/components/Buddy';
import { BigButton } from '@/components/ui/Button';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { buildDeck } from '@/engine/deckBuilder';
import { getCardById, type Flashcard } from '@/content/flashcards';
import { speak } from '@/audio/speech';
import { sfx, haptic } from '@/audio/sfx';
import { celebrate } from '@/components/confetti';

const STAR_CORRECT = 5;
const STAR_REVIEW = 2;

// A single draggable flashcard. Drag right = "su", left = "à revoir";
// buttons do the same. Tap "Réponse" to reveal the answer/pronunciation.
const cardVariants = {
  enter: { scale: 0.85, opacity: 0, y: 30 },
  center: { scale: 1, opacity: 1, y: 0 },
  exit: (d: number) => ({ x: (d || 1) * 560, opacity: 0, rotate: (d || 1) * 18, transition: { duration: 0.28 } }),
};

function SwipeCard({
  card,
  onResult,
}: {
  card: Flashcard;
  onResult: (correct: boolean) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-14, 14]);
  const okOpacity = useTransform(x, [20, 130], [0, 1]);
  const reviewOpacity = useTransform(x, [-130, -20], [1, 0]);
  const [revealed, setRevealed] = useState(false);

  const isSentence = card.front.length > 16;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      <motion.div
        drag="x"
        dragSnapToOrigin
        style={{ x, rotate }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 120) onResult(true);
          else if (info.offset.x < -120) onResult(false);
        }}
        whileTap={{ cursor: 'grabbing' }}
        className="relative flex h-[58vh] max-h-[460px] w-[86vw] max-w-[440px] cursor-grab touch-none flex-col items-center justify-center rounded-blob bg-white p-6 shadow-pop"
      >
        {/* Drag hints */}
        <motion.div style={{ opacity: okOpacity }} className="absolute left-4 top-4 rounded-pill bg-leaf px-4 py-2 font-display text-xl font-extrabold text-white">
          SU !
        </motion.div>
        <motion.div style={{ opacity: reviewOpacity }} className="absolute right-4 top-4 rounded-pill bg-coral px-4 py-2 font-display text-xl font-extrabold text-white">
          À revoir
        </motion.div>

        <span className={`px-2 text-center font-display font-extrabold leading-tight text-ink ${isSentence ? 'text-3xl' : 'text-6xl'}`}>
          {card.front}
        </span>

        {revealed && card.back !== card.front && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-pill bg-accent/10 px-5 py-2 text-center font-display text-2xl font-bold text-accent"
          >
            {card.back}
          </motion.span>
        )}

        <div className="absolute bottom-5 flex gap-3">
          <button
            type="button"
            aria-label="Écouter"
            onClick={(e) => {
              e.stopPropagation();
              sfx.tap();
              speak(card.speak ?? card.front, 'en-GB');
            }}
            className="flex items-center gap-2 rounded-pill bg-sky px-4 py-2 font-display font-bold text-white shadow-soft"
          >
            <Icon name="Volume2" size={20} /> Écouter
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sfx.tap();
              setRevealed(true);
            }}
            className="flex items-center gap-2 rounded-pill bg-ink/10 px-4 py-2 font-display font-bold text-ink/70 shadow-soft"
          >
            <Icon name="Sparkles" size={18} /> Réponse
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FlashcardSession() {
  const child = useGameStore((s) => s.child)!;
  const deckMode = useGameStore((s) => s.deckMode);
  const level = useGameStore((s) => s.progress.level);
  const recordCard = useGameStore((s) => s.recordCard);
  const finishFlashcards = useGameStore((s) => s.finishFlashcards);
  const setScreen = useGameStore((s) => s.setScreen);
  const week = useGameStore((s) => s.currentWeekIndex)();

  const ids = useRef<string[]>([]);
  if (ids.current.length === 0) {
    ids.current = buildDeck(deckMode, week, useGameStore.getState().masteries);
  }

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [points, setPoints] = useState(0);
  const [known, setKnown] = useState(0);
  const [review, setReview] = useState(0);
  const [finished, setFinished] = useState(false);

  const title = deckMode === 'reading' ? 'Lecture · WordSwipe' : 'Maths · NumSwipe';

  useEffect(() => {
    const t = window.setTimeout(
      () =>
        speak(
          deckMode === 'reading'
            ? `On lit les cartes ensemble, ${child.name} ! Swipe à droite si c'est juste.`
            : `On compte ensemble, ${child.name} ! Swipe à droite si c'est juste.`,
          'fr-FR',
        ),
      300,
    );
    return () => window.clearTimeout(t);
  }, [deckMode, child.name]);

  const total = ids.current.length;
  const card = useMemo(() => (ids.current[index] ? getCardById(ids.current[index]) : undefined), [index]);

  const handleResult = (correct: boolean) => {
    if (!card) return;
    setDir(correct ? 1 : -1);
    recordCard(card.id, card.category, correct);
    if (correct) {
      sfx.correct();
      haptic(20);
      setKnown((k) => k + 1);
      setPoints((p) => p + STAR_CORRECT);
    } else {
      sfx.soft();
      haptic(15);
      setReview((r) => r + 1);
      setPoints((p) => p + STAR_REVIEW);
    }
    if (index + 1 >= total) {
      window.setTimeout(async () => {
        celebrate('big');
        sfx.levelUp();
        await finishFlashcards();
        setFinished(true);
        speak(`Bravo ${child.name} ! ${known + (correct ? 1 : 0)} cartes réussies !`, 'fr-FR');
      }, 280);
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (finished) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <Buddy type={child.buddyType} mood="cheer" level={level} size={170} />
        </motion.div>
        <h1 className="text-center font-display text-4xl font-extrabold text-ink">
          Bravo <span className="text-accent">{child.name}</span> !
        </h1>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 rounded-pill bg-leaf px-5 py-3 font-display text-xl font-extrabold text-white shadow-soft">
            <Icon name="Check" size={22} /> {known} su{known > 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2 rounded-pill bg-coral px-5 py-3 font-display text-xl font-extrabold text-white shadow-soft">
            <Icon name="Heart" size={20} /> {review} à revoir
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-pill bg-sun px-6 py-3 font-display text-2xl font-extrabold text-white shadow-pop">
          <Icon name="Star" size={26} /> +{points} étoiles
        </div>
        <BigButton onClick={() => setScreen('hub')} className="mt-2 px-12">
          Continuer
        </BigButton>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),14px)]">
        <button
          type="button"
          aria-label="Quitter"
          onClick={() => {
            sfx.tap();
            finishFlashcards();
            setScreen('hub');
          }}
          className="grid h-11 w-11 place-items-center rounded-full bg-white/80 shadow-soft"
        >
          <Icon name="X" size={22} />
        </button>
        <div className="font-display text-lg font-extrabold text-ink/70">{title}</div>
        <div className="flex items-center gap-1 rounded-pill bg-sun px-3 py-1.5 font-display font-extrabold text-white shadow-soft">
          <Icon name="Star" size={18} />
          <AnimatedNumber value={points} />
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 pt-2 text-center font-display font-bold text-ink/50">
        Carte {index + 1} / {total}
      </div>

      {/* Card stack */}
      <div className="relative flex-1">
        <AnimatePresence custom={dir} initial={false}>
          <SwipeCard key={card.id} card={card} onResult={handleResult} />
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-8 pb-[max(env(safe-area-inset-bottom),20px)] pt-2">
        <motion.button
          whileTap={{ scale: 0.88 }}
          aria-label="À revoir"
          onClick={() => handleResult(false)}
          className="grid h-20 w-20 place-items-center rounded-full bg-coral text-white shadow-pop"
        >
          <Icon name="X" size={36} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          aria-label="Su"
          onClick={() => handleResult(true)}
          className="grid h-20 w-20 place-items-center rounded-full bg-leaf text-white shadow-pop"
        >
          <Icon name="Check" size={36} />
        </motion.button>
      </div>
    </div>
  );
}
