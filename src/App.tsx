import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Splash } from '@/screens/Splash';
import { Onboarding } from '@/screens/Onboarding';
import { Hub } from '@/screens/Hub';
import { FlashcardSession } from '@/screens/FlashcardSession';
import { AdventureMap } from '@/screens/AdventureMap';
import { WeekScreen } from '@/screens/WeekScreen';
import { SessionPlayer } from '@/screens/SessionPlayer';
import { ChestReward } from '@/screens/ChestReward';
import { Trophies } from '@/screens/Trophies';
import { ParentZone } from '@/screens/ParentZone';

function AppBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-[#fdefff] to-[#eaf6ff]" />
      {[
        { c: '#ffd9b8', x: '8%', y: '14%', s: 160 },
        { c: '#d6c8ff', x: '78%', y: '10%', s: 200 },
        { c: '#cdeefb', x: '70%', y: '72%', s: 220 },
        { c: '#ffe0ec', x: '12%', y: '74%', s: 180 },
      ].map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl"
          style={{ background: b.c, left: b.x, top: b.y, width: b.s, height: b.s, opacity: 0.5 }}
          animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export function App() {
  const loaded = useGameStore((s) => s.loaded);
  const screen = useGameStore((s) => s.screen);
  const child = useGameStore((s) => s.child);
  const init = useGameStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (child) document.documentElement.style.setProperty('--accent', child.accentColor);
  }, [child]);

  return (
    <div className="relative h-full w-full font-body text-ink">
      <AppBackground />
      <div className="relative z-10 h-full w-full">
        {!loaded ? (
          <div className="grid h-full place-items-center">
            <motion.div
              className="h-16 w-16 rounded-full border-4 border-grape border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              {screen === 'splash' && <Splash />}
              {screen === 'onboarding' && <Onboarding />}
              {screen === 'hub' && <Hub />}
              {screen === 'flashcards' && <FlashcardSession />}
              {screen === 'map' && <AdventureMap />}
              {screen === 'week' && <WeekScreen />}
              {screen === 'session' && <SessionPlayer />}
              {screen === 'chest' && <ChestReward />}
              {screen === 'trophies' && <Trophies />}
              {screen === 'parent' && <ParentZone />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
