
import React from 'react';
import { GameType } from '../types';

interface GameCardProps {
  type: GameType;
  title: string;
  icon: string;
  color: string;
  description: string;
  onClick: (type: GameType) => void;
}

const GameCard: React.FC<GameCardProps> = ({ type, title, icon, color, description, onClick }) => {
  return (
    <button
      onClick={() => onClick(type)}
      className={`${color} p-6 rounded-3xl shadow-xl transform transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-white border-4 border-white/30 w-full aspect-square md:aspect-auto h-full min-h-[220px]`}
    >
      <span className="text-6xl mb-4 filter drop-shadow-md">{icon}</span>
      <h3 className="text-2xl font-kids text-center leading-tight mb-2">{title}</h3>
      <p className="text-sm font-semibold opacity-90 text-center">{description}</p>
    </button>
  );
};

export default GameCard;
