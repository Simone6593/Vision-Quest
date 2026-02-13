
import React, { useState, useEffect, useCallback } from 'react';

interface DiscriminationGameProps {
  onSuccess: (points: number) => void;
  onFailure: () => void;
}

const SHAPES = ['🍎', '🍌', '🍇', '🍓', '🍍', '🥝', '🍒', '🥭'];
const COLORS = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200'];

const DiscriminationGame: React.FC<DiscriminationGameProps> = ({ onSuccess, onFailure }) => {
  const [options, setOptions] = useState<{ icon: string; id: number; isOdd: boolean }[]>([]);
  const [level, setLevel] = useState(1);

  const generateLevel = useCallback(() => {
    const commonIcon = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    let oddIcon = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    while (oddIcon === commonIcon) {
      oddIcon = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    }

    const count = level > 5 ? 8 : level > 2 ? 6 : 4;
    const newOptions = Array.from({ length: count }, (_, i) => ({
      icon: commonIcon,
      id: i,
      isOdd: false,
    }));

    const oddIndex = Math.floor(Math.random() * count);
    newOptions[oddIndex] = { icon: oddIcon, id: oddIndex, isOdd: true };
    setOptions(newOptions);
  }, [level]);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  const handleChoice = (isOdd: boolean) => {
    if (isOdd) {
      onSuccess(10);
      setLevel(prev => prev + 1);
    } else {
      onFailure();
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <h2 className="text-3xl font-kids text-indigo-800">Trova l'intruso! 🔍</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-2xl px-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleChoice(opt.isOdd)}
            className="aspect-square bg-white rounded-3xl shadow-lg flex items-center justify-center text-6xl hover:bg-sky-50 transition-colors border-4 border-indigo-100 transform active:scale-90"
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiscriminationGame;
