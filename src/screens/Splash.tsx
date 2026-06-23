import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Buddy } from '@/components/Buddy';
import { BigButton } from '@/components/ui/Button';
import { Icon } from '@/components/Icon';
import { speak } from '@/audio/speech';

// Splash / home: greets the child by name out loud with the waving companion.
export function Splash() {
  const child = useGameStore((s) => s.child);
  const setScreen = useGameStore((s) => s.setScreen);
  const level = useGameStore((s) => s.progress.level);

  useEffect(() => {
    if (child) {
      const t = window.setTimeout(
        () => speak(`Bonjour ${child.name} ! ${child.buddyName} est prêt à jouer !`, 'fr-FR'),
        400,
      );
      return () => window.clearTimeout(t);
    }
  }, [child]);

  if (!child) return null;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 160, delay: 0.1 }}
      >
        <Buddy type={child.buddyType} mood="cheer" level={level} size={200} />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center font-display text-5xl font-extrabold text-ink"
      >
        Bonjour <span className="text-accent">{child.name}</span> !
      </motion.h1>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <BigButton onClick={() => setScreen('hub')} className="flex items-center gap-3 px-12 py-6 text-3xl">
          <Icon name="Play" size={32} className="fill-white" />
          On joue !
        </BigButton>
      </motion.div>
    </div>
  );
}
