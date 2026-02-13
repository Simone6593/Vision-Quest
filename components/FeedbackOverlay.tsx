
import React, { useEffect, useState } from 'react';

interface FeedbackOverlayProps {
  type: 'success' | 'error';
  message: string;
  onComplete: () => void;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ type, message, onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Piccola attivazione per permettere l'animazione di entrata
    const startTimer = setTimeout(() => setVisible(true), 10);
    
    const timer = setTimeout(() => {
      setVisible(false);
      // Aspettiamo la fine dell'animazione di uscita prima di chiamare onComplete
      setTimeout(onComplete, 300);
    }, 1500); // Ridotto a 1.5 secondi per non rallentare il flusso

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className={`
      fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none
      transition-all duration-500 ease-out transform
      ${visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
    `}>
      <div className={`
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
        px-10 py-4 rounded-full shadow-2xl flex items-center gap-4
        text-white border-4 border-white/50 backdrop-blur-sm
      `}>
        <span className="text-5xl drop-shadow-md animate-bounce">
          {type === 'success' ? '🌟' : '💡'}
        </span>
        <div className="flex flex-col">
          <p className="text-2xl font-kids tracking-wide leading-none">
            {message}
          </p>
          {type === 'success' && (
            <span className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">
              Grande lavoro!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackOverlay;
