import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { AnimatedNumber } from './AnimatedNumber';
import { useGameStore } from '@/store/useGameStore';
import { RoundButton } from './ui/Button';

// Persistent top bar: stars (count-up), day streak, buddy level. Always visible.
export function StatsBar({ onParent }: { onParent?: () => void }) {
  const progress = useGameStore((s) => s.progress);
  const muted = useGameStore((s) => s.muted);
  const toggleMute = useGameStore((s) => s.toggleMute);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-4 pt-[max(env(safe-area-inset-top),12px)]">
      <div className="pointer-events-auto flex items-center gap-2">
        <Pill color="#ffc83d">
          <Icon name="Star" className="text-white" size={22} />
          <AnimatedNumber value={progress.totalStars} className="tabular-nums" />
        </Pill>
        <Pill color="#ff7350">
          <Icon name="Flame" className="text-white" size={22} />
          <span className="tabular-nums">{progress.streak}</span>
        </Pill>
        <Pill color="#7c5cff">
          <Icon name="Crown" className="text-white" size={20} />
          <span className="tabular-nums">{progress.level}</span>
        </Pill>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <RoundButton ariaLabel={muted ? 'Activer le son' : 'Couper le son'} onClick={toggleMute} className="h-12 w-12">
          <Icon name={muted ? 'VolumeX' : 'Volume2'} size={22} />
        </RoundButton>
        {onParent && (
          <RoundButton ariaLabel="Espace parent" onClick={onParent} className="h-12 w-12">
            <Icon name="Settings" size={22} />
          </RoundButton>
        )}
      </div>
    </div>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <motion.div
      layout
      className="flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 font-display text-lg font-extrabold text-white shadow-soft"
      style={{ backgroundColor: color }}
    >
      {children}
    </motion.div>
  );
}
