
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

type Stage = 1 | 2 | 3;

const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} className={className}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const PatternLevel3: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [stage, setStage] = useState<Stage>(() => partialProgress?.stage || 1);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  const [isAllComplete, setIsAllComplete] = useState(false);

  const [selection, setSelection] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ stage });
      }
    };
  }, [stage]);

  const handleCorrect = (nextStage?: Stage) => {
    setFeedback({ type: 'correct' });
    setTimeout(() => {
      setFeedback(null);
      setSelection(null);
      setValidationStatus({});
      if (nextStage) setStage(nextStage);
      else {
        setIsAllComplete(true);
        isCompletedRef.current = true;
        onComplete(3);
      }
    }, 1500);
  };

  const handleIncorrect = (msg: string) => {
    setFeedback({ type: 'incorrect', message: msg });
  };

  const validate = () => {
    if (stage === 1) {
      const isCorrect = selection === 'A';
      setValidationStatus({ selection: isCorrect ? 'correct' : 'incorrect' });
      if (isCorrect) handleCorrect(2);
      else handleIncorrect("Linear patterns must form a perfectly straight line on a graph.");
    } else if (stage === 2) {
      const isCorrect = selection === 'B';
      setValidationStatus({ selection: isCorrect ? 'correct' : 'incorrect' });
      if (isCorrect) handleCorrect(3);
      else handleIncorrect("Check the differences! A: 1, 2, 4, 8 (doubling). B: 3, 6, 9, 12 (+3 constant). Linear patterns add the SAME amount.");
    } else if (stage === 3) {
      const isCorrect = selection === 'Linear';
      setValidationStatus({ selection: isCorrect ? 'correct' : 'incorrect' });
      if (isCorrect) handleCorrect();
      else handleIncorrect("Sequence: 10, 20, 30, 40. It adds 10 every time. That's a constant difference, so it's Linear!");
    }
  };

  if (isAllComplete) {
    return (
        <div className="flex flex-col items-center justify-center min-h-full p-8 text-center animate-fade-in">
            <h2 className="text-4xl font-bold text-emerald-400 mb-6 uppercase italic">Linearity Mastered!</h2>
            <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3].map(i => <StarIcon key={i} filled={true} className="w-16 h-16 text-yellow-400" />)}
            </div>
            <p className="text-xl text-gray-300 mb-10 max-w-md">You can now distinguish between steady linear growth and changing non-linear growth.</p>
            <button onClick={onExit} className="bg-emerald-600 hover:bg-emerald-500 px-12 py-4 rounded-2xl font-black text-xl shadow-lg transition-transform hover:scale-105 active:scale-95">Return to Map</button>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 text-white bg-gray-900 font-sans max-w-6xl mx-auto relative select-none">
      <InstructionButton onClick={() => setIsInstructionOpen(true)} />
      <InstructionModal isOpen={isInstructionOpen} onClose={() => setIsInstructionOpen(false)} title="Mastering Linearity">
        <p className="mb-4"><strong>Linear Patterns</strong> follow a straight line because the <strong>change is always the same</strong> (Constant Difference).</p>
        <p>If the growth changes—like doubling or squaring—the pattern is <strong>Non-Linear</strong> and will curve on a graph.</p>
      </InstructionModal>

      <h1 className="text-3xl font-bold mb-4 text-sky-300 uppercase italic">Linearity Detective</h1>

      <div className="flex gap-4 mb-8">
        {[1, 2, 3].map(i => (
          <button 
            key={i} 
            onClick={() => { setStage(i as Stage); setSelection(null); setFeedback(null); }}
            className={`h-4 w-4 rounded-full transition-all duration-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${stage >= i ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]' : 'bg-gray-700'}`} 
            aria-label={`Go to task ${i}`}
          />
        ))}
      </div>

      {feedback && (
        <div className={`fixed top-24 px-8 py-4 rounded-2xl font-bold shadow-2xl z-[200] animate-fade-in ${
          feedback.type === 'correct' ? 'bg-emerald-500' : 'bg-rose-600 border-2 border-rose-400'
        }`}>
          {feedback.message || (feedback.type === 'correct' ? '✨ Perfect!' : 'Try again!')}
        </div>
      )}

      <div className="w-full max-w-4xl bg-gray-800 rounded-3xl p-10 shadow-2xl border border-gray-700 flex flex-col items-center">
        {stage === 1 && (
          <div className="animate-fade-in w-full flex flex-col items-center">
            <h2 className="text-xl font-bold mb-8 text-indigo-200 text-center">Which graph represents a <span className="text-sky-300 underline underline-offset-8">Linear Pattern</span>?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-10">
              <button onClick={() => { setSelection('A'); setFeedback(null); setValidationStatus({}); }} className={`group bg-white p-6 rounded-3xl border-4 transition-all ${selection === 'A' ? (validationStatus.selection === 'correct' ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : validationStatus.selection === 'incorrect' ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-sky-500 shadow-2xl') : 'border-transparent hover:border-slate-300'} ${selection === 'A' ? 'scale-105' : ''}`}>
                <span className={`font-bold block mb-4 ${selection === 'A' && validationStatus.selection === 'incorrect' ? 'text-rose-600' : 'text-slate-900'}`}>Graph A</span>
                <svg viewBox="0 0 100 100" className="w-full h-auto">
                    <line x1="10" y1="90" x2="90" y2="90" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="10" y1="90" x2="10" y2="10" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="10" y1="90" x2="90" y2="10" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="30" cy="70" r="3" fill="#1d4ed8" /><circle cx="50" cy="50" r="3" fill="#1d4ed8" /><circle cx="70" cy="30" r="3" fill="#1d4ed8" />
                </svg>
              </button>
              <button onClick={() => { setSelection('B'); setFeedback(null); setValidationStatus({}); }} className={`group bg-white p-6 rounded-3xl border-4 transition-all ${selection === 'B' ? (validationStatus.selection === 'correct' ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : validationStatus.selection === 'incorrect' ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-sky-500 shadow-2xl') : 'border-transparent hover:border-slate-300'} ${selection === 'B' ? 'scale-105' : ''}`}>
                <span className={`font-bold block mb-4 ${selection === 'B' && validationStatus.selection === 'incorrect' ? 'text-rose-600' : 'text-slate-900'}`}>Graph B</span>
                <svg viewBox="0 0 100 100" className="w-full h-auto">
                    <line x1="10" y1="90" x2="90" y2="90" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="10" y1="90" x2="10" y2="10" stroke="#cbd5e1" strokeWidth="2" />
                    <path d="M 10 90 Q 50 85, 90 10" fill="none" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="20" cy="88" r="3" fill="#be123c" /><circle cx="45" cy="80" r="3" fill="#be123c" /><circle cx="75" cy="40" r="3" fill="#be123c" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {stage === 2 && (
          <div className="animate-fade-in w-full flex flex-col items-center">
            <h2 className="text-xl font-bold mb-8 text-indigo-200 text-center">Which table has a <span className="text-emerald-400 italic">Constant Difference</span>?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-10">
               <button onClick={() => { setSelection('A'); setFeedback(null); setValidationStatus({}); }} className={`p-8 rounded-3xl border-2 transition-all bg-gray-900/50 ${selection === 'A' ? (validationStatus.selection === 'correct' ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : validationStatus.selection === 'incorrect' ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-sky-500 bg-gray-900 shadow-2xl') : 'border-gray-700 hover:border-gray-600'} ${selection === 'A' ? 'scale-105' : ''}`}>
                  <span className={`font-bold block mb-6 text-lg uppercase tracking-widest ${selection === 'A' && validationStatus.selection === 'incorrect' ? 'text-rose-400' : 'text-indigo-300'}`}>Table A</span>
                  <table className="w-full text-center border-collapse">
                    <thead className="text-[10px] uppercase text-slate-500"><tr><th className="p-2 border-b border-gray-700">n</th><th className="p-2 border-b border-gray-700">Value</th></tr></thead>
                    <tbody className="text-2xl font-mono">
                        <tr><td className="p-2 border-r border-gray-800">1</td><td className="p-2 text-sky-400">1</td></tr>
                        <tr><td className="p-2 border-r border-gray-800">2</td><td className="p-2 text-sky-400">2</td></tr>
                        <tr><td className="p-2 border-r border-gray-800">3</td><td className="p-2 text-sky-400">4</td></tr>
                        <tr><td className="p-2 border-r border-gray-800">4</td><td className="p-2 text-sky-400">8</td></tr>
                    </tbody>
                  </table>
               </button>
               <button onClick={() => { setSelection('B'); setFeedback(null); setValidationStatus({}); }} className={`p-8 rounded-3xl border-2 transition-all bg-gray-900/50 ${selection === 'B' ? (validationStatus.selection === 'correct' ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : validationStatus.selection === 'incorrect' ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-sky-500 bg-gray-900 shadow-2xl') : 'border-gray-700 hover:border-gray-600'} ${selection === 'B' ? 'scale-105' : ''}`}>
                  <span className={`font-bold block mb-6 text-lg uppercase tracking-widest ${selection === 'B' && validationStatus.selection === 'incorrect' ? 'text-rose-400' : 'text-emerald-400'}`}>Table B</span>
                  <table className="w-full text-center border-collapse">
                    <thead className="text-[10px] uppercase text-slate-500"><tr><th className="p-2 border-b border-gray-700">n</th><th className="p-2 border-b border-gray-700">Value</th></tr></thead>
                    <tbody className="text-2xl font-mono">
                        <tr><td className="p-2 border-r border-gray-800">1</td><td className="p-2 text-emerald-400">3</td></tr>
                        <tr><td className="p-2 border-r border-gray-800">2</td><td className="p-2 text-emerald-400">6</td></tr>
                        <tr><td className="p-2 border-r border-gray-800">3</td><td className="p-2 text-emerald-400">9</td></tr>
                        <tr><td className="p-2 border-r border-gray-800">4</td><td className="p-2 text-emerald-400">12</td></tr>
                    </tbody>
                  </table>
               </button>
            </div>
          </div>
        )}

        {stage === 3 && (
          <div className="animate-fade-in w-full flex flex-col items-center text-center">
             <h2 className="text-xl font-bold mb-8 text-indigo-200">Classify this sequence:</h2>
             <div className="bg-gray-900 px-10 py-8 rounded-3xl border-2 border-gray-700 text-5xl font-mono tracking-[0.2em] text-indigo-300 mb-10 shadow-inner">10, 20, 30, 40...</div>
             <div className="grid grid-cols-2 gap-4 w-full max-w-xl mb-10">
                <button onClick={() => { setSelection('Linear'); setFeedback(null); setValidationStatus({}); }} className={`py-5 rounded-2xl border-2 font-bold text-xl uppercase transition-all ${selection === 'Linear' ? (validationStatus.selection === 'correct' ? 'bg-emerald-600 border-emerald-400 shadow-lg' : validationStatus.selection === 'incorrect' ? 'bg-rose-600 border-rose-400 shadow-lg' : 'bg-sky-600 border-sky-400 scale-105 shadow-lg') : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}>Linear</button>
                <button onClick={() => { setSelection('Non-Linear'); setFeedback(null); setValidationStatus({}); }} className={`py-5 rounded-2xl border-2 font-bold text-xl uppercase transition-all ${selection === 'Non-Linear' ? (validationStatus.selection === 'correct' ? 'bg-emerald-600 border-emerald-400 shadow-lg' : validationStatus.selection === 'incorrect' ? 'bg-rose-600 border-rose-400 shadow-lg' : 'bg-rose-600 border-rose-400 scale-105 shadow-lg') : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}>Non-Linear</button>
             </div>
          </div>
        )}

        <button onClick={validate} disabled={!selection} className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 py-4 rounded-xl font-black transition-all shadow-lg hover:scale-105 active:scale-95 uppercase tracking-wider flex items-center justify-center gap-4">
          Verify Selection ➡️
        </button>
      </div>
    </div>
  );
};

export default PatternLevel3;
