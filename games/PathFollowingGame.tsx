
import React, { useState, useEffect, useRef } from 'react';

interface PathFollowingGameProps {
  onSuccess: (points: number) => void;
  onFailure: () => void;
}

interface Node {
  id: number;
  x: number;
  y: number;
}

interface Point {
  x: number;
  y: number;
}

const PathFollowingGame: React.FC<PathFollowingGameProps> = ({ onSuccess, onFailure }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nextId, setNextId] = useState(1);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [level, setLevel] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateLevel = () => {
    const nodeCount = Math.min(level + 2, 8);
    const newNodes: Node[] = [];
    const usedPositions: { x: number; y: number }[] = [];

    for (let i = 1; i <= nodeCount; i++) {
      let x, y, tooClose;
      let attempts = 0;
      do {
        x = 15 + Math.random() * 70;
        y = 15 + Math.random() * 70;
        tooClose = usedPositions.some(p => Math.hypot(p.x - x, p.y - y) < 20);
        attempts++;
      } while (tooClose && attempts < 50);
      
      newNodes.push({ id: i, x, y });
      usedPositions.push({ x, y });
    }
    setNodes(newNodes);
    setNextId(1);
    setCurrentPath([]);
    setIsDrawing(false);
  };

  useEffect(() => {
    generateLevel();
  }, [level]);

  const checkIntersection = (p1: Point, p2: Point, path: Point[]) => {
    if (path.length < 4) return false;
    // Semplificato: controlliamo se il nuovo punto è troppo vicino a punti vecchi del path (esclusi gli ultimi)
    for (let i = 0; i < path.length - 10; i++) {
      const d = Math.hypot(path[i].x - p2.x, path[i].y - p2.y);
      if (d < 2) return true;
    }
    return false;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    // Inizia solo dal nodo 1
    const node1 = nodes.find(n => n.id === 1);
    if (node1 && Math.hypot(node1.x - px, node1.y - py) < 8) {
      setIsDrawing(true);
      setNextId(2);
      setCurrentPath([{ x: node1.x, y: node1.y }]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint = { x: px, y: py };
    const lastPoint = currentPath[currentPath.length - 1];

    // Controllo intersezioni
    if (checkIntersection(lastPoint, newPoint, currentPath)) {
      onFailure();
      resetLevel();
      return;
    }

    // Controllo se tocca nodi sbagliati
    for (const node of nodes) {
      const dist = Math.hypot(node.x - px, node.y - py);
      if (dist < 6) {
        if (node.id === nextId) {
          // Nodo corretto raggiunto
          if (node.id === nodes.length) {
            onSuccess(30);
            setLevel(prev => prev + 1);
            setIsDrawing(false);
            return;
          }
          setNextId(prev => prev + 1);
        } else if (node.id > nextId || (node.id < nextId && node.id !== nextId - 1)) {
          // Toccato un nodo fuori sequenza
          onFailure();
          resetLevel();
          return;
        }
      }
    }

    setCurrentPath(prev => [...prev, newPoint]);
  };

  const handlePointerUp = () => {
    if (isDrawing && nextId <= nodes.length) {
      // Se rilascia prima di finire, ricomincia
      onFailure();
      resetLevel();
    }
    setIsDrawing(false);
  };

  const resetLevel = () => {
    setNextId(1);
    setCurrentPath([]);
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full h-[65vh] relative select-none">
      <h2 className="text-3xl font-kids text-rose-600">Disegna il Sentiero! 🗺️</h2>
      <p className="text-lg font-kids text-rose-500 mb-2">Trascina dal numero 1 fino alla fine senza incrociare!</p>
      
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex-1 w-full max-w-2xl bg-white/80 rounded-3xl border-4 border-rose-200 relative overflow-hidden touch-none cursor-crosshair shadow-xl"
      >
        {/* Drawing Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {currentPath.length > 1 && (
            <polyline
              points={currentPath.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#fb7185"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ transform: 'scale(0.01)', transformOrigin: '0 0' }}
              className="scale-[100]"
            />
          )}
          {/* Versione visibile corretta per SVG percentuali */}
          <path
             d={currentPath.length > 0 ? `M ${currentPath[0].x} ${currentPath[0].y} ${currentPath.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}` : ''}
             fill="none"
             stroke="#fb7185"
             strokeWidth="8"
             strokeLinecap="round"
             strokeLinejoin="round"
             className="opacity-60"
          />
        </svg>

        {nodes.map(node => (
          <div
            key={node.id}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className={`
              absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full shadow-lg
              flex items-center justify-center font-kids text-2xl transition-all border-4 pointer-events-none
              ${node.id < nextId ? 'bg-rose-500 text-white border-rose-200' : 
                node.id === nextId ? 'bg-white text-rose-600 border-rose-400 scale-110 animate-pulse' : 
                'bg-rose-100 text-rose-400 border-rose-200'}
            `}
          >
            {node.id}
          </div>
        ))}

        {isDrawing && currentPath.length > 0 && (
           <div 
            style={{ left: `${currentPath[currentPath.length-1].x}%`, top: `${currentPath[currentPath.length-1].y}%` }}
            className="absolute w-6 h-6 bg-rose-400 rounded-full -translate-x-1/2 -translate-y-1/2 blur-sm pointer-events-none"
           />
        )}
      </div>
    </div>
  );
};

export default PathFollowingGame;
