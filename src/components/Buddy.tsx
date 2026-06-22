import { motion } from 'framer-motion';
import type { BuddyType } from '@/types';

export type BuddyMood = 'idle' | 'happy' | 'cheer';

interface BuddyProps {
  type: BuddyType;
  mood?: BuddyMood;
  level?: number;
  size?: number;
  className?: string;
}

// Companion colour identity per animal.
const COLORS: Record<BuddyType, { main: string; soft: string; dark: string }> = {
  fox: { main: '#ff8a3d', soft: '#ffd9b8', dark: '#e0651c' },
  owl: { main: '#a07cff', soft: '#e3d6ff', dark: '#6f4fd1' },
  cat: { main: '#9aa3b2', soft: '#e4e8ef', dark: '#6b7385' },
  bunny: { main: '#ff9ec4', soft: '#ffe0ec', dark: '#e06699' },
  unicorn: { main: '#ffffff', soft: '#fbe9ff', dark: '#d9b8ff' },
  dolphin: { main: '#43c6f0', soft: '#cdeefb', dark: '#1f9fc9' },
};

// Cheerful eyes (closed happy arcs) vs open round eyes.
function Eyes({ cheer, c }: { cheer: boolean; c: string }) {
  if (cheer) {
    return (
      <g stroke={c} strokeWidth={4} strokeLinecap="round" fill="none">
        <path d="M40 56 q6 -8 12 0" />
        <path d="M68 56 q6 -8 12 0" />
      </g>
    );
  }
  return (
    <g>
      <circle cx="46" cy="56" r="6" fill={c} />
      <circle cx="74" cy="56" r="6" fill={c} />
      <circle cx="48" cy="54" r="2" fill="#fff" />
      <circle cx="76" cy="54" r="2" fill="#fff" />
    </g>
  );
}

function Mouth({ big, c }: { big: boolean; c: string }) {
  return big ? (
    <path d="M50 70 q10 14 20 0 q-10 6 -20 0" fill={c} />
  ) : (
    <path d="M52 70 q8 8 16 0" stroke={c} strokeWidth={3.5} fill="none" strokeLinecap="round" />
  );
}

function FoxFace({ col, cheer }: { col: typeof COLORS.fox; cheer: boolean }) {
  return (
    <g>
      <path d="M22 30 L40 50 L26 54 Z" fill={col.main} />
      <path d="M98 30 L80 50 L94 54 Z" fill={col.main} />
      <path d="M60 28 C32 28 28 60 60 88 C92 60 88 28 60 28 Z" fill={col.main} />
      <path d="M60 50 C44 50 42 70 60 86 C78 70 76 50 60 50 Z" fill="#fff" />
      <circle cx="60" cy="78" r="5" fill={col.dark} />
      <Eyes cheer={cheer} c={col.dark} />
      <Mouth big={cheer} c={col.dark} />
    </g>
  );
}

function OwlFace({ col, cheer }: { col: typeof COLORS.owl; cheer: boolean }) {
  return (
    <g>
      <path d="M30 26 L40 44 L26 44 Z" fill={col.dark} />
      <path d="M90 26 L80 44 L94 44 Z" fill={col.dark} />
      <ellipse cx="60" cy="62" rx="36" ry="34" fill={col.main} />
      <circle cx="47" cy="56" r="13" fill="#fff" />
      <circle cx="73" cy="56" r="13" fill="#fff" />
      {cheer ? (
        <g stroke={col.dark} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M40 56 q7 -8 14 0" />
          <path d="M66 56 q7 -8 14 0" />
        </g>
      ) : (
        <g>
          <circle cx="47" cy="57" r="6" fill={col.dark} />
          <circle cx="73" cy="57" r="6" fill={col.dark} />
        </g>
      )}
      <path d="M54 66 L66 66 L60 76 Z" fill="#ffc83d" />
    </g>
  );
}

function CatFace({ col, cheer }: { col: typeof COLORS.cat; cheer: boolean }) {
  return (
    <g>
      <path d="M30 28 L46 48 L28 50 Z" fill={col.main} />
      <path d="M90 28 L74 48 L92 50 Z" fill={col.main} />
      <circle cx="60" cy="62" r="34" fill={col.main} />
      <Eyes cheer={cheer} c={col.dark} />
      <path d="M58 68 L62 68 L60 72 Z" fill={col.dark} />
      <Mouth big={cheer} c={col.dark} />
      <g stroke={col.dark} strokeWidth={2.5} strokeLinecap="round">
        <path d="M30 64 L46 66" /><path d="M30 72 L46 72" />
        <path d="M90 64 L74 66" /><path d="M90 72 L74 72" />
      </g>
    </g>
  );
}

