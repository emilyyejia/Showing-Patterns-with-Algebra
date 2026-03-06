import React from 'react';

interface CompletionModalProps {
  stars: number;
  isLastLevel: boolean;
  onReplay: () => void;
  onNext: () => void;
  onBackToMap: () => void;
}

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill={filled ? "#FACC15" : "none"} 
    stroke={filled ? "#FACC15" : "#9CA3AF"} 
    strokeWidth={filled ? 0 : 2}
    className={className}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CompletionModal: React.FC<CompletionModalProps> = ({ 
  stars, 
  isLastLevel, 
  onReplay, 
  onNext, 
  onBackToMap 
}) => {
  // Determine title based on stars
  const title = stars === 1 ? "Good Effort!" : "Level Complete!";
  
  // Determine message based on stars
  const getMessage = () => {
    if (stars === 1) {
      return (
        <>
          <p className="text-gray-300 text-lg mb-2">You need 2 stars to unlock the next level.</p>
          <p className="text-gray-400 text-base">Answer correctly on the first try to earn more stars!</p>
        </>
      );
    } else if (stars === 2) {
      return <p className="text-gray-300 text-lg">Answer correctly on the first try to earn more stars!</p>;
    }
    return null; // No message for 3 stars
  };

  // Determine buttons based on stars and level position
  const renderButtons = () => {
    if (stars === 1) {
      return (
        <button
          onClick={onReplay}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 px-12 rounded-2xl text-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 uppercase tracking-wide"
        >
          Replay
        </button>
      );
    } else if (stars === 2) {
      return (
        <div className="flex gap-4">
          <button
            onClick={onReplay}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-4 px-10 rounded-2xl text-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 uppercase tracking-wide"
          >
            Replay
          </button>
          <button
            onClick={isLastLevel ? onBackToMap : onNext}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-10 rounded-2xl text-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 uppercase tracking-wide"
          >
            {isLastLevel ? 'Back to Map' : 'Next Level'}
          </button>
        </div>
      );
    } else {
      // stars === 3
      return (
        <button
          onClick={isLastLevel ? onBackToMap : onNext}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-12 rounded-2xl text-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 uppercase tracking-wide"
        >
          {isLastLevel ? 'Back to Map' : 'Next Level'}
        </button>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[300] animate-fade-in p-4">
      <div className="bg-gray-800 rounded-3xl p-12 max-w-2xl w-full text-center border-4 border-gray-700 shadow-2xl">
        {/* Title */}
        <h2 className="text-5xl font-black text-white mb-8 uppercase tracking-tight">
          {title}
        </h2>
        
        {/* Stars Display */}
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <StarIcon 
              key={i} 
              filled={i <= stars} 
              className="w-20 h-20"
            />
          ))}
        </div>
        
        {/* Message */}
        <div className="mb-10 min-h-[60px] flex flex-col items-center justify-center">
          {getMessage()}
        </div>
        
        {/* Buttons */}
        <div className="flex justify-center">
          {renderButtons()}
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;
