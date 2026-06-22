import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Buddy } from '@/components/Buddy';
import { BigButton } from '@/components/ui/Button';
import { speak } from '@/audio/speech';
import { sfx } from '@/audio/sfx';
import type { BuddyType, Child } from '@/types';

const BUDDIES: { type: BuddyType; label: string }[] = [
  { type: 'fox', label: 'Renard' },
  { type: 'owl', label: 'Chouette' },
  { type: 'cat', label: 'Chat' },
  { type: 'bunny', label: 'Lapin' },
  { type: 'unicorn', label: 'Licorne' },
  { type: 'dolphin', label: 'Dauphin' },
];

const COLORS = ['#7c5cff', '#ff7eb6', '#36d39a', '#43c6f0', '#ff8a5c', '#ffc83d'];

const STEP_PROMPTS = [
  'Bienvenue dans ton aventure ! Comment t\'appelles-tu ?',
  'Choisis ton compagnon, puis donne-lui un joli nom !',
  'Et maintenant, choisis ta couleur préférée !',
];

export function Onboarding() {
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Elya');
  const [buddyType, setBuddyType] = useState<BuddyType>('fox');
  const [buddyName, setBuddyName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    const t = window.setTimeout(() => speak(STEP_PROMPTS[step], 'fr-FR'), 350);
    return () => window.clearTimeout(t);
  }, [step]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', color);
  }, [color]);

  const next = () => {
    sfx.tap();
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      const child: Child = {
        id: 'child-1',
        name: name.trim() || 'Elya',
        buddyType,
        buddyName: buddyName.trim() || BUDDIES.find((b) => b.type === buddyType)!.label,
        accentColor: color,
        createdAt: new Date().toISOString(),
      };
      completeOnboarding(child);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          className="flex w-full max-w-md flex-col items-center gap-6"
        >
          {step === 0 && (
            <>
              <Buddy type={buddyType} mood="cheer" size={150} />
              <h2 className="font-display text-3xl font-extrabold">Quel est ton prénom ?</h2>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-pill bg-white px-6 py-4 text-center font-display text-2xl font-bold text-ink shadow-soft outline-none ring-accent focus:ring-4"
                maxLength={14}
              />
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-display text-3xl font-extrabold">Choisis ton compagnon</h2>
              <div className="grid grid-cols-3 gap-3">
                {BUDDIES.map((b) => (
                  <motion.button
                    key={b.type}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      sfx.tap();
                      setBuddyType(b.type);
                      speak(b.label, 'fr-FR');
                    }}
                    className={`flex flex-col items-center rounded-blob bg-white p-2 shadow-soft transition ${
                      buddyType === b.type ? 'ring-4 ring-accent' : ''
                    }`}
                  >
                    <Buddy type={b.type} mood="idle" size={72} />
                    <span className="font-display text-sm font-bold">{b.label}</span>
                  </motion.button>
                ))}
              </div>
              <input
                value={buddyName}
                onChange={(e) => setBuddyName(e.target.value)}
                placeholder="Donne-lui un nom…"
                className="w-full rounded-pill bg-white px-6 py-3 text-center font-display text-xl font-bold text-ink shadow-soft outline-none ring-accent focus:ring-4"
                maxLength={14}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Buddy type={buddyType} mood="happy" size={140} />
              <h2 className="font-display text-3xl font-extrabold">Ta couleur préférée</h2>
              <div className="grid grid-cols-3 gap-4">
                {COLORS.map((c) => (
                  <motion.button
                    key={c}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => {
                      sfx.tap();
                      setColor(c);
                    }}
                    className={`h-16 w-16 rounded-full shadow-soft transition ${
                      color === c ? 'ring-4 ring-ink/40 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </>
          )}

          <BigButton onClick={next} className="mt-2 px-12">
            {step < 2 ? 'Suivant' : "C'est parti !"}
          </BigButton>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