function BunnyFace({ col, cheer }: { col: typeof COLORS.bunny; cheer: boolean }) {
  return (
    <g>
      <ellipse cx="48" cy="26" rx="9" ry="22" fill={col.main} />
      <ellipse cx="72" cy="26" rx="9" ry="22" fill={col.main} />
      <ellipse cx="48" cy="28" rx="4" ry="14" fill={col.soft} />
      <ellipse cx="72" cy="28" rx="4" ry="14" fill={col.soft} />
      <circle cx="60" cy="64" r="32" fill={col.main} />
      <Eyes cheer={cheer} c={col.dark} />
      <path d="M57 70 L63 70 L60 74 Z" fill={col.dark} />
      <Mouth big={cheer} c={col.dark} />
    </g>
  );
}

function UnicornFace({ col, cheer }: { col: typeof COLORS.unicorn; cheer: boolean }) {
  return (
    <g>
      <path d="M60 14 L66 40 L54 40 Z" fill="#ffc83d" />
      <path d="M44 30 q-12 -4 -14 12 q10 -6 16 2 Z" fill="#a07cff" />
      <path d="M76 30 q12 -4 14 12 q-10 -6 -16 2 Z" fill="#ff9ec4" />
      <circle cx="60" cy="64" r="33" fill={col.main} stroke={col.dark} strokeWidth={2} />
      <Eyes cheer={cheer} c="#6f4fd1" />
      <path d="M56 72 q4 5 8 0" stroke="#6f4fd1" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <circle cx="42" cy="72" r="5" fill="#ffb8d9" />
      <circle cx="78" cy="72" r="5" fill="#ffb8d9" />
    </g>
  );
}

function DolphinFace({ col, cheer }: { col: typeof COLORS.dolphin; cheer: boolean }) {
  return (
    <g>
      <path d="M60 22 q4 -12 14 -10 q-6 6 -2 14 Z" fill={col.main} />
      <ellipse cx="60" cy="62" rx="36" ry="33" fill={col.main} />
      <path d="M36 70 q24 22 48 0 q-24 8 -48 0 Z" fill={col.soft} />
      <Eyes cheer={cheer} c="#0d3b4a" />
      <path d="M40 60 q20 26 40 0" stroke="#0d3b4a" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    </g>
  );
}

const FACES = {
  fox: FoxFace,
  owl: OwlFace,
  cat: CatFace,
  bunny: BunnyFace,
  unicorn: UnicornFace,
  dolphin: DolphinFace,
};

export function Buddy({ type, mood = 'idle', level = 1, size = 120, className }: BuddyProps) {
  const col = COLORS[type];
  const cheer = mood === 'cheer' || mood === 'happy';
  const Face = FACES[type];

  const float = mood === 'idle'
    ? { y: [0, -6, 0] }
    : mood === 'cheer'
      ? { y: [0, -14, 0], rotate: [0, -4, 4, 0] }
      : { y: [0, -4, 0] };

  return (
    <motion.svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      animate={float}
      transition={{ duration: mood === 'cheer' ? 0.5 : 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Soft ground shadow */}
      <ellipse cx="60" cy="110" rx="28" ry="6" fill="rgba(0,0,0,0.08)" />
      <Face col={col as never} cheer={cheer} />
      {/* Level accessory: a small crown of sparkles as the buddy grows. */}
      {level >= 3 && (
        <g>
          <path d="M44 18 L48 26 L40 24 Z" fill="#ffc83d" />
          <path d="M60 12 L64 22 L56 22 Z" fill="#ffc83d" />
          <path d="M76 18 L72 26 L80 24 Z" fill="#ffc83d" />
        </g>
      )}
      {level >= 5 && (
        <g fill="#ffe27a">
          <circle cx="24" cy="40" r="2.5" />
          <circle cx="96" cy="44" r="2.5" />
          <circle cx="30" cy="86" r="2" />
        </g>
      )}
    </motion.svg>
  );
}
