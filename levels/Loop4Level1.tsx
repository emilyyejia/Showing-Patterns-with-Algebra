import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

type TaskNum = 1 | 2;

const TASK1_SEQUENCE = [2, 5, 8, 11, 14, 17, 20];

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = "w-12 h-12" }) => (
    <svg className={`${className} ${filled ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const Loop4Level1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [task, setTask] = useState<TaskNum>(() => partialProgress?.task || 1);
  const [isReady, setIsReady] = useState(() => partialProgress?.isReady || false);
  const [step, setStep] = useState(() => partialProgress?.step || 1);
  const [inputs, setInputs] = useState<Record<string, string>>(() => partialProgress?.inputs || {});
  const [mistakes, setMistakes] = useState(() => partialProgress?.mistakes || 0);
  
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  const [purpleTiles, setPurpleTiles] = useState<number[]>([]);
  const [isAllComplete, setIsAllComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [validationStatus, setValidationStatus] = useState<Record<string, 'correct' | 'incorrect' | null>>({});

  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ task, isReady, step, inputs, mistakes });
      }
    };
  }, [task, isReady, step, inputs, mistakes]);

  const showFeedback = (type: 'correct' | 'incorrect', msg?: string) => {
    document.getElementById('level-content-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    setFeedback({ type, message: msg });
  };

  const handleStepCheck = (expected: string | string[], field: string, nextStep: number, errorMsg: string) => {
    const val = inputs[field]?.trim().toLowerCase().replace(/\s/g, '');
    const isCorrect = Array.isArray(expected) 
        ? expected.some(e => val === e.toLowerCase().replace(/\s/g, ''))
        : val === expected.toLowerCase().replace(/\s/g, '');

    if (isCorrect) {
      setValidationStatus(prev => ({ ...prev, [field]: 'correct' }));
      showFeedback('correct', '✨ Correct!');
      setTimeout(() => {
        setStep(nextStep);
        setValidationStatus(prev => ({ ...prev, [field]: null }));
      }, 1000);
    } else {
      setValidationStatus(prev => ({ ...prev, [field]: 'incorrect' }));
      setMistakes(m => m + 1);
      showFeedback('incorrect', errorMsg);
    }
  };

  const finishTask1 = () => {
    setPurpleTiles([]);
    TASK1_SEQUENCE.forEach((val, i) => {
      setTimeout(() => setPurpleTiles(prev => [...prev, val]), i * 200);
    });
    setTimeout(() => {
      setTask(2);
      setStep(1);
      setInputs({});
      setValidationStatus({});
      setIsReady(false);
      setPurpleTiles([]);
      document.getElementById('level-content-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, TASK1_SEQUENCE.length * 200 + 1500);
  };

  const handleFinalCheck = () => {
    const expected = task === 1 ? '20' : '22';
    const isCorrect = inputs.s6 === expected;
    if (isCorrect) {
      setValidationStatus(prev => ({ ...prev, s6: 'correct' }));
      showFeedback('correct', '✨ Masterful!');
      if (task === 1) {
        finishTask1();
      } else {
        completeLevel();
      }
    } else {
      setValidationStatus(prev => ({ ...prev, s6: 'incorrect' }));
      setMistakes(m => m + 1);
      showFeedback('incorrect', `Hint: Substitute ${task === 1 ? 'n = 7' : 't = 7'} into your expression.`);
    }
  };

  const completeLevel = () => {
    let stars = 3;
    if (mistakes >= 6) stars = 1;
    else if (mistakes >= 3) stars = 2;
    
    setEarnedStars(stars);
    isCompletedRef.current = true;
    setIsAllComplete(true);
    onComplete(stars);
  };

  const handleReplay = () => {
    setTask(1);
    setStep(1);
    setInputs({});
    setIsReady(false);
    setPurpleTiles([]);
    setMistakes(0);
    setIsAllComplete(false);
    isCompletedRef.current = false;
    document.getElementById('level-content-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (i: number) => {
    document.getElementById('level-content-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(i);
    setIsReady(true);
    setFeedback(null);
  };

  if (isAllComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-8 text-center animate-fade-in">
        <h2 className="text-4xl font-bold text-emerald-400 mb-6 uppercase italic tracking-tighter">Expression Master!</h2>
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <StarIcon key={i} filled={i <= earnedStars} className="w-16 h-16 text-yellow-400" />
          ))}
        </div>
        <p className="text-xl text-gray-300 mb-10 max-w-md">
          You've successfully built algebraic expressions from visual and numeric patterns.
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={onExit} 
            className="bg-emerald-600 hover:bg-emerald-500 px-12 py-4 rounded-2xl font-black text-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Back to Map
          </button>
          <button 
            onClick={handleReplay}
            className="text-slate-500 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors"
          >
            Try Again for 3 Stars
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-full p-6 text-white font-sans max-w-6xl mx-auto relative">
      <h1 className="text-3xl font-black mb-8 text-sky-400 italic uppercase tracking-tighter">Algebraic Expression Builder</h1>
      <div className="flex gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <button
            key={i}
            onClick={() => goToStep(i)}
            className={`h-4 w-4 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${step >= i ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]' : 'bg-gray-700 hover:bg-gray-600'}`}
            aria-label={`Go to step ${i}`}
          />
        ))}
      </div>

      <div className="w-full max-w-5xl relative">
        {feedback && (
          <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-md px-8 py-3 rounded-2xl font-bold shadow-2xl z-50 animate-fade-in text-center ${
            feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white border-2 border-rose-400'
          }`}>
            {feedback.message}
          </div>
        )}

        {!isReady ? (
          <div className="bg-gray-800 p-12 rounded-3xl text-center shadow-2xl border border-indigo-500/30 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 leading-relaxed">
              We are going to write {task === 2 ? 'another' : 'an'} algebraic <span className="text-sky-400 underline underline-offset-8">expression to represent a pattern</span>. Are you ready?
            </h2>
            <button
              onClick={() => setIsReady(true)}
              className="bg-sky-600 hover:bg-sky-500 px-12 py-4 rounded-2xl font-black text-xl shadow-xl transition-all hover:scale-110 active:scale-95"
            >
              I'm ready!
            </button>
          </div>
        ) : (
          <div className="w-full bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 relative mb-10 animate-fade-in">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="bg-gray-900/60 p-6 rounded-3xl border border-indigo-500/30">
                  <h3 className="text-center text-gray-500 uppercase text-xs font-bold mb-4 tracking-widest">{task === 1 ? 'Pattern 1' : 'Pattern 2'}</h3>
                  <h2 className="text-4xl font-mono text-indigo-300 text-center mb-6">{task === 1 ? '2, 5, 8, 11, ...' : '4, 7, 10, 13, ...'}</h2>
                  <table className="w-full border-collapse bg-gray-800 rounded-xl border border-gray-700">
                    <thead className="bg-gray-700 text-xs uppercase">
                      <tr>
                        <th className="p-2 border border-gray-600 text-indigo-200">{task === 1 ? 'n' : 't'}</th>
                        <th className="p-2 border border-gray-600 text-indigo-200">Value</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-center">
                      {[1, 2, 3, 4, 5].map(n => (
                        <tr key={n}>
                          <td className="p-2 border border-gray-600">{n}</td>
                          <td className="p-2 border border-gray-600 text-sky-400 font-bold">{task === 1 ? 2 + (n - 1) * 3 : 4 + (n - 1) * 3}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {task === 2 && <p className="mt-4 text-center text-sky-300 font-bold italic">Term number is represented by t.</p>}
                </div>
                {task === 1 && purpleTiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center p-6 bg-purple-900/20 rounded-2xl border-2 border-purple-500/30">
                    {purpleTiles.map((val, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-purple-600 flex items-center justify-center rounded font-bold shadow-lg animate-fade-in-up text-xl">{val}</div>
                        {idx === TASK1_SEQUENCE.length - 1 && <span className="text-[10px] mt-1 font-bold text-purple-400">n=7</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-900/40 p-8 rounded-3xl border border-gray-700 shadow-inner space-y-8">
                <div className={`transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-20'}`}>
                  <h3 className="text-lg font-black text-sky-300 mb-1 uppercase tracking-tighter">Step 1: Find the change</h3>
                  {step === 1 ? (
                    <div className="flex gap-2">
                      <input
                        value={inputs.s1 || ''}
                        onChange={e => { setInputs({ ...inputs, s1: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s1: null })); }}
                        className={`bg-gray-900 border-2 rounded p-2 flex-grow font-mono transition-colors ${validationStatus.s1 === 'correct' ? 'border-emerald-500' : validationStatus.s1 === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`}
                        placeholder="..."
                      />
                      <button onClick={() => handleStepCheck('3', 's1', 2, "Check the gap between numbers.")} className="bg-sky-600 px-6 rounded font-black uppercase">Check</button>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-900/50 text-emerald-400 font-black border border-emerald-500/30 rounded-xl animate-fade-in text-xl">3</div>
                  )}
                </div>

                <div className={`transition-opacity duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-20'}`}>
                  <h3 className="text-lg font-black text-sky-300 mb-1 uppercase tracking-tighter">Step 2: Multiply by {task === 1 ? 'n' : 't'}</h3>
                  {step === 2 ? (
                    <div className="flex gap-2">
                      <input
                        value={inputs.s2 || ''}
                        onChange={e => { setInputs({ ...inputs, s2: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s2: null })); }}
                        className={`bg-gray-900 border-2 rounded p-2 flex-grow font-mono transition-colors ${validationStatus.s2 === 'correct' ? 'border-emerald-500' : validationStatus.s2 === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`}
                        placeholder="..."
                      />
                      <button onClick={() => handleStepCheck(task === 1 ? '3n' : '3t', 's2', 3, "Multiply change by the variable.")} className="bg-sky-600 px-6 rounded font-black uppercase">Check</button>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-900/50 text-emerald-400 font-black border border-emerald-500/30 rounded-xl animate-fade-in text-xl">{task === 1 ? '3n' : '3t'}</div>
                  )}
                </div>

                <div className={`transition-opacity duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-20'}`}>
                  <h3 className="text-lg font-black text-sky-300 mb-1 uppercase tracking-tighter">Step 3: Check term 1</h3>
                  {step === 3 ? (
                    <div className="flex gap-2">
                      <input
                        value={inputs.s3 || ''}
                        onChange={e => { setInputs({ ...inputs, s3: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s3: null })); }}
                        className={`bg-gray-900 border-2 rounded p-2 flex-grow font-mono transition-colors ${validationStatus.s3 === 'correct' ? 'border-emerald-500' : validationStatus.s3 === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`}
                        placeholder="..."
                      />
                      <button onClick={() => handleStepCheck('3', 's3', 4, "What is 3 times 1?")} className="bg-sky-600 px-6 rounded font-black uppercase">Check</button>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-900/50 text-emerald-400 font-black border border-emerald-500/30 rounded-xl animate-fade-in text-xl">3</div>
                  )}
                </div>

                <div className={`transition-opacity duration-500 ${step >= 4 ? 'opacity-100' : 'opacity-20'}`}>
                  <h3 className="text-lg font-black text-sky-300 mb-1 uppercase tracking-tighter">Step 4: Fix it</h3>
                  {step === 4 ? (
                    <div className="flex gap-2">
                      <select
                        value={inputs.s4 || ''}
                        onChange={e => { setInputs({ ...inputs, s4: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s4: null })); }}
                        className={`bg-gray-900 border-2 rounded p-2 flex-grow text-slate-200 transition-colors ${validationStatus.s4 === 'correct' ? 'border-emerald-500' : validationStatus.s4 === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`}
                      >
                        <option value="">Select...</option>
                        <option value="add 1">add 1</option>
                        <option value="subtract 1">subtract 1</option>
                      </select>
                      <button onClick={() => handleStepCheck(task === 1 ? 'subtract 1' : 'add 1', 's4', 5, "Compare 3 to the actual start.")} className="bg-sky-600 px-6 rounded font-black uppercase">Check</button>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-900/50 text-emerald-400 font-black border border-emerald-500/30 rounded-xl animate-fade-in text-xl">{task === 1 ? 'subtract 1' : 'add 1'}</div>
                  )}
                </div>

                <div className={`transition-opacity duration-500 ${step >= 5 ? 'opacity-100' : 'opacity-20'}`}>
                  <h3 className="text-lg font-black text-sky-300 mb-2 uppercase tracking-tighter">Step 5: Assemble the Rule</h3>
                  {step === 5 ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-slate-400 italic">Combine the parts from Step 2 and Step 4</p>
                      <div className="flex gap-2">
                          <input
                              value={inputs.s5 || ''}
                              onChange={e => { setInputs({ ...inputs, s5: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s5: null })); }}
                              className={`bg-gray-900 border-2 rounded p-2 flex-grow font-mono text-xl transition-colors ${validationStatus.s5 === 'correct' ? 'border-emerald-500' : validationStatus.s5 === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`}
                              placeholder="5n + 10"
                          />
                          <button onClick={() => handleStepCheck(task === 1 ? '3n - 1' : '3t + 1', 's5', 6, "Combine Step 2 and Step 4 into one expression.")} className="bg-sky-600 px-6 rounded font-black uppercase">Verify</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-900 p-4 rounded-2xl flex justify-center gap-6 text-3xl font-mono border border-slate-700 shadow-inner relative group">
                      <div className="flex flex-col items-center">
                          <span className="text-sky-400">3</span>
                          <span className="text-[8px] uppercase text-slate-500 mt-1">Difference</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <span className="text-indigo-400">{task === 1 ? 'n' : 't'}</span>
                          <span className="text-[8px] uppercase text-slate-500 mt-1">Variable</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <span className="text-rose-400">{task === 1 ? '- 1' : '+ 1'}</span>
                          <span className="text-[8px] uppercase text-slate-500 mt-1">Adjustment</span>
                      </div>
                    </div>
                  )}
                </div>

                {step === 6 && (
                  <div className="animate-fade-in-up border-t border-indigo-500/20 pt-4">
                    <h3 className="text-lg font-black text-emerald-400 mb-1 uppercase tracking-tighter">Step 6: Use the Rule</h3>
                    <p className="text-sm mb-3 text-slate-300 italic">If {task === 1 ? 'n = 7' : 't = 6'}, what is the value?</p>
                    <div className="flex gap-2">
                      <input
                        value={inputs.s6 || ''}
                        onChange={e => { setInputs({ ...inputs, s6: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s6: null })); }}
                        className={`bg-gray-900 border-2 rounded p-2 flex-grow font-mono text-xl transition-colors ${validationStatus.s6 === 'correct' ? 'border-emerald-500' : validationStatus.s6 === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`}
                        placeholder="..."
                      />
                      <button onClick={handleFinalCheck} className="bg-emerald-600 px-8 rounded font-black uppercase">Check</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loop4Level1;