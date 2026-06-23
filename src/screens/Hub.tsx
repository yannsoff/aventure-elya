import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { StatsBar } from '@/components/StatsBar';
import { Buddy } from '@/components/Buddy';
import { Icon } from '@/components/Icon';
import { WEEK_META } from '@/content/weeksMeta';
import { sfx } from '@/audio/sfx';
import { speak } from '@/audio/speech';

function Tile({
  icon,
  title,
  subtitle,
  color,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        sfx.tap();
        onClick();
      }}
      className="flex items-center gap-4 rounded-blob bg-white p-4 text-left shadow-soft"
    >
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-white" style={{ background: color }}>
        <Icon name={icon} size={32} />
      </div>
      <div className="flex-1">
        <div className="font-display text-2xl font-extrabold text-ink">{title}</div>
        <div className="font-bold text-ink/50">{subtitle}</div>
      </div>
      <Icon name="ArrowRight" size={24} className="text-ink/30" />
    </motion.button>
  );
}

export function Hub() {
  const child = useGameStore((s) => s.child)!;
  const progress = useGameStore((s) => s.progress);
  const attempts = useGameStore((s) => s.attempts);
  const openDeck = useGameStore((s) => s.openDeck);
  const setScreen = useGameStore((s) => s.setScreen);
  const week = useGameStore((s) => s.currentWeekIndex)();
  const meta = WEEK_META[week];

  return (
    <div className="relative h-full w-full">
      <StatsBar onParent={() => setScreen('parent')} />

      <div className="scroll-y h-full px-5 pb-8 pt-24">
        <div className="flex flex-col items-center">
          <Buddy type={child.buddyType} mood="idle" level={progress.level} size={120} />
          <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
            Salut <span className="text-accent">{child.name}</span> !
          </h1>
          <button
            type="button"
            onClick={() => speak(`Semaine ${week + 1}. ${meta.focus}`, 'fr-FR')}
            className="mt-1 rounded-pill bg-white px-4 py-1.5 font-display font-bold text-ink/70 shadow-soft"
          >
            Semaine {week + 1} · {meta.focus}
          </button>
        </div>

        <div className="mx-auto mt-6 flex max-w-md flex-col gap-4">
          <Tile
            icon="BookOpen"
            title="Lecture"
            subtitle="WordSwipe · cartes de mots"
            color="#7c5cff"
            onClick={() => openDeck('reading')}
          />
          <Tile
            icon="Calculator"
            title="Maths"
            subtitle="NumSwipe · cartes de calcul"
            color="#43c6f0"
            onClick={() => openDeck('maths')}
          />
          <Tile
            icon="Gamepad2"
            title="Aventure"
            subtitle="Les jeux et la carte des îles"
            color="#36d39a"
            onClick={() => setScreen('map')}
          />
          <Tile
            icon="Trophy"
            title="Trophées"
            subtitle={`${progress.badges.length} badges · niveau ${progress.level}`}
            color="#ffc83d"
            onClick={() => setScreen('trophies')}
          />
        </div>

        <div className="mx-auto mt-5 flex max-w-md items-center justify-around rounded-blob bg-white/70 p-3 shadow-soft">
          <Mini icon="Star" value={progress.totalStars} label="étoiles" />
          <Mini icon="Flame" value={progress.streak} label="jours" />
          <Mini icon="Sparkles" value={attempts.length} label="exercices" />
        </div>
      </div>
    </div>
  );
}

function Mini({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <Icon name={icon} size={22} className="text-accent" />
      <span className="font-display text-xl font-extrabold text-ink">{value}</span>
      <span className="text-xs font-bold text-ink/50">{label}</span>
    </div>
  );
}
