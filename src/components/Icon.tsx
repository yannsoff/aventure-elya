import {
  Star, Flame, Lock, Check, Trophy, Footprints, BookOpen, BookOpenCheck,
  Calculator, Sigma, Flag, Medal, PenTool, Volume2, VolumeX, X, Play,
  Settings, IceCream, Gift, Candy, Cookie, Sparkles, Tv, Bike, Trees,
  Pizza, Cake, ToyBrick, Gamepad2, Music, Palette, Rocket, Crown, Heart,
  Cat, Dog, Sun, Fish, Bird, TreePine, House, Car, Flower2, Apple, Moon,
  Cloud, Umbrella, ArrowRight, ArrowLeft, Volume1, Ear, Pencil, Shapes,
  Clock, Divide, Plus, Minus, Hash, Grid3x3, type LucideIcon,
} from 'lucide-react';

// Curated map of lucide icons referenced across the app (by string name).
// Keeps the icon set explicit and the bundle predictable.
const ICONS: Record<string, LucideIcon> = {
  Star, Flame, Lock, Check, Trophy, Footprints, BookOpen, BookOpenCheck,
  Calculator, Sigma, Flag, Medal, PenTool, Volume2, VolumeX, X, Play,
  Settings, IceCream, Gift, Candy, Cookie, Sparkles, Tv, Bike, Trees,
  Pizza, Cake, ToyBrick, Gamepad2, Music, Palette, Rocket, Crown, Heart,
  Cat, Dog, Sun, Fish, Bird, TreePine, House, Car, Flower2, Apple, Moon,
  Cloud, Umbrella, ArrowRight, ArrowLeft, Volume1, Ear, Pencil, Shapes,
  Clock, Divide, Plus, Minus, Hash, Grid3x3,
};

export function Icon({
  name,
  className,
  size,
  strokeWidth = 2.4,
}: {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Cmp = ICONS[name] ?? Star;
  return <Cmp className={className} size={size} strokeWidth={strokeWidth} />;
}

// Icon names offered to the parent when picking a weekly reward.
export const REWARD_ICONS = [
  'IceCream', 'Candy', 'Cookie', 'Cake', 'Pizza', 'Gift', 'Tv', 'Bike',
  'ToyBrick', 'Gamepad2', 'Music', 'Palette', 'Rocket', 'Sparkles', 'Heart',
];
