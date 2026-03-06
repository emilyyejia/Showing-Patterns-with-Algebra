import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import GlossaryButton from '../components/GlossaryButton';
import GlossaryModal from '../components/GlossaryModal';

type RulePart = string;

interface Challenge {
  id: number;
  type: 'tiles' | 'graph' | 'table';
  visualData: any;
  correctSequence: string; 
  correctRule: RulePart[];
  allTiles: RulePart[];
  instruction: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    type: 'tiles',
    visualData: [4, 7, 10],
    correctSequence: '4, 7, 10',
    correctRule: ['start at 4', 'add 3', 'each figure'],
    allTiles: ['start at 4', 'add 3', 'each figure', 'double', 'subtract 2'],
    instruction: 'Look at the figures. What are the first three values?',
  },
  {
    id: 2,
    type: 'graph',
    visualData: [-10, -5, 0],
    correctSequence: '-10, -5, 0',
    correctRule: ['start at -10', 'add 5', 'each step'],
    allTiles: ['start at -10', 'add 5', 'each step', 'double', 'subtract 3'],
    instruction: 'Look at the number line. What are the first three values?',
  },
  {
    id: 3,
    type: 'table',
    visualData: { 1: 10, 2: 8, 3: 6 },
    correctSequence: '10, 8, 6',
    correctRule: ['start at 10', 'subtract 2', 'each term'],
    allTiles: ['start at 10', 'subtract 2', 'each term', 'half', 'add 2'],
    instruction: 'Look at the table. What are the first three values?',
  },
];

