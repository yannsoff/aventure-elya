import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, TOTAL_WEEKS } from '@/store/useGameStore';
import { StatsBar } from '@/components/StatsBar';
import { Buddy } from '@/components/Buddy';
import { Icon } from '@/components/Icon';
import { WEEK_META } from '@/content/weeksMeta';
import { speak } from '@/audio/speech';
import { sfx } from '@/audio/sfx';

const ROW_H = 170;

export function AdventureMap() {
  const child = useGameStore((s) => s.child)!;
  const level = useGameStore((s) => s.progress.level);
  const weekProgress = useGameStore((s) => s.weekProgress);
  const goToWeek = useGameStore((s) => s.goToWeek);
  const setScreen = useGameStore((s) => s.setScreen);
  const currentWeek = useGameStore((s) => s.currentWeekIndex)();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const daysDone = (w: number) => weekProgress.find((x) => x.weekIndex === w)?.daysCompleted ?? 0;
  const isCompleted = (w: number) => daysDone(w) >= 5;
  const isUnlocked = (w: number) => w <= currentWeek;

  const openWeek = (w: number) => {
    if (!isUnlocked(w)) {
      sfx.soft();
      speak('Cette île est encore fermée. Finis la précédente !', 'fr-FR');
      return;
    }
    sfx.tap();
    goToWeek(w);
  };

  // Render islands from week 8 (top) down to week 1 (bottom) so the journey climbs.
  const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => TOTAL_WEEKS - 1 - i);

  return (
    <div className="relative h-full w-full">
      <StatsBar onParent={() => setScreen('parent')} />

      <div ref={scrollRef} className="scroll-y h-full w-full pt-24 pb-28">
        <div className="relative mx-auto" style={{ width: 360, height: TOTAL_WEEKS * ROW_H + 80 }}>
          {/* Winding path */}
          <svg className="absolute inset-0" width={360} height={TOTAL_WEEKS * ROW_H + 80}>
            <path
              d={weeks
                .map((_, i) => {
                  const x = i % 2 === 0 ? 110 : 250;
                  const y = i * ROW_H + 80;
                  return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#d8ccff"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray="2 18"
            />
          </svg>

          {weeks.map((w, i) => {
            const x = i % 2 === 0 ? 110 : 250;
            const y = i * ROW_H + 80;
            const meta = WEEK_META[w];
            const completed = isCompleted(w);
            const unlocked = isUnlocked(w);
            const isCurrent = w === currentWeek;
            return (
              <div
                key={w}
                ref={isCurrent ? currentRef : undefined}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: x, top: y }}
              >
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  animate={isCurrent ? { scale: [1, 1.06, 1] } : {}}
                  transition={isCurrent ? { repeat: Infinity, duration: 1.8 } : {}}
                  onClick={() => openWeek(w)}
                  className="relative grid h-28 w-28 place-items-center rounded-full shadow-pop"
                  style={{
                    background: unlocked ? meta.color : '#cfc9da',
                    opacity: unlocked ? 1 : 0.7,
                  }}
                >
                  <span className="font-display text-4xl font-extrabold text-white drop-shadow">
                    {w + 1}
                  </span>
                  {!unlocked && (
                    <span className="absolute -bottom-2 -right-1 grid h-9 w-9 place-items-center rounded-full bg-white shadow-soft">
                      <Icon name="Lock" size={18} className="text-ink/50" />
                    </span>
                  )}
                  {completed && (
                    <span className="absolute -top-2 -right-2 grid h-10 w-10 place-items-center rounded-full bg-leaf shadow-soft">
                      <Icon name="Flag" size={20} className="text-white" />
                    </span>
                  )}
                  {/* Buddy stands on the current island */}
                  {isCurrent && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                      <Buddy type={child.buddyType} mood="idle" level={level} size={84} />
                    </div>
                  )}
                </motion.button>
                <div className="mt-2 w-32 -translate-x-2 text-center">
                  <div className="font-display text-sm font-extrabold text-ink">{meta.name}</div>
                  <div className="text-xs font-bold text-ink/50">{meta.focus}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar: trophies */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center pb-[max(env(safe-area-inset-bottom),16px)]">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            sfx.tap();
            setScreen('trophies');
          }}
          className="flex items-center gap-2 rounded-pill bg-white px-6 py-3 font-display text-lg font-extrabold text-ink shadow-pop"
        >
          <Icon name="Trophy" size={24} className="text-sun" />
          Mes trophées
        </motion.button>
      </div>
    </div>
  );
}
