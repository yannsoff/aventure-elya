import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '@/components/GameShell';
import { useRound } from '@/hooks/useRound';
import { sfx, haptic } from '@/audio/sfx';
import { LETTER_PATHS, NAME_LETTERS } from '@/content/letters';
import type { GameProps } from './types';

interface SamplePoint {
  len: number;
  x: number;
  y: number;
}

// Forgiving finger-tracing of a single guided letter path.
// Progress advances along the path's arc length as the finger passes near it.
function Tracer({ d, onDone }: { d: string; onDone: () => void }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const guideRef = useRef<SVGPathElement | null>(null);
  const samples = useRef<SamplePoint[]>([]);
  const totalRef = useRef(1);
  const [totalLen, setTotalLen] = useState(0);
  const [progress, setProgress] = useState(0);
  const drawing = useRef(false);
  const finished = useRef(false);

  const TOL = 14; // viewBox units
  const MAX_JUMP = 0.22; // fraction of total length the finger may skip ahead

  useEffect(() => {
    const path = guideRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    totalRef.current = len;
    const pts: SamplePoint[] = [];
    for (let l = 0; l <= len; l += 2) {
      const p = path.getPointAtLength(l);
      pts.push({ len: l, x: p.x, y: p.y });
    }
    samples.current = pts;
    setTotalLen(len); // state so the dash mask re-renders with the real length
    setProgress(0);
    finished.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d]);

  const toSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!drawing.current || finished.current) return;
    const pos = toSvg(clientX, clientY);
    if (!pos) return;
    let best: SamplePoint | null = null;
    let bestDist = Infinity;
    for (const s of samples.current) {
      const dx = s.x - pos.x;
      const dy = s.y - pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = s;
      }
    }
    if (best && bestDist <= TOL) {
      const frac = best.len / totalRef.current;
      const cur = progress;
      // Only advance forward and not too far ahead, so the child follows the path.
      if (frac > cur && frac - cur <= MAX_JUMP) {
        setProgress(frac);
        if (frac >= 0.85 && !finished.current) {
          finished.current = true;
          drawing.current = false;
          sfx.correct();
          haptic([20, 30, 20]);
          window.setTimeout(onDone, 250);
        }
      } else if (frac <= cur && cur < 0.05) {
        // allow starting anywhere near the beginning
        setProgress(Math.max(cur, frac));
      }
    }
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 130"
      width={300}
      height={325}
      className="touch-none rounded-blob bg-white shadow-soft"
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        drawing.current = true;
        handleMove(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => handleMove(e.clientX, e.clientY)}
      onPointerUp={() => {
        drawing.current = false;
      }}
      onPointerLeave={() => {
        drawing.current = false;
      }}
    >
      {/* start dot */}
      {samples.current[0] && (
        <circle cx={samples.current[0].x} cy={samples.current[0].y} r={6} fill="#36d39a" />
      )}
      {/* guide path (dashed, faint) */}
      <path ref={guideRef} d={d} fill="none" stroke="#e2dcff" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#c9bdff" strokeWidth={2} strokeDasharray="2 8" strokeLinecap="round" />
      {/* inked progress (only once the path length is measured) */}
      {totalLen > 0 && (
        <path
          d={d}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: totalLen, strokeDashoffset: totalLen * (1 - progress) }}
        />
      )}
    </svg>
  );
}

// Trace It: trace letters with a finger; priority s & d, then the name "Elya".
export function TraceIt({ item, onAnswer }: GameProps) {
  const isName = item.payload.name === true;
  const letters = isName ? NAME_LETTERS : [item.payload.letter as string];
  const { status, feedback, markCorrect } = useRound(onAnswer);
  const [index, setIndex] = useState(0);

  const current = letters[index];
  const d = LETTER_PATHS[current] ?? LETTER_PATHS.l;

  const onLetterDone = () => {
    if (index + 1 < letters.length) {
      setIndex((i) => i + 1);
    } else {
      markCorrect();
    }
  };

  return (
    <GameShell
      instruction={[
        { text: isName ? 'Écris ton prénom en suivant le chemin !' : `Trace la lettre avec ton doigt !`, lang: 'fr-FR' },
        { text: current, lang: 'en-GB' },
      ]}
      titleFr={isName ? `Écris « Elya » (${current})` : `Trace la lettre « ${current} »`}
      status={status}
      feedback={feedback}
    >
      <div className="flex flex-col items-center gap-3">
        {isName && (
          <div className="flex gap-2">
            {letters.map((l, i) => (
              <span
                key={i}
                className={`grid h-9 w-9 place-items-center rounded-full font-display text-lg font-bold ${
                  i < index ? 'bg-leaf text-white' : i === index ? 'bg-accent text-white' : 'bg-white text-ink/40'
                }`}
              >
                {l}
              </span>
            ))}
          </div>
        )}
        <motion.div key={index} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Tracer d={d} onDone={onLetterDone} />
        </motion.div>
      </div>
    </GameShell>
  );
}
