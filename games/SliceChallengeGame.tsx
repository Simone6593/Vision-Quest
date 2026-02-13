
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

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

const EMOJIS = ['🍉', '🥝', '🍎', '🍓', '🍊', '🍍'];

const SliceChallengeGame: React.FC<SliceChallengeGameProps> = ({ onSuccess, onFailure }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [slices, setSlices] = useState(0);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextTargetId = useRef(0);
  const nextTrailId = useRef(0);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (targets.length < 6) {
        const newTarget: Target = {
          id: nextTargetId.current++,
          x: Math.random() * 80 + 10,
          y: 110,
          icon: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          isSliced: false,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -2.0 - Math.random() * 2.0,
        };
        setTargets(prev => [...prev, newTarget]);
      }
    }, 800);

    const physicsInterval = setInterval(() => {
      setTargets(prev => prev
        .map(t => ({
          ...t,
          x: t.x + t.vx,
          y: t.y + t.vy,
          vy: t.vy + 0.035, // gravità
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
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    // Gestione della scia
    if (e.buttons === 1 || e.pointerType === 'touch') {
      const newPoint = { x: px, y: py, id: nextTrailId.current++ };
      setTrail(prev => [...prev.slice(-10), newPoint]);
    } else {
      setTrail([]);
    }

    if (e.buttons !== 1 && e.pointerType !== 'touch') return;

    setTargets(prev => {
      let changed = false;
      const next = prev.map(t => {
        if (!t.isSliced && Math.abs(t.x - px) < 10 && Math.abs(t.y - py) < 10) {
          changed = true;
          return { ...t, isSliced: true };
        }
        return t;
      });
      if (changed) {
        setSlices(s => {
          const newSlices = s + 1;
          if (newSlices % 5 === 0) onSuccess(5);
          return newSlices;
        });
      }
      return next;
    });
  };

  const handlePointerUp = () => setTrail([]);

  return (
    <div className="flex flex-col items-center gap-4 w-full h-[65vh]">
      <div className="flex justify-between w-full max-w-2xl px-4">
        <h2 className="text-3xl font-kids text-orange-600">Ninja della Frutta! ⚔️</h2>
        <div className="bg-orange-100 px-4 py-1 rounded-full border-2 border-orange-300 font-kids text-orange-600">
          Tagli: {slices}
        </div>
      </div>
      
      <div 
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="flex-1 w-full max-w-2xl bg-sky-100/50 rounded-3xl border-4 border-orange-200 relative overflow-hidden cursor-crosshair touch-none shadow-inner"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <span className="text-9xl">⚔️</span>
        </div>

        {/* Punti della Scia */}
        {trail.map((p, i) => (
          <div 
            key={p.id}
            style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: (i / trail.length) * 0.8 }}
            className="absolute w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none blur-[1px]"
          />
        ))}
        
        {targets.map(t => (
          <div
            key={t.id}
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
            className={`
              absolute -translate-x-1/2 -translate-y-1/2 text-7xl select-none transition-all duration-500
              ${t.isSliced ? 'scale-150 opacity-0 rotate-[180deg] translate-y-20' : 'scale-100 opacity-100'}
            `}
          >
            {t.isSliced ? (
               <div className="relative flex">
                  <span className="filter saturate-150 transform -translate-x-2">{" "}{t.icon}</span>
                  <span className="filter saturate-150 transform translate-x-2">{" "}{t.icon}</span>
               </div>
            ) : t.icon}
          </div>
        ))}
      </div>
      <p className="text-lg font-kids text-orange-500">Trascina velocemente per tagliare!</p>
    </div>
  );
};

export default SliceChallengeGame;
