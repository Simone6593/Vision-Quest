
import React, { useState, useEffect } from 'react';
import { GameType, GameState, Difficulty } from './types';
import { getMotivationalMessage, getGameInstruction } from './services/geminiService';
import DiscriminationGame from './games/DiscriminationGame';
import MemoryGame from './games/MemoryGame';
import SpatialGame from './games/SpatialGame';
import PathFollowingGame from './games/PathFollowingGame';
import SliceChallengeGame from './games/SliceChallengeGame';
import GameCard from './components/GameCard';
import FeedbackOverlay from './components/FeedbackOverlay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    isActive: false,
    gameType: null,
    difficulty: null,
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [instruction, setInstruction] = useState<string>('');
  const [aiMessage, setAiMessage] = useState<string>('Ciao! Scegli la difficoltà per iniziare!');

  const handleDifficultySelect = (diff: Difficulty) => {
    setGameState(prev => ({ ...prev, difficulty: diff }));
    setAiMessage(`Ottimo! Hai scelto ${diff === Difficulty.EASY ? 'Facile' : 'Medio'}. Ora scegli un gioco!`);
  };

  const handleGameSelect = async (type: GameType) => {
    setGameState(prev => ({ ...prev, gameType: type, isActive: true }));
    const instr = await getGameInstruction(type);
    setInstruction(instr);
  };

  const handleSuccess = async (points: number) => {
    setGameState(prev => ({ ...prev, score: prev.score + points, level: prev.level + 1 }));
    setFeedback({ type: 'success', message: 'Fantastico!' });
    
    if (gameState.level % 3 === 0) {
      const msg = await getMotivationalMessage(gameState.score + points, gameState.level);
      setAiMessage(msg);
    }
  };

  const handleFailure = () => {
    setFeedback({ type: 'error', message: 'Riprova!' });
  };

  const goHome = () => {
    setGameState(prev => ({ ...prev, isActive: false, gameType: null, difficulty: null }));
    setInstruction('');
    setAiMessage('Ciao! Scegli la difficoltà per iniziare!');
  };

  const goBackToDifficulty = () => {
    setGameState(prev => ({ ...prev, gameType: null, isActive: false }));
    setInstruction('');
  };

  const renderGame = () => {
    switch (gameState.gameType) {
      case GameType.DISCRIMINATION:
        return <DiscriminationGame onSuccess={handleSuccess} onFailure={handleFailure} />;
      case GameType.MEMORY:
        return <MemoryGame onSuccess={handleSuccess} onFailure={handleFailure} />;
      case GameType.SPATIAL:
        return <SpatialGame onSuccess={handleSuccess} onFailure={handleFailure} />;
      case GameType.PATH_FOLLOWING:
        return <PathFollowingGame onSuccess={handleSuccess} onFailure={handleFailure} />;
      case GameType.SLICE_CHALLENGE:
        return <SliceChallengeGame onSuccess={handleSuccess} onFailure={handleFailure} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col p-4 md:p-8 relative overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={gameState.gameType ? goBackToDifficulty : goHome}
            className="bg-white p-3 rounded-full shadow-md text-2xl hover:bg-sky-100 transition-colors border-2 border-sky-100"
          >
            {gameState.gameType ? '⬅️' : '🏠'}
          </button>
          <div className="bg-white px-6 py-2 rounded-full shadow-md border-b-4 border-sky-200">
            <h1 className="text-2xl font-kids text-sky-600">VisionQuest</h1>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-amber-400 px-6 py-2 rounded-full shadow-md text-white font-kids border-b-4 border-amber-600 hidden sm:block">
            Punti: {gameState.score}
          </div>
          <div className="bg-indigo-500 px-6 py-2 rounded-full shadow-md text-white font-kids border-b-4 border-indigo-700">
            Liv: {gameState.level}
          </div>
        </div>
      </header>

      {/* AI Assistant Bubble */}
      {!gameState.isActive && (
        <div className="mb-6 flex items-center justify-center gap-4 transition-all duration-500">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-lg border-4 border-sky-300 animate-bounce-slow flex-shrink-0">
            🦉
          </div>
          <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-md border-2 border-sky-100 relative max-w-md">
             <p className="text-md sm:text-lg font-semibold text-sky-800 leading-tight">
               {instruction || aiMessage}
             </p>
             <div className="absolute -left-3 top-0 w-4 h-4 bg-white border-l-2 border-sky-100 transform rotate-45"></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto">
        {!gameState.difficulty ? (
          /* Difficulty Selection */
          <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
            <h2 className="text-3xl font-kids text-sky-700">Quanto sei coraggioso?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <button 
                onClick={() => handleDifficultySelect(Difficulty.EASY)}
                className="bg-green-400 p-8 rounded-3xl shadow-xl hover:scale-105 transition-all text-white border-b-8 border-green-600"
              >
                <span className="text-6xl mb-4 block">👶</span>
                <span className="text-3xl font-kids block">FACILE</span>
                <span className="font-semibold opacity-90 mt-2 block">Per i più piccini (5-6 anni)</span>
              </button>
              <button 
                onClick={() => handleDifficultySelect(Difficulty.MEDIUM)}
                className="bg-orange-400 p-8 rounded-3xl shadow-xl hover:scale-105 transition-all text-white border-b-8 border-orange-600"
              >
                <span className="text-6xl mb-4 block">🦖</span>
                <span className="text-3xl font-kids block">MEDIO</span>
                <span className="font-semibold opacity-90 mt-2 block">Per i grandi esploratori (7-8 anni)</span>
              </button>
            </div>
          </div>
        ) : !gameState.isActive ? (
          /* Game Selection based on Difficulty */
          <div className="w-full">
             <h2 className="text-3xl font-kids text-center text-sky-700 mb-8">
               {gameState.difficulty === Difficulty.EASY ? 'Giochi Semplici ✨' : 'Sfide Difficili 🔥'}
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
               {gameState.difficulty === Difficulty.EASY ? (
                 <>
                   <GameCard 
                    type={GameType.DISCRIMINATION}
                    title="Occhio al Dettaglio"
                    icon="🔍"
                    color="bg-indigo-400"
                    description="Trova l'intruso!"
                    onClick={handleGameSelect}
                  />
                  <GameCard 
                    type={GameType.MEMORY}
                    title="Memoria Stellare"
                    icon="⭐"
                    color="bg-amber-400"
                    description="Ricorda la sequenza!"
                    onClick={handleGameSelect}
                  />
                  <GameCard 
                    type={GameType.SPATIAL}
                    title="Rotazioni Spaziali"
                    icon="🧭"
                    color="bg-emerald-400"
                    description="Guarda l'orientamento!"
                    onClick={handleGameSelect}
                  />
                 </>
               ) : (
                 <>
                   <GameCard 
                    type={GameType.PATH_FOLLOWING}
                    title="Traccia Sentiero"
                    icon="🗺️"
                    color="bg-rose-400"
                    description="Unisci i punti in ordine!"
                    onClick={handleGameSelect}
                  />
                  <GameCard 
                    type={GameType.SLICE_CHALLENGE}
                    title="Ninja delle Forme"
                    icon="⚔️"
                    color="bg-orange-500"
                    description="Taglia la frutta al volo!"
                    onClick={handleGameSelect}
                  />
                 </>
               )}
             </div>
          </div>
        ) : (
          <div className="w-full animate-in fade-in zoom-in duration-300">
            {renderGame()}
          </div>
        )}
      </main>

      {/* Feedback Overlay */}
      {feedback && (
        <FeedbackOverlay 
          type={feedback.type} 
          message={feedback.message} 
          onComplete={() => setFeedback(null)} 
        />
      )}

      {/* Footer background decor */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sky-200 to-transparent -z-10 opacity-30 pointer-events-none"></div>
    </div>
  );
};

export default App;
