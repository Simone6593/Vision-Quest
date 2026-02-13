
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
  isBomb: boolean;
  vx: number;
  vy: number;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

const FRUITS = [
  { icon: '🍉', color: '#ff4d4d' },
  { icon: '🥝', color: '#8cff66' },
  { icon: '🍎', color: '#ff3333' },
  { icon: '🍓', color: '#ff66b2' },
  { icon: '🍊', color: '#ff9933' },
  { icon: '🍍', color: '#ffff66' },
];

const SliceChallengeGame: React.FC<SliceChallengeGameProps> = ({ onSuccess, onFailure }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [slices, setSlices] = useState(0);
  const [swordPos, setSwordPos] = useState({ x: -100, y: -100 });
  const containerRef = useRef<HTMLDivElement>(null);
  const nextTargetId = useRef(0);
  const nextParticleId = useRef(0);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (targets.length < 6) {
        const isBomb = Math.random() > 0.8;
        const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
        
        const newTarget: Target = {
          id: nextTargetId.current++,
          x: Math.random() * 80 + 10,
          y: 110,
          icon: isBomb ? '💣' : fruit.icon,
          color: isBomb ? '#333' : fruit.color,
          isSliced: false,
          isBomb: isBomb,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -4.0 - Math.random() * 3.0,
        };
        setTargets(prev => [...prev, newTarget]);
      }
    }, 800);

    const physicsInterval = setInterval(() => {
      // Physics for targets
      setTargets(prev => prev
        .map(t => ({
          ...t,
          x: t.x + t.vx,
          y: t.y + t.vy,
          vy: t.vy + 0.05,
        }))
        .filter(t => t.y < 130)
      );

      // Physics for particles
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.1,
          life: p.life - 0.02,
        }))
        .filter(p => p.life > 0)
      );
    }, 16);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(physicsInterval);
    };
  }, [targets.length]);

  const createParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: nextParticleId.current++,
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color,
        life: 1.0,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    setSwordPos({ x: px, y: py });

    setTargets(prev => {
      let changed = false;
      const next = prev.map(t => {
        if (!t.isSliced && Math.abs(t.x - px) < 10 && Math.abs(t.y - py) < 10) {
          if (t.isBomb) {
            onFailure();
            changed = true;
            return { ...t, isSliced: true }; // "Exploded"
          } else {
            createParticles(t.x, t.y, t.color);
            changed = true;
            return { ...t, isSliced: true };
          }
        }
        return t;
      });

      if (changed) {
        const slicedTarget = next.find((t, i) => t.isSliced && !prev[i].isSliced);
        if (slicedTarget && !slicedTarget.isBomb) {
          setSlices(s => {
            const newSlices = s + 1;
            if (newSlices % 5 === 0) onSuccess(5);
            return newSlices;
          });
        }
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full h-[65vh]">
      <div className="flex justify-between w-full max-w-2xl px-4">
        <h2 className="text-3xl font-kids text-orange-600">Ninja delle Forme! ⚔️</h2>
        <div className="flex gap-4">
          <div className="bg-red-100 px-4 py-1 rounded-full border-2 border-red-300 font-kids text-red-600">
            Evita le 💣!
          </div>
          <div className="bg-orange-100 px-4 py-1 rounded-full border-2 border-orange-300 font-kids text-orange-600">
            Tagli: {slices}
          </div>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="flex-1 w-full max-w-2xl bg-sky-50 rounded-3xl border-4 border-orange-200 relative overflow-hidden cursor-none touch-none shadow-inner"
      >
        {/* Particles */}
        {particles.map(p => (
          <div 
            key={p.id}
            style={{ 
              left: `${p.x}%`, 
              top: `${p.y}%`, 
              backgroundColor: p.color,
              opacity: p.life,
              transform: `scale(${p.life * 1.5})`
            }}
            className="absolute w-3 h-3 rounded-full pointer-events-none"
          />
        ))}

        {/* Targets */}
        {targets.map(t => (
          <div
            key={t.id}
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
            className={`
              absolute -translate-x-1/2 -translate-y-1/2 text-7xl select-none transition-all duration-300
              ${t.isSliced ? (t.isBomb ? 'scale-150 opacity-0 blur-lg' : 'scale-125 opacity-0 rotate-45') : 'scale-100 opacity-100'}
            `}
          >
            {t.isSliced && !t.isBomb ? (
               <div className="relative flex">
                  <span className="transform -translate-x-4 -rotate-12">{" "}{t.icon}</span>
                  <span className="transform translate-x-4 rotate-12">{" "}{t.icon}</span>
               </div>
            ) : t.icon}
          </div>
        ))}

        {/* Sword */}
        <div 
            className="absolute pointer-events-none z-50"
            style={{ left: `${swordPos.x}%`, top: `${swordPos.y}%`, transform: `translate(-50%, -50%) rotate(45deg)` }}
        >
            <span className="text-6xl drop-shadow-lg">⚔️</span>
        </div>
      </div>
    </div>
  );
};

export default SliceChallengeGame;
