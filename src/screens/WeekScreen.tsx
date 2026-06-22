import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { StatsBar } from '@/components/StatsBar';
import { Icon } from '@/components/Icon';
import { WEEK_META, DAY_NAMES, DAY_SHORT } from '@/content/weeksMeta';
import { speak } from '@/audio/speech';
import { sfx } from '@/audio/sfx';

export function WeekScreen() {
  const week = useGameStore((s) => s.activeWeek);
  const daySessions = useGameStore((s) => s.daySessions);
  const weekProgress = useGameStore((s) => s.weekProgress);
  const startDay = useGameStore((s) => s.startDay);
  const setScreen = useGameStore((s) => s.setScreen);
  const unlockAllDays = useGameStore((s) => s.unlockAllDays);
  const currentWeek = useGameStore((s) => s.currentWeekIndex)();
  const currentDay = useGameStore((s) => s.currentDayIndex)();

  const meta = WEEK_META[week];
  const daysDone = weekProgress.find((w) => w.weekIndex === week)?.daysCompleted ?? 0;
  const chestReady = daysDone >= 5;

  useEffect(() => {
    const t = window.setTimeout(() => speak(`${meta.name}. ${meta.focus}`, 'fr-FR'), 350);
    return () => window.clearTimeout(t);
  }, [meta.name, meta.focus]);

  const isCompleted = (d: number) =>
    daySessions.find((s) => s.weekIndex === week && s.dayIndex === d)?.completed ?? false;

  const isUnlocked = (d: number) => {
    if (week < currentWeek) return true;
    if (unlockAllDays) return true;
    if (week > currentWeek) return false;
    return d <= currentDay;
  };

  const openDay = (d: number) => {
    if (isCompleted(d)) {
      sfx.tap();
      speak('Tu as déjà fini ce jour, bravo ! Tu peux rejouer si tu veux.', 'fr-FR');
      startDay(week, d);
      return;
    }
    if (!isUnlocked(d)) {
      sfx.soft();
      speak('Ce jour arrive bientôt ! Termine le jour en cours.', 'fr-FR');
      return;
    }
    sfx.tap();
    startDay(week, d);
  };

  return (
    <div className="relative h-full w-full">
      <StatsBar onParent={() => setScreen('parent')} />

      <button
        type="button"
        onClick={() => {
          sfx.tap();
          setScreen('map');
        }}
        aria-label="Retour à la carte"
        className="absolute left-4 top-24 z-20 grid h-12 w-12 place-items-center rounded-full bg-white/80 shadow-soft"
      >
        <Icon name="ArrowLeft" size={24} />
      </button>

      <div className="flex h-full flex-col items-center justify-center px-6 pt-20">
        <h1 className="font-display text-4xl font-extrabold" style={{ color: meta.color }}>
          {meta.name}
        </h1>
        <p className="mb-1 font-display text-lg font-bold text-ink/60">{meta.focus}</p>

        {/* Week progress bar */}
        <div className="mb-8 mt-2 h-4 w-64 overflow-hidden rounded-pill bg-white shadow-soft">
          <motion.div
            className="h-full rounded-pill"
            style={{ background: meta.color }}
            initial={{ width: 0 }}
            animate={{ width: `${(daysDone / 5) * 100}%` }}
          />
        </div>

        {/* 5 stepping stones */}
        <div className="flex items-center gap-2">
          {DAY_NAMES.map((dn, d) => {
            const done = isCompleted(d);
            const unlocked = isUnlocked(d);
            const isToday = week === currentWeek && d === currentDay && !done;
            return (
              <motion.button
                key={d}
                whileTap={{ scale: 0.9 }}
                animate={isToday ? { y: [0, -8, 0] } : {}}
                transition={isToday ? { repeat: Infinity, duration: 1.6 } : {}}
                onClick={() => openDay(d)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`relative grid h-[68px] w-[68px] place-items-center rounded-blob font-display text-base font-extrabold shadow-soft ${
                    done ? 'text-white' : unlocked ? 'bg-white text-ink' : 'bg-white/50 text-ink/30'
                  }`}
                  style={done ? { background: meta.color } : isToday ? { boxShadow: `0 0 0 4px ${meta.color}` } : {}}
                >
                  {done ? (
                    <div className="flex flex-col items-center">
                      <Icon name="Check" size={26} className="text-white" />
                      <span className="text-xs">{DAY_SHORT[d]}</span>
                    </div>
                  ) : unlocked ? (
                    <span>{DAY_SHORT[d]}</span>
                  ) : (
                    <Icon name="Lock" size={22} className="text-ink/30" />
                  )}
                </div>
                <span className="text-xs font-bold text-ink/50">{dn}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Reward chest */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          animate={chestReady ? { scale: [1, 1.08, 1] } : {}}
          transition={chestReady ? { repeat: Infinity, duration: 1.4 } : {}}
          onClick={() => {
            if (chestReady) {
              sfx.tap();
              setScreen('chest');
            } else {
              sfx.soft();
              speak('Fais tes 5 jours pour ouvrir le coffre magique !', 'fr-FR');
            }
          }}
          className="mt-10 flex flex-col items-center gap-2"
        >
          <div
            className={`grid h-24 w-28 place-items-center rounded-blob shadow-pop ${
              chestReady ? 'bg-sun' : 'bg-white/60'
            }`}
          >
            <Icon name="Gift" size={48} className={chestReady ? 'text-white' : 'text-ink/30'} />
            {!chestReady && (
              <span className="absolute mt-16 grid h-9 w-9 place-items-center rounded-full bg-white shadow-soft">
                <Icon name="Lock" size={16} className="text-ink/40" />
              </span>
            )}
          </div>
          <span className="font-display font-extrabold text-ink/70">
            {chestReady ? 'Ouvre ton coffre !' : `${daysDone}/5 jours`}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
