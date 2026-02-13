
import React, { useState, useEffect } from 'react';

interface SpatialGameProps {
  onSuccess: (points: number) => void;
  onFailure: () => void;
}

const ITEMS = ['🚀', '🚁', '🛸', '✈️', '⛵', '🚲'];
const ROTATIONS = [0, 90, 180, 270];

const SpatialGame: React.FC<SpatialGameProps> = ({ onSuccess, onFailure }) => {
  const [targetItem, setTargetItem] = useState('');
  const [targetRotation, setTargetRotation] = useState(0);
  const [options, setOptions] = useState<number[]>([]);

  const generateLevel = () => {
    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const rot = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
    setTargetItem(item);
    setTargetRotation(rot);
    
    // Shuffle rotations for options
    const shuffled = [...ROTATIONS].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  };

  useEffect(() => {
    generateLevel();
  }, []);

  const handleChoice = (rot: number) => {
    if (rot === targetRotation) {
      onSuccess(15);
      generateLevel();
    } else {
      onFailure();
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <h2 className="text-3xl font-kids text-emerald-700">Com'è girato? 🧭</h2>
      
      <div className="bg-white p-8 rounded-full shadow-inner border-8 border-emerald-100">
        <div 
          className="text-8xl transition-transform duration-500"
          style={{ transform: `rotate(${targetRotation}deg)` }}
        >
          {targetItem}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-2xl px-4 mt-4">
        {options.map((rot, i) => (
          <button
            key={i}
            onClick={() => handleChoice(rot)}
            className="aspect-square bg-emerald-50 rounded-3xl shadow-lg flex items-center justify-center text-5xl hover:bg-emerald-100 border-4 border-emerald-200 transform active:scale-90"
          >
             <div style={{ transform: `rotate(${rot}deg)` }}>
              {targetItem}
            </div>
          </button>
        ))}
      </div>
      <p className="text-lg font-kids text-emerald-600">Tocca l'oggetto orientato nello stesso modo!</p>
    </div>
  );
};

export default SpatialGame;
