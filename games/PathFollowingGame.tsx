
import React, { useState, useEffect } from 'react';

interface PathFollowingGameProps {
  onSuccess: (points: number) => void;
  onFailure: () => void;
}

interface Node {
  id: number;
  x: number;
  y: number;
}

const PathFollowingGame: React.FC<PathFollowingGameProps> = ({ onSuccess, onFailure }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nextId, setNextId] = useState(1);
  const [level, setLevel] = useState(1);

  const generateLevel = () => {
    const nodeCount = level + 3;
    const newNodes: Node[] = [];
    const usedPositions: { x: number; y: number }[] = [];

    for (let i = 1; i <= nodeCount; i++) {
      let x, y, tooClose;
      do {
        x = 15 + Math.random() * 70;
        y = 15 + Math.random() * 70;
        tooClose = usedPositions.some(p => Math.hypot(p.x - x, p.y - y) < 15);
      } while (tooClose);
      
      newNodes.push({ id: i, x, y });
      usedPositions.push({ x, y });
    }
    setNodes(newNodes);
    setNextId(1);
  };

  useEffect(() => {
    generateLevel();
  }, [level]);

  const handleNodeClick = (id: number) => {
    if (id === nextId) {
      if (id === nodes.length) {
        onSuccess(25);
        setLevel(prev => prev + 1);
      } else {
        setNextId(id + 1);
      }
    } else {
      onFailure();
      setNextId(1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full h-[60vh] relative">
      <h2 className="text-3xl font-kids text-rose-600">Segui il Sentiero! 🗺️</h2>
      <p className="text-lg font-kids text-rose-500 mb-4">Tocca i numeri in ordine: 1, 2, 3...</p>
      
      <div className="flex-1 w-full max-w-2xl bg-white/50 rounded-3xl border-4 border-rose-200 relative overflow-hidden">
        {/* Draw lines between completed nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map((node, i) => {
            if (i > 0 && node.id < nextId) {
              const prev = nodes[i - 1];
              return (
                <line
                  key={`line-${i}`}
                  x1={`${prev.x}%`}
                  y1={`${prev.y}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke="#fb7185"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="10,5"
                />
              );
            }
            return null;
          })}
        </svg>

        {nodes.map(node => (
          <button
            key={node.id}
            onClick={() => handleNodeClick(node.id)}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className={`
              absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full shadow-lg
              flex items-center justify-center font-kids text-2xl transition-all border-4
              ${node.id < nextId ? 'bg-rose-500 text-white border-rose-200' : 
                node.id === nextId ? 'bg-white text-rose-600 border-rose-400 scale-110 animate-pulse' : 
                'bg-rose-100 text-rose-400 border-rose-200 opacity-60'}
            `}
          >
            {node.id}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PathFollowingGame;
