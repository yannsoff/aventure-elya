import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Buddy } from '@/components/Buddy';
import { BigButton } from '@/components/ui/Button';
import { Icon } from '@/components/Icon';
import { WEEK_META } from '@/content/weeksMeta';
import { celebrate } from '@/components/confetti';
import { speak } from '@/audio/speech';
import { sfx, haptic } from '@/audio/sfx';

export function ChestReward() {
  const child = useGameStore((s) => s.child)!;
  const level = useGameStore((s) => s.progress.level);
  const week = useGameStore((s) => s.activeWeek);
  const rewards = useGameStore((s) => s.rewards);
  const openChest = useGameStore((s) => s.openChest);
  const setScreen = useGameStore((s) => s.setScreen);

  const reward = rewards.find((r) => r.weekIndex === week);
  const meta = WEEK_META[week];
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setOpened(true);
      celebrate('big');
      sfx.chest();
      haptic([40, 60, 40, 60, 80]);
      speak(`Bravo ${child.name}, tu as réussi ta semaine ! Tu as gagné une récompense !`, 'fr-FR');
    }, 700);
    return () => window.clearTimeout(t);
  }, [child.name]);

  const handleContinue = async () => {
    await openChest(week);
    setScreen('map');
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
        <Buddy type={child.buddyType} mood="cheer" level={level} size={150} />
      </motion.div>

      <h1 className="text-center font-display text-3xl font-extrabold text-ink">
        Semaine réussie, <span className="text-accent">{child.name}</span> !
      </h1>

      {/* Chest */}
      <div className="relative h-40 w-48">
        <motion.div
          className="absolute bottom-0 grid h-28 w-48 place-items-center rounded-b-3xl rounded-t-lg shadow-pop"
          style={{ background: '#b06a32' }}
        >
          <div className="h-3 w-44 rounded bg-sun" />
        </motion.div>
        {/* Lid */}
        <motion.div
          className="absolute left-0 top-0 h-16 w-48 origin-bottom rounded-t-3xl shadow-soft"
          style={{ background: '#8a5022', transformOrigin: 'bottom center' }}
          animate={opened ? { rotateX: -120, y: -6 } : { rotateX: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 12 }}
        />
        {/* Reward bursting out */}
        {opened && (
          <motion.div
            initial={{ scale: 0, y: 0, opacity: 0 }}
            animate={{ scale: 1, y: -70, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="absolute left-1/2 top-6 -translate-x-1/2"
          >
            <div className="grid h-24 w-24 place-items-center rounded-blob bg-white shadow-pop">
              <Icon name={reward?.icon ?? 'Sparkles'} size={52} className="text-accent" />
            </div>
          </motion.div>
        )}
      </div>

      {opened && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-display text-lg font-bold text-ink/60">Ta récompense :</p>
          <p className="font-display text-3xl font-extrabold" style={{ color: meta.color }}>
            {reward?.label ?? 'Une belle surprise !'}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-pill bg-white px-5 py-2 font-display font-extrabold text-ink shadow-soft">
            <Icon name="Flag" size={20} className="text-leaf" />
            {meta.name} terminée !
          </div>
        </motion.div>
      )}

      {opened && (
        <BigButton onClick={handleContinue} className="mt-2 px-12">
          Continuer l'aventure
        </BigButton>
      )}
    </div>
  );
}
