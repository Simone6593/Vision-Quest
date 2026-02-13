
import React, { useState, useEffect, useCallback } from 'react';

interface MemoryGameProps {
  onSuccess: (points: number) => void;
  onFailure: () => void;
}

const ANIMALS = ['🦁', '🐯', '🦒', '🐘', '🦓', '🦘'];

const MemoryGame: React.FC<MemoryGameProps> = ({ onSuccess, onFailure }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [level, setLevel] = useState(1);

  const startLevel = useCallback(async () => {
    const newSeq = Array.from({ length: level + 1 }, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setUserSequence([]);
    setIsPlaying(true);

    // Initial pause before sequence starts
    await new Promise(r => setTimeout(r, 1000));

    for (let i = 0; i < newSeq.length; i++) {
      setHighlightedIndex(newSeq[i]);
      await new Promise(r => setTimeout(r, 900)); // Increased from 600
      setHighlightedIndex(null);
      await new Promise(r => setTimeout(r, 400)); // Increased from 200
    }
    setIsPlaying(false);
  }, [level]);

  useEffect(() => {
    startLevel();
  }, [level, startLevel]);

  const handleInput = (index: number) => {
    if (isPlaying) return;

    const nextUserSeq = [...userSequence, index];
    setUserSequence(nextUserSeq);

    if (index !== sequence[userSequence.length]) {
      onFailure();
      setUserSequence([]);
      startLevel();
      return;
    }

    if (nextUserSeq.length === sequence.length) {
      onSuccess(20);
      setLevel(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <h2 className="text-3xl font-kids text-amber-600">Ricorda la sequenza! 🧠</h2>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm px-4">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            onClick={() => handleInput(i)}
            disabled={isPlaying}
            className={`
              aspect-square rounded-3xl shadow-xl flex items-center justify-center text-5xl transition-all border-8
              ${highlightedIndex === i ? 'scale-110 border-white bg-white shadow-2xl' : 'scale-100 border-transparent'}
              ${i === 0 ? 'bg-red-400' : i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-green-400' : 'bg-yellow-400'}
              ${isPlaying ? 'cursor-not-allowed' : 'active:scale-95'}
            `}
          >
            {ANIMALS[i]}
          </button>
        ))}
      </div>
      <p className="text-xl font-kids text-amber-700">
        {isPlaying ? 'Osserva bene...' : `Tocca i simboli! (${userSequence.length}/${sequence.length})`}
      </p>
    </div>
  );
};

export default MemoryGame;