const PatternLevel2: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [currentIdx, setCurrentIdx] = useState(() => partialProgress?.currentIdx || 0);
  const [seqInput, setSeqInput] = useState('');
  const [isSeqValid, setIsSeqValid] = useState(false);
  const [selectedTiles, setSelectedTiles] = useState<RulePart[]>([]);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  const [isAllComplete, setIsAllComplete] = useState(false);
  const [validationStatus, setValidationStatus] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  
  const isCompletedRef = useRef(false);
  const currentChallenge = CHALLENGES[currentIdx];

  const shuffledTiles = useMemo(() => {
    return [...currentChallenge.allTiles].sort(() => 0.5 - Math.random());
  }, [currentIdx]);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ currentIdx });
      }
    };
  }, [currentIdx]);

  const handleTileClick = (tile: RulePart) => {
    setFeedback(null);
    setValidationStatus(prev => ({ ...prev, [tile]: null }));
    if (selectedTiles.includes(tile)) {
      setSelectedTiles(prev => prev.filter(t => t !== tile));
    } else if (selectedTiles.length < 3) {
      setSelectedTiles(prev => [...prev, tile]);
    }
  };

  const checkSeq = () => {
    const cleanedInput = seqInput.replace(/\s/g, '');
    const cleanedCorrect = currentChallenge.correctSequence.replace(/\s/g, '');
    if (cleanedInput === cleanedCorrect) {
        setIsSeqValid(true);
        setValidationStatus(prev => ({ ...prev, seqInput: 'correct' }));
        setFeedback({ type: 'correct', message: "Excellent! Now build the rule." });
        setTimeout(() => setFeedback(null), 1500);
    } else {
        setValidationStatus(prev => ({ ...prev, seqInput: 'incorrect' }));
        setFeedback({ type: 'incorrect', message: "Try again!" });
    }
  };

  const handleCheck = () => {
    // Keep internal order, check against sorted version
    const sortedSelected = [...selectedTiles].sort();
    const sortedCorrect = [...currentChallenge.correctRule].sort();
    const isRuleCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);

    const status: Record<string, 'correct' | 'incorrect' | null> = {};
    selectedTiles.forEach(tile => {
      status[tile] = currentChallenge.correctRule.includes(tile) ? 'correct' : 'incorrect';
    });
    setValidationStatus(prev => ({ ...prev, ...status }));

    if (isRuleCorrect) {
      const messages = ["Great job!", "Excellent work!", "Perfect!", "Amazing!"];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setFeedback({ type: 'correct', message: randomMessage });
      setTimeout(() => {
        setFeedback(null);
        setValidationStatus({});
        setSeqInput('');
        setIsSeqValid(false);
        setSelectedTiles([]);
        if (currentIdx < CHALLENGES.length - 1) {
          setCurrentIdx(prev => prev + 1);
        } else {
          setIsAllComplete(true);
        }
      }, 1500);
    } else {
      setFeedback({ type: 'incorrect', message: "Try again! Examine the pattern carefully." });
    }
  };

  const renderVisual = () => {
    switch (currentChallenge.type) {
      case 'tiles':
        return (
          <div className="flex items-center justify-center gap-8 h-48 bg-gray-900/50 p-6 rounded-xl border border-gray-700 overflow-x-auto">
            {currentChallenge.visualData.map((val: number, i: number) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`grid ${val > 8 ? 'grid-cols-5' : 'grid-cols-4'} gap-1`}>
                  {Array.from({ length: val }).map((_, j) => (
                    <div key={j} className="w-4 h-4 bg-amber-500 rounded-sm" />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-bold uppercase">Fig {i+1}</span>
              </div>
            ))}
          </div>
        );
      case 'graph':
        return (
          <div className="flex items-center justify-center h-48 bg-gray-900/50 p-6 rounded-xl border border-gray-700 relative overflow-hidden">
             <div className="absolute w-full h-px bg-gray-600 top-1/2" />
             <div className="flex justify-between w-full px-12 relative z-10">
               {[-10, -5, 0, 5, 10, 15].map((val, i) => {
                 const isChallengeValue = currentChallenge.correctSequence.includes(String(val));
                 const shouldBeColored = isChallengeValue || val === -10 || val === 15;
                 return (
                   <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 rounded-full transition-all duration-500 ${shouldBeColored ? 'bg-orange-500 scale-125 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-gray-700 border border-gray-500'}`} />
                      <span className="text-xs font-mono">{val}</span>
                   </div>
                 );
               })}
             </div>
          </div>
        );
      case 'table':
        return (
          <div className="flex items-center justify-center h-48 bg-gray-900/50 p-6 rounded-xl border border-gray-700">
            <table className="w-48 border-collapse border border-gray-600">
              <thead>
                <tr className="bg-gray-800 text-xs">
                  <th className="border border-gray-600 p-2">Term (n)</th>
                  <th className="border border-gray-600 p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(currentChallenge.visualData).map(([n, val]) => (
                  <tr key={n}>
                    <td className="border border-gray-600 p-2 text-center text-sm">{n}</td>
                    <td className="border border-gray-600 p-2 text-center text-sm font-bold text-amber-500">{val as number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  if (isAllComplete) {
    return (
        <div className="flex flex-col items-center justify-center min-h-full p-8 text-center animate-fade-in">
            <h2 className="text-4xl font-bold text-emerald-400 mb-6">Level Complete!</h2>
            <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3].map(i => <StarIcon key={i} filled={true} className="w-16 h-16 text-yellow-400" />)}
            </div>
            <p className="text-xl text-gray-300 mb-10">You've mastered pattern translation!</p>
            <button onClick={onExit} className="bg-emerald-600 hover:bg-emerald-500 px-12 py-4 rounded-2xl font-black text-xl shadow-lg transition-transform hover:scale-105 active:scale-95">Back to Map</button>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 text-white bg-gray-900 font-sans max-w-6xl mx-auto">
      <GlossaryButton onClick={() => setIsGlossaryOpen(true)} />
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      <InstructionModal
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        title="Level 2: Pattern Builder"
      >
        <p>Your goal is to look at a representation of a pattern and translate it into two things:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>Numeric Sequence:</strong> The actual numbers shown (e.g., 2, 4, 6).</li>
          <li><strong>Rule:</strong> Three tiles that describe how it starts and how it changes.</li>
        </ul>
      </InstructionModal>

      <div className="flex gap-4 mb-8">
        {CHALLENGES.map((_, i) => (
          <button 
            key={i} 
            onClick={() => { setCurrentIdx(i); setSeqInput(''); setIsSeqValid(false); setSelectedTiles([]); }}
            className={`h-4 w-4 rounded-full transition-all duration-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${currentIdx >= i ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]' : 'bg-gray-700'}`} 
            aria-label={`Go to task ${i + 1}`}
          />
        ))}
      </div>

      <div className={`w-full transition-all duration-700 ease-in-out ${isSeqValid ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : 'flex justify-center'}`}>
        <div className={`bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 flex flex-col h-full transition-all duration-700 ease-in-out ${isSeqValid ? 'w-full' : 'w-full max-w-xl'}`}>
          <p className="text-white mb-6 text-2xl font-bold leading-relaxed">{currentChallenge.instruction}</p>
          {renderVisual()}
          <div className="mt-auto pt-8">
            <label className="block text-sm font-bold text-gray-400 mb-3">Type the first three values:</label>
            <div className="flex gap-3">
                <input 
                  type="text"
                  className={`w-full bg-gray-900 border-2 ${isSeqValid ? 'border-emerald-500' : validationStatus.seqInput === 'incorrect' ? 'border-rose-500' : 'border-gray-700'} focus:border-amber-500 rounded-xl p-4 text-xl font-mono text-amber-400 tracking-widest focus:outline-none transition-colors`}
                  placeholder="e.g. -10, -5, 0"
                  value={seqInput}
                  onChange={e => { setSeqInput(e.target.value); setFeedback(null); setValidationStatus(prev => ({ ...prev, seqInput: null })); }}
                  disabled={isSeqValid}
                />
                {!isSeqValid && <button onClick={checkSeq} className="bg-sky-600 px-6 rounded-xl font-black transition-all hover:bg-sky-500 active:scale-95">Check</button>}
            </div>
            {feedback && feedback.type === 'correct' && !isSeqValid && (
              <div className="mt-3 text-emerald-400 font-semibold animate-fade-in">
                {feedback.message}
              </div>
            )}
            {feedback && feedback.type === 'incorrect' && !isSeqValid && (
              <div className="mt-3 text-yellow-400 font-semibold animate-fade-in">
                {feedback.message}
              </div>
            )}
          </div>
        </div>

        {isSeqValid && (
          <div className="bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 flex flex-col h-full animate-fade-in">
            {selectedTiles.length === 0 && <p className="text-gray-400 font-medium mb-4">Click 3 tiles below to build the rule.</p>}
            <div className="flex gap-4 mb-10 min-h-[80px] p-4 bg-gray-900/50 rounded-2xl border border-dashed border-gray-600 justify-center items-center">
               {selectedTiles.map((tile, i) => {
                 const status = validationStatus[tile];
                 const bgColor = status === 'correct' ? 'bg-emerald-600' : status === 'incorrect' ? 'bg-rose-600' : 'bg-sky-600';
                 return (
                   <div key={i} onClick={() => handleTileClick(tile)} className={`${bgColor} px-4 py-2 rounded-lg font-bold text-sm shadow-lg cursor-pointer hover:bg-rose-500 transition-colors flex items-center gap-2`}>
                     {tile} <span className="text-white/50 text-xs">✕</span>
                   </div>
                 );
               })}
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {shuffledTiles.map((tile, i) => {
                const isSelected = selectedTiles.includes(tile);
                return (
                  <button
                    key={i}
                    onClick={() => handleTileClick(tile)}
                    className={`px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md transform hover:scale-105 active:scale-95 ${
                      isSelected ? 'bg-gray-700 text-gray-500 line-through cursor-not-allowed opacity-50' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {tile}
                  </button>
                );
              })}
            </div>
            <div className="mt-auto pt-10">
              {feedback && feedback.type === 'correct' && isSeqValid && (
                <div className="mb-4 text-emerald-400 font-semibold animate-fade-in">
                  {feedback.message}
                </div>
              )}
              {feedback && feedback.type === 'incorrect' && isSeqValid && (
                <div className="mb-4 text-yellow-400 font-semibold animate-fade-in">
                  {feedback.message}
                </div>
              )}
              <button 
                onClick={handleCheck}
                disabled={selectedTiles.length < 3}
                className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 px-8 py-5 rounded-2xl font-black text-xl shadow-lg active:scale-95 flex items-center justify-center gap-4"
              >
                Check
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} className={className}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const PatternLevel2Wrapper: React.FC<LevelComponentProps> = (props) => (
  <DndProvider backend={HTML5Backend}><PatternLevel2 {...props} /></DndProvider>
);

export default PatternLevel2Wrapper;
