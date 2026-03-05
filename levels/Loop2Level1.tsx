import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = "w-12 h-12" }) => (
    <svg className={`${className} ${filled ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const Loop2Level1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [q1, setQ1] = useState<string | null>(() => partialProgress?.q1 || null);
  const [q2, setQ2] = useState<{ [key: string]: boolean }>(() => partialProgress?.q2 || {
    adds3: false,
    startsSame: false,
    looksSame: false,
    diffNumbers: false,
  });
  const [attempts, setAttempts] = useState(() => partialProgress?.attempts || 0);
  const [isAllComplete, setIsAllComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  const [validationStatus, setValidationStatus] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  
  const isCompletedRef = useRef(false);

  // Scroll to top when level is completed
  useEffect(() => {
    if (isAllComplete) {
      const container = document.getElementById('level-content-container');
      if (container) {
        container.scrollTop = 0;
      }
    }
  }, [isAllComplete]);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ q1, q2, attempts });
      }
    };
  }, [q1, q2, attempts]);

  const handleQ2Toggle = (id: string) => {
    setQ2(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    setFeedback(null);
    setValidationStatus(prev => ({ ...prev, q2: null }));
  };

  const validate = () => {
    const isQ1Correct = q1 === 'Yes';
    const isQ2Correct = q2.adds3 === true && q2.startsSame === true && q2.looksSame === false && q2.diffNumbers === false;

    setValidationStatus({
      q1: isQ1Correct ? 'correct' : 'incorrect',
      q2: isQ2Correct ? 'correct' : 'incorrect'
    });

    if (isQ1Correct && isQ2Correct) {
      setFeedback({ type: 'correct', message: '✨ Perfectly Matched!' });
      
      let stars = 3;
      if (attempts > 2) stars = 1;
      else if (attempts > 0) stars = 2;
      
      setEarnedStars(stars);
      
      setTimeout(() => {
        setFeedback(null);
        setValidationStatus({});
        isCompletedRef.current = true;
        setIsAllComplete(true);
        onComplete(stars);
      }, 1500);
    } else {
      setAttempts(a => a + 1);
      let msg = "Not quite right. Check those representations again!";
      if (!isQ1Correct) msg = "Look closely at the numbers in each example.";
      setFeedback({ type: 'incorrect', message: msg });
    }
  };

  if (isAllComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-8 text-center animate-fade-in">
        <h2 className="text-4xl font-bold text-emerald-400 mb-6">Perfect Match!</h2>
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <StarIcon key={i} filled={i <= earnedStars} className="w-16 h-16 text-yellow-400" />
          ))}
        </div>
        <p className="text-xl text-gray-300 mb-10 max-w-md">You've mastered pattern representations across multiple forms.</p>
        <button 
          onClick={onExit} 
          className="bg-emerald-600 hover:bg-emerald-500 px-12 py-4 rounded-2xl font-black text-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          Back to Map
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 text-white font-sans max-w-6xl mx-auto relative select-none">
      <InstructionModal
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        title="Same Pattern, Different Look"
      >
        <p>Patterns can be shown in many ways: numbers, tables, words, graphs, or even pictures.</p>
        <p className="mt-2">Even if they <strong>look</strong> different, the <strong>math rule</strong> behind them might be exactly the same!</p>
      </InstructionModal>

      <InstructionButton onClick={() => setIsInstructionOpen(true)} />

      <h1 className="text-3xl font-bold mb-8 text-sky-300 uppercase italic">Algebraic Representations</h1>
      
      <div className="w-full max-w-4xl bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 relative mb-10">
        <div className="bg-gray-900 p-8 rounded-2xl mb-10 flex flex-col items-center shadow-inner border border-gray-700">
          <span className="text-[10px] uppercase font-black text-indigo-400 mb-2 tracking-[0.3em]">Number Sequence</span>
          <div className="text-5xl font-mono tracking-[0.2em] text-indigo-300 drop-shadow-lg">2, 5, 8, 11...</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Table Card */}
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700 flex flex-col items-center shadow-lg">
            <h2 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-[0.2em] w-full border-b border-gray-700 pb-2">Table</h2>
            <div className="flex-grow flex items-center justify-center w-full py-4">
              <table className="w-full max-w-[180px] border-collapse bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                <thead>
                  <tr className="bg-gray-700 text-[10px]">
                    <th className="p-2 border border-gray-700 text-sky-200 uppercase tracking-widest">n</th>
                    <th className="p-2 border border-gray-700 text-sky-200 uppercase tracking-widest">Value</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-sm">
                  {[1, 2, 3, 4].map(n => (
                    <tr key={n}><td className="p-2 border border-gray-700 text-center">{n}</td><td className="p-2 border border-gray-700 text-center text-indigo-300 font-bold">{2 + (n-1)*3}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Words Card */}
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700 flex flex-col shadow-lg">
            <h2 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-[0.2em] w-full border-b border-gray-700 pb-2">Words</h2>
            <div className="flex-grow flex items-center justify-center italic text-xl text-center text-amber-200 px-4 leading-snug">
              "Start at 2 and add 3 each time."
            </div>
          </div>

          {/* Graph Card */}
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700 flex flex-col items-center shadow-lg">
            <h2 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-[0.2em] w-full border-b border-gray-700 pb-2">Graph</h2>
            <div className="flex-grow flex items-center justify-center w-full py-4">
              <div className="bg-white p-4 rounded-xl w-full max-w-[280px] aspect-square shadow-inner">
                <svg viewBox="-20 -10 140 120" className="w-full h-full">
                  <line x1="0" y1="0" x2="0" y2="100" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="0" y1="100" x2="100" y2="100" stroke="#94a3b8" strokeWidth="2" />
                  {[0, 2, 4].map(v => (<text key={`x-${v}`} x={v*25} y="112" fontSize="7" textAnchor="middle" fill="#64748b" className="font-bold">{v}</text>))}
                  {[0, 5, 10].map(v => (<text key={`y-${v}`} x="-10" y={100 - (v*8)} fontSize="7" textAnchor="end" fill="#64748b" dominantBaseline="middle" className="font-bold">{v}</text>))}
                  <polyline points={[1,2,3,4].map(n => `${n*20},${100 - (2+(n-1)*3)*8}`).join(' ')} fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4 2" opacity="0.3" />
                  {[1, 2, 3, 4].map(n => (<circle key={n} cx={n * 20} cy={100 - (2+(n-1)*3)*8} r="3" fill="#4f46e5" />))}
                </svg>
              </div>
            </div>
          </div>

          {/* Figures Card */}
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700 flex flex-col items-center shadow-lg">
            <h2 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-[0.2em] w-full border-b border-gray-700 pb-2">Figures</h2>
            <div className="flex-grow flex items-center justify-center w-full py-4">
              <div className="flex items-end justify-center gap-8">
                {[2, 5, 8].map((count, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="grid grid-cols-3 gap-2 bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-inner">
                      {Array.from({ length: count }).map((_, j) => <div key={j} className="w-5 h-5 bg-emerald-500 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.4)]" />)}
                    </div>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Fig {i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-950/40 p-8 rounded-3xl border border-indigo-400/20 space-y-10">
          <div className={`p-6 rounded-2xl border-2 transition-colors ${validationStatus.q1 === 'correct' ? 'border-emerald-500 bg-emerald-500/5' : validationStatus.q1 === 'incorrect' ? 'border-rose-500 bg-rose-500/5' : 'border-transparent'}`}>
            <h3 className="text-lg font-bold mb-4 text-indigo-100 uppercase tracking-tight">1. Do these representations show the same pattern?</h3>
            <div className="flex gap-8">
              {['Yes', 'No'].map(choice => (
                <label key={choice} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="q1" className="w-6 h-6 accent-sky-500" checked={q1 === choice} onChange={() => { setQ1(choice); setFeedback(null); setValidationStatus(prev => ({ ...prev, q1: null })); }} />
                  <span className={`text-xl font-black uppercase tracking-tighter ${q1 === choice ? (validationStatus.q1 === 'incorrect' ? 'text-rose-400' : 'text-sky-300') : 'text-slate-400 group-hover:text-white transition-colors'}`}>{choice}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className={`p-6 rounded-2xl border-2 transition-colors ${validationStatus.q2 === 'correct' ? 'border-emerald-500 bg-emerald-500/5' : validationStatus.q2 === 'incorrect' ? 'border-rose-500 bg-rose-500/5' : 'border-transparent'}`}>
            <h3 className="text-lg font-bold mb-4 text-indigo-100 uppercase tracking-tight">2. Select TWO things that stay the same:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'adds3', label: 'Adds 3 each time' }, 
                { id: 'startsSame', label: 'Starts at same value' }, 
                { id: 'looksSame', label: 'They look identical' }, 
                { id: 'diffNumbers', label: 'Uses different math' }
              ].map(opt => (
                <label key={opt.id} className={`flex items-center gap-3 bg-gray-900/60 p-4 rounded-xl border transition-all cursor-pointer group ${q2[opt.id] ? (validationStatus.q2 === 'incorrect' ? 'border-rose-500' : 'border-sky-500/50') : 'border-white/5 hover:border-sky-500/30'}`}>
                  <input type="checkbox" className="w-6 h-6 accent-emerald-500" checked={q2[opt.id]} onChange={() => handleQ2Toggle(opt.id)} />
                  <span className={`text-sm font-bold ${q2[opt.id] ? (validationStatus.q2 === 'incorrect' ? 'text-rose-400' : 'text-white') : 'text-slate-500 group-hover:text-slate-300'}`}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {feedback && (
            <div className={`px-6 py-2 rounded-xl font-bold shadow-lg animate-fade-in text-center ${
              feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white border-2 border-rose-400'
            }`}>
              {feedback.message}
            </div>
          )}

          <button 
            onClick={validate} 
            className="w-full bg-sky-600 hover:bg-sky-500 px-10 py-4 rounded-xl font-black text-xl transition-all shadow-lg hover:scale-105 active:scale-95 uppercase tracking-wider"
          >
            Check Answers
          </button>
        </div>
      </div>
    </div>
  );
};

export default Loop2Level1;