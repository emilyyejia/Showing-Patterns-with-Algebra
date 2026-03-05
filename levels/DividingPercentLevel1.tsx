
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = "w-12 h-12" }) => (
    <svg className={`${className} ${filled ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const TASKS = [
  { part: 20, percent: 50, whole: 40, hint: "Half of a number is 20. What is the full number?" },
  { part: 15, percent: 10, whole: 150, hint: "If 10% is 15, then 100% is 10 times that." },
  { part: 25, percent: 25, whole: 100, hint: "25% is one quarter. 25 is one quarter of what?" },
  { part: 60, percent: 20, whole: 300, hint: "20% is one fifth. 60 is one fifth of what?" }
];

const DividingPercentLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [taskIndex, setTaskIndex] = useState(() => partialProgress?.step || 0);
  const [mistakes, setMistakes] = useState(() => partialProgress?.mistakes || 0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  const isCompletedRef = useRef(false);
  const currentTask = TASKS[taskIndex];

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ step: taskIndex, mistakes });
      }
    };
  }, [taskIndex, mistakes, onSavePartialProgress]);

  const handleCheck = () => {
    if (Number(input) === currentTask.whole) {
      setFeedback({ type: 'correct', message: '✨ Correct!' });
      setTimeout(() => {
        setFeedback(null);
        setInput('');
        if (taskIndex < TASKS.length - 1) {
          setTaskIndex(prev => prev + 1);
        } else {
          finishLevel();
        }
      }, 1500);
    } else {
      setMistakes(m => m + 1);
      setFeedback({ type: 'incorrect', message: currentTask.hint });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const finishLevel = () => {
    let stars = 3;
    if (mistakes >= 4) stars = 1;
    else if (mistakes >= 2) stars = 2;
    
    setEarnedStars(stars);
    isCompletedRef.current = true;
    setShowCompletionModal(true);
    onComplete(stars);
  };

  const handleReplay = () => {
    setTaskIndex(0);
    setMistakes(0);
    setInput('');
    setShowCompletionModal(false);
    isCompletedRef.current = false;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 text-white font-sans max-w-4xl mx-auto relative">
      <InstructionButton onClick={() => setIsInstructionOpen(true)} />
      <InstructionModal
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        title="Finding the Whole"
      >
        <p>When you know a part and its percentage, you can find the total (the whole).</p>
        <p className="mt-2 font-mono bg-slate-800 p-2 rounded">Whole = Part ÷ Percent</p>
        <p className="mt-2 italic">Example: If 10 is 50%, then the whole is 10 ÷ 0.5 = 20.</p>
      </InstructionModal>

      <h1 className="text-3xl font-black mb-12 text-sky-400 italic uppercase tracking-tighter drop-shadow-md text-center">Percentage Detective: Finding the Whole</h1>

      {feedback && (
        <div className={`fixed top-24 px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl z-[200] animate-fade-in border-4 ${
          feedback.type === 'correct' ? 'bg-emerald-500 border-emerald-300' : 'bg-rose-600 border-rose-400'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="w-full bg-[#161B2E] rounded-[3.5rem] p-12 border border-slate-700/50 shadow-2xl flex flex-col items-center gap-10">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-indigo-200">
            {currentTask.part} is <span className="text-sky-400">{currentTask.percent}%</span> of what?
          </h2>
          <p className="text-slate-400 italic">Find the 100% value.</p>
        </div>

        <div className="flex items-center gap-6 w-full max-w-sm">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            className="flex-grow bg-slate-900 border-4 border-slate-700 focus:border-sky-500 rounded-2xl p-6 text-4xl font-mono text-center outline-none transition-all"
            placeholder="???"
          />
          <button
            onClick={handleCheck}
            disabled={!input}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 p-6 rounded-2xl font-black text-2xl uppercase transition-all shadow-xl active:scale-95"
          >
            Check
          </button>
        </div>

        <div className="w-full bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex justify-center gap-4">
          {TASKS.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all duration-500 ${i <= taskIndex ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'bg-slate-800'}`} />
          ))}
        </div>
      </div>

      {showCompletionModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[250] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center text-slate-900 shadow-[0_0_100px_rgba(14,165,233,0.3)] border-[12px] border-sky-50">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
              {earnedStars === 1 ? 'Good effort!' : 'Challenge complete!'}
            </h2>
            {earnedStars === 1 && <p className="text-sky-600 font-bold mb-4 uppercase tracking-widest text-xs">Get 2 stars to unlock the next level</p>}
            <div className="flex justify-center gap-3 my-8">
              {[1, 2, 3].map(i => <StarIcon key={i} filled={i <= earnedStars} />)}
            </div>
            {earnedStars < 3 && <p className="text-slate-400 text-sm font-bold mb-10 italic">Solve challenges with fewer mistakes to get more stars!</p>}
            <div className="flex flex-col gap-4">
               <button onClick={handleReplay} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-4 rounded-2xl text-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest">Replay</button>
               <button onClick={onExit} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl text-xl transition-all active:scale-95 uppercase tracking-widest">Back to Map</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DividingPercentLevel1;
