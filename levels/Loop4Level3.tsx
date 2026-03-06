
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import GlossaryButton from '../components/GlossaryButton';
import GlossaryModal from '../components/GlossaryModal';

type Step = 1 | 2 | 3 | 4 | 5;

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = "w-12 h-12" }) => (
    <svg className={`${className} ${filled ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const Loop4Level3: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [step, setStep] = useState<Step>(() => partialProgress?.step || 1);
  const [mistakes, setMistakes] = useState(() => partialProgress?.mistakes || 0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<Set<string>>(() => new Set());
  const [validationStatus, setValidationStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [isAllComplete, setIsAllComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => { 
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ step, mistakes }); 
      }
    };
  }, [step, mistakes, onSavePartialProgress]);

  const showFeedback = (type: 'correct' | 'incorrect', msg?: string) => {
    document.getElementById('level-content-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    setFeedback({ type, message: msg });
  };

  const handleCorrect = (next: Step | null) => {
    showFeedback('correct', '✨ Masterful!');
    setTimeout(() => {
      setSelected(null);
      setValidationStatus(null);
      if (next) setStep(next);
      else finishLevel();
    }, 1500);
  };

  const finishLevel = () => {
    let stars = 3;
    if (mistakes >= 4) stars = 1;
    else if (mistakes >= 2) stars = 2;
    
    setEarnedStars(stars);
    isCompletedRef.current = true;
    setIsAllComplete(true);
    onComplete(stars);
  };

  const showIncorrect = (msg: string) => { 
    setMistakes(m => m + 1);
    showFeedback('incorrect', msg); 
  };

  const check = () => {
    let isCorrect = false;
    let hint = "";

    if (step === 1) {
      isCorrect = selected === 'C';
      hint = "Algebraic expressions MUST have a variable.";
    } else if (step === 2) {
      isCorrect = selected === 'B';
      hint = "Identify the constant difference and the constant.";
    } else if (step === 3) {
      isCorrect = selected === 'C';
      hint = "Try again! Double means multiplying the number by 2.";
    } else if (step === 4) {
      isCorrect = selected === 'B';
      hint = "Try again! What happens to the number of the tiles each time?";
    } else if (step === 5) {
      const correct = new Set(['A', 'B']);
      isCorrect = selectedMultiple.size === 2 && selectedMultiple.has('A') && selectedMultiple.has('B');
      hint = "Try again!";
    }

    if (isCorrect) {
      setValidationStatus('correct');
      handleCorrect(step < 5 ? (step + 1) as Step : null);
    } else {
      setValidationStatus('incorrect');
      showIncorrect(hint);
    }
  };

  const goToStep = (i: number) => {
    setStep(i as Step);
    setSelected(null);
    setSelectedMultiple(new Set());
    setFeedback(null);
  };

  const toggleMultipleSelection = (id: string) => {
    setSelectedMultiple(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    setFeedback(null);
    setValidationStatus(null);
  };

  if (isAllComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-8 text-center animate-fade-in">
        <h2 className="text-4xl font-bold text-emerald-400 mb-6 uppercase italic tracking-tighter">Perfect Analysis!</h2>
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <StarIcon key={i} filled={i <= earnedStars} className="w-16 h-16 text-yellow-400" />
          ))}
        </div>
        <p className="text-xl text-gray-300 mb-10 max-w-md">
          You've mastered algebraic expressions and are ready for any pattern challenge!
        </p>
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
    <div className="flex flex-col items-center min-h-full p-6 text-white font-sans max-w-5xl mx-auto">
      <GlossaryButton onClick={() => setIsGlossaryOpen(true)} />
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      <div className="flex gap-4 mb-10">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full transition-all duration-500 ${step >= i ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]' : 'bg-gray-700'}`}
            aria-label={`Step ${i}`}
          />
        ))}
      </div>

      <div className="w-full max-w-4xl bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl">
        <div className="animate-fade-in text-center">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-4">Which is <span className="text-rose-400 underline decoration-rose-400 underline-offset-4 font-black">NOT</span> an algebraic expression?</h2>
              {feedback && feedback.type === 'incorrect' && (
                <p className="text-yellow-400 text-sm mb-6">{feedback.message}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {[{ id: 'A', text: '5y - 9' }, { id: 'B', text: '8 + 3n' }, { id: 'C', text: '2 + 5' }, { id: 'D', text: '2n³' }].map(opt => (
                  <button key={opt.id} onClick={() => { setSelected(opt.id); setFeedback(null); setValidationStatus(null); }} className={`p-6 rounded-2xl border-2 transition-all font-mono text-3xl ${selected === opt.id ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-105 shadow-xl') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}>{opt.text}</button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-4 italic">"A phone charges a base fee of $15, plus $20 for each month. Expression for m months?"</h2>
              {feedback && feedback.type === 'incorrect' && (
                <p className="text-yellow-400 text-sm mb-6">{feedback.message}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {[{ id: 'A', text: '15m + 20' }, { id: 'B', text: '20m + 15' }, { id: 'C', text: '15 + 20' }, { id: 'D', text: '20 + 15' }].map(opt => (
                  <button key={opt.id} onClick={() => { setSelected(opt.id); setFeedback(null); setValidationStatus(null); }} className={`p-6 rounded-2xl border-2 transition-all font-mono text-3xl ${selected === opt.id ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-105 shadow-xl') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}>{opt.text}</button>
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-4 italic">"Double a number then subtract 3."</h2>
              {feedback && feedback.type === 'incorrect' && (
                <p className="text-yellow-400 text-sm mb-6">{feedback.message}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {[{ id: 'A', text: '2 + x - 3' }, { id: 'B', text: 'x² - 3' }, { id: 'C', text: '2x - 3' }, { id: 'D', text: '3x - 2' }].map(opt => (
                  <button key={opt.id} onClick={() => { setSelected(opt.id); setFeedback(null); setValidationStatus(null); }} className={`p-6 rounded-2xl border-2 transition-all font-mono text-3xl ${selected === opt.id ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-105 shadow-xl') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}>{opt.text}</button>
                ))}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <div className="mb-8 flex justify-center items-end gap-8">
                {[1, 2, 3, 4].map((term, idx) => {
                  const count = Math.pow(2, term);
                  const rows = term === 1 ? 2 : term === 2 ? 2 : term === 3 ? 4 : 4;
                  const cols = term === 1 ? 1 : term === 2 ? 2 : term === 3 ? 2 : 4;
                  return (
                    <div key={term} className="flex flex-col items-center">
                      <div className="flex flex-col gap-2 mb-3">
                        {Array.from({ length: rows }).map((_, rowIdx) => (
                          <div key={rowIdx} className="flex gap-2">
                            {Array.from({ length: cols }).map((_, colIdx) => (
                              <div key={colIdx} className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-emerald-700"></div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-700 px-3 py-1 rounded text-sm font-mono">[{term}]</div>
                    </div>
                  );
                })}
              </div>
              <h2 className="text-xl font-bold mb-4">When the term number is <span className="italic">n</span>, what is the algebraic expression for this?</h2>
              {feedback && feedback.type === 'incorrect' && (
                <p className="text-yellow-400 text-sm mb-6">{feedback.message}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {[{ id: 'A', text: '2n + 2' }, { id: 'B', text: '2^n' }, { id: 'C', text: '2n' }, { id: 'D', text: 'n x 2' }].map(opt => (
                  <button key={opt.id} onClick={() => { setSelected(opt.id); setFeedback(null); setValidationStatus(null); }} className={`p-6 rounded-2xl border-2 transition-all font-mono text-3xl ${selected === opt.id ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-105 shadow-xl') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}>{opt.text}</button>
                ))}
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <h2 className="text-2xl font-bold mb-8">Total Pages Read vs. Days</h2>
              <div className="bg-white p-8 rounded-2xl mb-8">
                <svg viewBox="0 0 500 400" className="w-full h-auto">
                  <line x1="50" y1="350" x2="450" y2="350" stroke="#333" strokeWidth="2" />
                  <line x1="50" y1="350" x2="50" y2="50" stroke="#333" strokeWidth="2" />
                  <text x="250" y="390" textAnchor="middle" fill="#333" fontSize="16" fontWeight="600">Number of Days</text>
                  <text x="20" y="200" textAnchor="middle" fill="#333" fontSize="16" fontWeight="600" transform="rotate(-90 20 200)">Total Pages Read</text>
                  {[0, 50, 100, 150, 200].map((val, i) => (
                    <g key={val}>
                      <line x1="45" y1={350 - i * 75} x2="50" y2={350 - i * 75} stroke="#333" strokeWidth="2" />
                      <text x="35" y={350 - i * 75 + 5} textAnchor="end" fill="#333" fontSize="14">{val}</text>
                    </g>
                  ))}
                  {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                    <g key={val}>
                      <line x1={50 + val * 57} y1="350" x2={50 + val * 57} y2="355" stroke="#333" strokeWidth="2" />
                      <text x={50 + val * 57} y="370" textAnchor="middle" fill="#333" fontSize="14">{val}</text>
                    </g>
                  ))}
                  <circle cx="107" cy="237.5" r="5" fill="#06b6d4" />
                  <circle cx="164" cy="275" r="5" fill="#06b6d4" />
                  <circle cx="221" cy="200" r="5" fill="#06b6d4" />
                  <circle cx="278" cy="125" r="5" fill="#06b6d4" />
                  <circle cx="335" cy="162.5" r="5" fill="#06b6d4" />
                  <circle cx="392" cy="50" r="5" fill="#06b6d4" />
                  <polyline points="107,237.5 164,275 221,200 278,125 335,162.5 392,50" fill="none" stroke="#06b6d4" strokeWidth="3" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-4">Select TWO statements that are true.</h3>
              {feedback && feedback.type === 'incorrect' && (
                <p className="text-yellow-400 text-sm mb-6">{feedback.message}</p>
              )}
              <div className="grid grid-cols-1 gap-3 mb-10 text-left">
                {[
                  { id: 'A', text: 'The starting value is 25.' },
                  { id: 'B', text: 'The constant difference is 25.' },
                  { id: 'C', text: 'The variable is total pages read.' },
                  { id: 'D', text: 'The constant is 25.' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => toggleMultipleSelection(opt.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-lg text-left ${selectedMultiple.has(opt.id) ? 'bg-sky-600 border-sky-400 scale-[1.02]' : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}
                  >
                    <span className={selectedMultiple.has(opt.id) ? 'font-bold' : ''}>{opt.text}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <button onClick={check} disabled={step === 5 ? selectedMultiple.size === 0 : !selected} className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 py-4 rounded-xl font-black text-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest italic">Check</button>
        </div>
      </div>
    </div>
  );
};

export default Loop4Level3;
