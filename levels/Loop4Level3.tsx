
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';

type Step = 1 | 2 | 3 | 4;

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
  const [validationStatus, setValidationStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [isAllComplete, setIsAllComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

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
      hint = "Hint: Algebraic expressions MUST have a variable (a letter).";
    } else if (step === 2) {
      isCorrect = selected === 'B';
      hint = "Hint: Base fee is the constant, monthly is the change.";
    } else if (step === 3) {
      isCorrect = selected === 'C';
      hint = "Hint: Double is 2x, subtract 3 is - 3.";
    } else if (step === 4) {
      isCorrect = selected === 'B';
      hint = "Hint: Each ticket ($12) is multiplied by t.";
    }

    if (isCorrect) {
      setValidationStatus('correct');
      handleCorrect(step < 4 ? (step + 1) as Step : null);
    } else {
      setValidationStatus('incorrect');
      showIncorrect(hint);
    }
  };

  const goToStep = (i: number) => {
    setStep(i as Step);
    setSelected(null);
    setFeedback(null);
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
      <h1 className="text-3xl font-black mb-10 text-sky-400 italic uppercase tracking-tighter">Algebraic Expression Master</h1>
      <div className="flex gap-4 mb-10">
        {[1, 2, 3, 4].map(i => (
          <button
            key={i}
            onClick={() => goToStep(i)}
            className={`h-4 w-4 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${step >= i ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]' : 'bg-gray-700 hover:bg-gray-600'}`}
            aria-label={`Go to step ${i}`}
          />
        ))}
      </div>

      {feedback && (
        <div className={`fixed top-24 px-8 py-3 rounded-2xl font-bold shadow-2xl z-50 animate-fade-in ${
          feedback.type === 'correct' ? 'bg-emerald-500' : 'bg-rose-600 border-2 border-rose-400'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="w-full max-w-4xl bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl">
        <div className="animate-fade-in text-center">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-8">Which is <span className="text-rose-400 underline decoration-rose-400 underline-offset-4 font-black">NOT</span> an algebraic expression?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {[{ id: 'A', text: '5y - 9' }, { id: 'B', text: '8 + 3n' }, { id: 'C', text: '2 + 5' }, { id: 'D', text: '2n³' }].map(opt => (
                  <button key={opt.id} onClick={() => { setSelected(opt.id); setFeedback(null); setValidationStatus(null); }} className={`p-6 rounded-2xl border-2 transition-all font-mono text-3xl ${selected === opt.id ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-105 shadow-xl') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}><span className="text-sky-300 mr-4 font-sans text-xl">{opt.id}.</span> {opt.text}</button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-8 italic">"A phone charges a base fee of $15, plus $20 for each month. Expression for m months?"</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {[{ id: 'A', text: '15m + 20' }, { id: 'B', text: '20m + 15' }, { id: 'C', text: '15 + 20' }, { id: 'D', text: '20 + 15' }].map(opt => (
                  <button key={opt.id} onClick={() => { setSelected(opt.id); setFeedback(null); setValidationStatus(null); }} className={`p-6 rounded-2xl border-2 transition-all font-mono text-3xl ${selected === opt.id ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-105 shadow-xl') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}><span className="text-sky-300 mr-4 font-sans text-xl">{opt.id}.</span> {opt.text}</button>
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-8 italic">"Double a number then subtract 3."</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {[{ id: 'A', text: '2 + x - 3' }, { id: 'B', text: 'x² - 3' }, { id: 'C', text: '2x - 3' }, { id: 'D', text: '3x - 2' }].map(opt => (
                  <button key={opt.id} onClick={() => { setSelected(opt.id); setFeedback(null); setValidationStatus(null); }} className={`p-6 rounded-2xl border-2 transition-all font-mono text-3xl ${selected === opt.id ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-105 shadow-xl') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}><span className="text-sky-300 mr-4 font-sans text-xl">{opt.id}.</span> {opt.text}</button>
                ))}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <div className="bg-indigo-950/40 p-6 rounded-2xl border border-indigo-500/20 mb-10 italic text-xl">
                "Online tickets: $6 service fee, $12 each. Expression for t tickets."
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {[{ id: 'A', text: '6t + 12' }, { id: 'B', text: '12t + 6' }, { id: 'C', text: 't + 18' }, { id: 'D', text: '18t' }].map(opt => (
                  <button key={opt.id} onClick={() => { setSelected(opt.id); setFeedback(null); setValidationStatus(null); }} className={`p-6 rounded-2xl border-2 transition-all font-mono text-3xl ${selected === opt.id ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-105 shadow-xl') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}><span className="text-sky-300 mr-4 font-sans text-xl">{opt.id}.</span> {opt.text}</button>
                ))}
              </div>
            </>
          )}
          <button onClick={check} disabled={!selected} className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 py-4 rounded-xl font-black text-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest italic">Check Answer</button>
        </div>
      </div>
    </div>
  );
};

export default Loop4Level3;
