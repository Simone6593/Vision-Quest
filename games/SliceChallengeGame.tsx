
import React, { useState, useEffect, useRef } from 'react';

interface SliceChallengeGameProps {
  onSuccess: (points: number) => void;
  onFailure: () => void;
}

interface Target {
  id: number;
  x: number;
  y: number;
  icon: string;
  isSliced: boolean;
  vx: number;
  vy: number;
}

const EMOJIS = ['🍉', '🥝', '🍎', '🍓', '🍊', '🍍'];

const SliceChallengeGame: React.FC<SliceChallengeGameProps> = ({ onSuccess, onFailure }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [slices, setSlices] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextTargetId = useRef(0);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (targets.length < 5) {
        const newTarget: Target = {
          id: nextTargetId.current++,
          x: Math.random() * 80 + 10,
          y: 110,
          icon: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          isSliced: false,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -1.5 - Math.random() * 1.5,
        };
        setTargets(prev => [...prev, newTarget]);
      }
    }, 1000);

    const physicsInterval = setInterval(() => {
      setTargets(prev => prev
        .map(t => ({
          ...t,
          x: t.x + t.vx,
          y: t.y + t.vy,
          vy: t.vy + 0.02, // gravity
        }))
        .filter(t => t.y < 120)
      );
    }, 16);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(physicsInterval);
    };
  }, [targets.length]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return; // Only if mouse down or touch

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    setTargets(prev => {
      let changed = false;
      const next = prev.map(t => {
        if (!t.isSliced && Math.abs(t.x - px) < 8 && Math.abs(t.y - py) < 8) {
          changed = true;
          return { ...t, isSliced: true };
        }
        return t;
      });
      if (changed) {
        setSlices(s => {
          const newSlices = s + 1;
          if (newSlices % 10 === 0) onSuccess(10);
          return newSlices;
        });
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full h-[60vh]">
      <div className="flex justify-between w-full max-w-2xl px-4">
        <h2 className="text-3xl font-kids text-orange-600">Ninja della Frutta! ⚔️</h2>
        <div className="bg-orange-100 px-4 py-1 rounded-full border-2 border-orange-300 font-kids text-orange-600">
          Tagli: {slices}
        </div>
      </div>
      
      <div 
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="flex-1 w-full max-w-2xl bg-sky-100 rounded-3xl border-4 border-orange-200 relative overflow-hidden cursor-crosshair touch-none"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <span className="text-9xl">⚔️</span>
        </div>
        
        {targets.map(t => (
          <div
            key={t.id}
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
            className={`
              absolute -translate-x-1/2 -translate-y-1/2 text-6xl select-none transition-all duration-300
              ${t.isSliced ? 'scale-150 opacity-0 rotate-180' : 'scale-100 opacity-100'}
            `}
          >
            {t.icon}
          </div>
        ))}
      </div>
      <p className="text-lg font-kids text-orange-500">Trascina il dito per tagliare la frutta!</p>
    </div>
  );
};

export default SliceChallengeGame;
