import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { sfx, haptic } from '@/audio/sfx';

interface BigButtonProps {
  children: ReactNode;
  onClick?: () => void;
  color?: string; // CSS color; defaults to accent
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

// Large, rounded, 3D-press primary button for tiny fingers.
export function BigButton({
  children,
  onClick,
  color,
  className = '',
  disabled,
  ariaLabel,
}: BigButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      whileTap={{ scale: 0.92, y: 4 }}
      onClick={() => {
        if (disabled) return;
        sfx.tap();
        haptic(20);
        onClick?.();
      }}
      className={`btn-3d px-8 py-5 text-2xl text-white disabled:opacity-40 ${className}`}
      style={{ backgroundColor: color ?? 'var(--accent)' }}
    >
      {children}
    </motion.button>
  );
}

// Round icon button (mute, close, settings...).
export function RoundButton({
  children,
  onClick,
  className = '',
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      whileTap={{ scale: 0.88 }}
      onClick={() => {
        sfx.tap();
        onClick?.();
      }}
      className={`grid place-items-center rounded-full bg-white/80 text-ink shadow-soft backdrop-blur ${className}`}
    >
      {children}
    </motion.button>
  );
}
