import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionModal from '../components/InstructionModal';

type Step = 1 | 2 | 3 | 4;

const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={filled ? "#FACC15" : "none"} stroke={filled ? "#FACC15" : "#4B5563"} strokeWidth={filled ? 0 : 1.5} className={className}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const Loop3Level3: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [step, setStep] = useState<Step>(() => partialProgress?.step || 1);
  const [qIndex, setQIndex] = useState(0);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [qAnswers, setQAnswers] = useState<Record<string, string>>({});
  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => { if (!isCompletedRef.current && onSavePartialProgress) onSavePartialProgress({ step, qAnswers }); };
  }, [step, qAnswers]);

  const handleManualCheck = (isCorrect: boolean, errorMsg: string, isLastInStep: boolean) => {
    // Reset scroll position to ensure feedback message at the top is visible
    document.getElementById('level-content-container')?.scrollTo({ top: 0, behavior: 'smooth' });

    if (isCorrect) {
        setValidationStatus('correct');
        setFeedback({ type: 'correct' });
        const currentQId = `step${step}_q${qIndex}`;
        setQAnswers(prev => ({ ...prev, [currentQId]: selected || '' }));
        setTimeout(() => {
            setFeedback(null);
            setValidationStatus(null);
            if (isLastInStep) { 
                if (step < 4) { 
                  setStep(s => (s+1) as Step); 
                  setQIndex(0); 
                  setSelected(null); 
                } else { 
                  isCompletedRef.current = true; 
                  onComplete(3);
                } 
            } else { 
              setQIndex(i => i + 1); 
              setSelected(null); 
            }
        }, 1200);
    } else {
        setValidationStatus('incorrect');
        setFeedback({ type: 'incorrect', message: errorMsg });
    }
  };

  const resetTask = () => {
    setQIndex(0);
    setSelected(null);
    setFeedback(null);
    // Remove current step's answers from record
    const newAnswers = { ...qAnswers };
    Object.keys(newAnswers).forEach(key => {
      if (key.startsWith(`step${step}_`)) delete newAnswers[key];
    });
    setQAnswers(newAnswers);
  };

  if (isCompletedRef.current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-8 text-center animate-fade-in">
        <h2 className="text-4xl font-bold text-emerald-400 mb-6">Perfect Analysis!</h2>
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <StarIcon key={i} filled={true} className="w-16 h-16 text-yellow-400" />
          ))}
        </div>
        <p className="text-xl text-gray-300 mb-10 max-w-md">
          You've mastered the concepts of variables and constants in complex real-world patterns.
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
    <div className="flex flex-col items-center min-h-full p-6 text-white font-sans max-w-5xl mx-auto relative">
      <InstructionModal isOpen={isInstructionOpen} onClose={() => setIsInstructionOpen(false)} title="Mastery Challenge">
        <p>Apply your knowledge of variables and constants to graphs, tables, and real-world scenarios.</p>
      </InstructionModal>

      <h1 className="text-3xl font-black mb-8 text-sky-400 italic uppercase">Analyzing Patterns</h1>

      <div className="flex gap-4 mb-10">
        {[1, 2, 3, 4].map(i => (
          <button 
            key={i} 
            onClick={() => {setStep(i as Step); setQIndex(0); setSelected(null);}} 
            className={`h-4 w-4 rounded-full transition-all duration-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${i <= step ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]' : 'bg-gray-700'}`}
            aria-label={`Go to task ${i}`}
          />
        ))}
      </div>

      {feedback && (
        <div className={`fixed top-24 px-8 py-3 rounded-2xl font-bold shadow-2xl z-[200] animate-fade-in ${feedback.type === 'correct' ? 'bg-emerald-500' : 'bg-rose-600 border-2 border-rose-400'}`}>
          {feedback.message || '✨ Correct!'}
        </div>
      )}

      <div className="w-full max-w-4xl bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl relative">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
            <div className="flex flex-col items-center">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Social Media Growth</h2>
              <div className="bg-white p-6 rounded-xl w-full shadow-inner border-2 border-slate-200">
                <svg viewBox="-25 -10 145 120" className="w-full h-auto overflow-visible">
                  {[120, 135, 150, 165, 180].map((val, i) => { const y = 90 - (i * 15); return <g key={val}><line x1="15" y1={y} x2="115" y2={y} stroke="#e2e8f0" strokeWidth="0.5" /><text x="10" y={y + 1} fontSize="4" textAnchor="end" fill="#64748b" className="font-mono font-bold">{val}</text></g>; })}
                  <line x1="15" y1="90" x2="115" y2="90" stroke="#475569" strokeWidth="1" /><line x1="15" y1="90" x2="15" y2="10" stroke="#475569" strokeWidth="1" />
                  {[1, 2, 3, 4, 5].map(d => <text key={d} x={15 + d * 18} y="98" fontSize="4" textAnchor="middle" fill="#64748b" className="font-mono font-bold">{d}</text>)}
                  <polyline points={[1,2,3,4,5].map(d => `${15 + d*18},${90 - ((d-1)*15)}`).join(' ')} fill="none" stroke="#10b981" strokeWidth="1.5" />
                  {[1,2,3,4,5].map(d => <circle key={d} cx={15 + d*18} cy={90 - ((d-1)*15)} r="1.5" fill="#059669" />)}
                  <text x="65" y="108" fontSize="5" textAnchor="middle" fill="#475569" className="font-bold">Number of Days</text>
                  <text x="-45" y="-12" fontSize="5" textAnchor="middle" fill="#475569" transform="rotate(-90)" className="font-bold">Total Followers</text>
                </svg>
              </div>
            </div>
            <div className="space-y-6">
              <div className={qIndex >= 0 ? 'opacity-100' : 'opacity-20 pointer-events-none'}>
                <p className="font-bold mb-3 text-lg">1. What is the variable?</p>
                {qIndex === 0 ? (
                  <div className="grid gap-2">
                    {['A. The number of new followers each day', 'B. The number of days', 'C. The total followers'].map(opt => (
                      <button key={opt} onClick={() => { setSelected(opt); setFeedback(null); setValidationStatus(null); }} className={`p-3 rounded-lg border-2 text-left transition-all ${selected === opt ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-[1.01]') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}>{opt}</button>
                    ))}
                    <button onClick={() => handleManualCheck(selected?.startsWith('B') || false, "Incorrect. Variable is the input value that changes (e.g., time or position).", false)} className="mt-2 bg-sky-600 hover:bg-sky-500 p-3 rounded-xl font-black uppercase shadow-lg transition-transform active:scale-95">Verify</button>
                  </div>
                ) : <div className="p-3 bg-gray-900 rounded border border-emerald-500 text-emerald-400 font-bold animate-fade-in">{qAnswers.step1_q0}</div>}
              </div>
              {qIndex >= 1 && (
                <div className="animate-fade-in-up">
                  <p className="font-bold mb-3 text-lg">2. What is the constant difference?</p>
                  {qIndex === 1 ? (
                    <div className="grid gap-2">
                      {['A. The number of new followers each day', 'B. The number of days', 'C. The total followers'].map(opt => (
                        <button key={opt} onClick={() => { setSelected(opt); setFeedback(null); setValidationStatus(null); }} className={`p-3 rounded-lg border-2 text-left transition-all ${selected === opt ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-[1.01]') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}>{opt}</button>
                      ))}
                      <button onClick={() => handleManualCheck(selected?.startsWith('A') || false, "Hint: The 'constant difference' is the fixed amount added each step.", true)} className="mt-2 bg-sky-600 hover:bg-sky-500 p-3 rounded-xl font-black uppercase shadow-lg transition-transform active:scale-95">Verify</button>
                    </div>
                  ) : <div className="p-3 bg-gray-900 rounded border border-emerald-500 text-emerald-400 font-bold animate-fade-in">{qAnswers.step1_q1}</div>}
                </div>
              )}
              {qIndex > 0 && <button onClick={resetTask} className="text-[10px] uppercase font-black text-slate-500 hover:text-slate-300 transition-colors tracking-widest mt-4">Reset Step 1</button>}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Value of Equipment</h2>
              <table className="w-full border-collapse bg-gray-900 rounded-xl border border-gray-600 shadow-xl overflow-hidden">
                <thead className="bg-gray-700 text-xs"><tr><th className="p-3 border border-gray-600 text-sky-200 uppercase">Year</th><th className="p-3 border border-gray-600 text-sky-200 uppercase">Value ($)</th></tr></thead>
                <tbody className="font-mono text-center">{[1, 2, 3, 4, 5, 6, 7].map(y => <tr key={y}><td className="p-2 border border-gray-600">{y}</td><td className="p-2 border border-gray-600 text-indigo-300">{(25000 - (y-1)*2000).toLocaleString()}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="space-y-4">
                <p className="font-bold mb-3 text-lg">What is the constant difference in this table?</p>
                {['Decreases by $2,000 each year.', 'Decreases by $1,000 each year.', 'Increases by $2,000 each year.'].map(opt => (
                  <button key={opt} onClick={() => { setSelected(opt); setFeedback(null); setValidationStatus(null); }} className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all ${selected === opt ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-[1.02] shadow-lg') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}>{opt}</button>
                ))}
                <button onClick={() => handleManualCheck(selected?.startsWith('Decreases by $2') || false, "Look at the change between Year 1 and Year 2. 25,000 to 23,000 is a $2,000 drop.", true)} className="mt-4 w-full bg-sky-600 hover:bg-sky-500 p-4 rounded-xl font-black uppercase shadow-lg transition-transform active:scale-95">Check Answer</button>
                {selected && <button onClick={() => setSelected(null)} className="w-full text-[10px] uppercase font-black text-slate-500 hover:text-slate-300 tracking-widest">Clear Choice</button>}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col items-center animate-fade-in text-center">
             <h2 className="text-xl font-bold mb-6 text-indigo-200">Analyze the numeric sequence below.</h2>
             <div className="bg-gray-900 px-10 py-6 rounded-3xl border-2 border-indigo-500 text-5xl font-mono tracking-widest text-indigo-300 mb-10 shadow-2xl">3, 6, 9, 12, 15...</div>
             <div className="w-full max-w-xl space-y-4">
                {['The value increases by 3 each time.', 'The value doubles each time.'].map(opt => (
                  <button key={opt} onClick={() => { setSelected(opt); setFeedback(null); setValidationStatus(null); }} className={`w-full p-4 rounded-xl border-2 text-center font-bold transition-all ${selected === opt ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-[1.02] shadow-lg') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}>{opt}</button>
                ))}
                <button onClick={() => handleManualCheck(selected?.includes('by 3') || false, "Incorrect. Check the gap: 3+3=6, 6+3=9. It's a repeated addition of 3.", true)} className="w-full bg-sky-600 hover:bg-sky-500 p-4 rounded-xl font-black uppercase shadow-lg transition-transform active:scale-95">Check Answer</button>
                <button onClick={() => setSelected(null)} className="text-[10px] uppercase font-black text-slate-500 hover:text-slate-300 tracking-widest mt-4">Reset Choice</button>
             </div>
          </div>
        )}
        {step === 4 && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="bg-indigo-950/30 p-8 rounded-3xl border border-indigo-400/30 mb-10 w-full text-center">
              <p className="text-xl italic text-indigo-100">"A phone plan includes a <span className="font-bold text-sky-300">base fee of $10</span> and <span className="font-bold text-sky-300">$1 for each text message</span>."</p>
            </div>
            <div className="w-full max-w-2xl space-y-10">
              <div className={qIndex >= 0 ? 'opacity-100' : 'opacity-20 pointer-events-none'}>
                <p className="font-bold mb-4 text-lg">1. What is the variable?</p>
                {qIndex === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['A. The base fee', 'B. Cost per text', 'C. Number of messages', 'D. Total cost'].map(opt => (
                      <button key={opt} onClick={() => { setSelected(opt); setFeedback(null); setValidationStatus(null); }} className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${selected === opt ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-[1.02]') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}>{opt}</button>
                    ))}
                    <button onClick={() => handleManualCheck(selected?.startsWith('C') || false, "Incorrect. The variable is the number of messages sent, as it's the part that can change month-to-month.", false)} className="mt-2 w-full bg-sky-600 hover:bg-sky-500 p-3 rounded-xl font-black uppercase shadow-lg">Verify</button>
                  </div>
                ) : <div className="p-4 bg-gray-900 rounded border border-emerald-500 text-emerald-400 font-bold animate-fade-in">{qAnswers.step4_q0}</div>}
              </div>
              {qIndex >= 1 && (
                <div className="animate-fade-in-up">
                  <p className="font-bold mb-6 text-lg">2. What is the constant difference?</p>
                  {qIndex === 1 ? (
                    <div className="grid gap-3">
                      {['A. The base fee', 'B. $1 per message', 'C. Number of texts', 'D. Total cost'].map(opt => (
                        <button key={opt} onClick={() => { setSelected(opt); setFeedback(null); setValidationStatus(null); }} className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${selected === opt ? (validationStatus === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-[1.02]') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}>{opt}</button>
                      ))}
                      <button onClick={() => handleManualCheck(selected?.startsWith('B') || false, "Incorrect. The constant difference is the recurring cost added for each unit of change.", true)} className="mt-2 w-full bg-sky-600 hover:bg-sky-500 p-3 rounded-xl font-black uppercase shadow-lg">Verify</button>
                    </div>
                  ) : <div className="p-4 bg-gray-900 rounded border border-emerald-500 text-emerald-400 font-bold animate-fade-in">{qAnswers.step4_q1}</div>}
                </div>
              )}
            </div>
            {qIndex > 0 && <button onClick={resetTask} className="text-[10px] uppercase font-black text-slate-500 hover:text-slate-300 tracking-widest mt-10">Start Task 4 Over</button>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Loop3Level3;