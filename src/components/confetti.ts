import confetti from 'canvas-confetti';

// Generous celebration bursts (confidence-first, big rewards).
export function celebrate(intensity: 'small' | 'big' = 'small') {
  const count = intensity === 'big' ? 220 : 90;
  const defaults = {
    origin: { y: 0.65 },
    colors: ['#7c5cff', '#ff7eb6', '#ffc83d', '#36d39a', '#43c6f0', '#ff8a5c'],
  };
  confetti({ ...defaults, particleCount: count * 0.5, spread: 70, startVelocity: 45 });
  confetti({ ...defaults, particleCount: count * 0.3, spread: 100, decay: 0.92, scalar: 1.2 });
  if (intensity === 'big') {
    setTimeout(() => confetti({ ...defaults, particleCount: 120, angle: 60, spread: 80, origin: { x: 0 } }), 200);
    setTimeout(() => confetti({ ...defaults, particleCount: 120, angle: 120, spread: 80, origin: { x: 1 } }), 350);
  }
}

export function starBurst(x: number, y: number) {
  confetti({
    particleCount: 24,
    spread: 50,
    startVelocity: 28,
    scalar: 0.9,
    origin: { x, y },
    colors: ['#ffc83d', '#ffe27a', '#fff'],
    shapes: ['star'],
  });
}
