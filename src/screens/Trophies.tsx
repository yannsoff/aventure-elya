import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Buddy } from '@/components/Buddy';
import { Icon } from '@/components/Icon';
import { BADGES, starsIntoLevel } from '@/engine/progression';
import { sfx } from '@/audio/sfx';

export function Trophies() {
  const child = useGameStore((s) => s.child)!;
  const progress = useGameStore((s) => s.progress);
  const setScreen = useGameStore((s) => s.setScreen);
  const earned = new Set(progress.badges);
  const { current, needed } = starsIntoLevel(progress.totalStars);

  return (
    <div className="relative h-full w-full">
      <button
        type="button"
        aria-label="Retour"
        onClick={() => {
          sfx.tap();
          setScreen('map');
        }}
        className="absolute left-4 top-[max(env(safe-area-inset-top),16px)] z-20 grid h-12 w-12 place-items-center rounded-full bg-white/80 shadow-soft"
      >
        <Icon name="ArrowLeft" size={24} />
      </button>

      <div className="scroll-y h-full px-6 pb-10 pt-20">
        {/* Buddy + level */}
        <div className="flex flex-col items-center">
          <Buddy type={child.buddyType} mood="happy" level={progress.level} size={150} />
          <h1 className="mt-2 font-display text-3xl font-extrabold">{child.buddyName}</h1>
          <div className="mt-1 flex items-center gap-2 font-display font-extrabold text-grape">
            <Icon name="Crown" size={20} /> Niveau {progress.level}
          </div>
          <div className="mt-3 h-4 w-64 overflow-hidden rounded-pill bg-white shadow-soft">
            <motion.div
              className="h-full rounded-pill bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${(current / needed) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-sm font-bold text-ink/50">
            {current} / {needed} étoiles avant le prochain niveau
          </p>
        </div>

        {/* Badges */}
        <h2 className="mb-3 mt-8 font-display text-2xl font-extrabold text-ink">Mes badges</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.values(BADGES).map((b) => {
            const has = earned.has(b.id);
            return (
              <motion.div
                key={b.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => sfx.tap()}
                className={`flex flex-col items-center gap-2 rounded-blob p-3 shadow-soft ${
                  has ? 'bg-white' : 'bg-white/40'
                }`}
              >
                <div
                  className={`grid h-16 w-16 place-items-center rounded-full ${
                    has ? 'bg-sun text-white' : 'bg-ink/10 text-ink/30'
                  }`}
                >
                  <Icon name={has ? b.icon : 'Lock'} size={28} />
                </div>
                <span
                  className={`text-center font-display text-xs font-bold leading-tight ${
                    has ? 'text-ink' : 'text-ink/40'
                  }`}
                >
                  {b.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
