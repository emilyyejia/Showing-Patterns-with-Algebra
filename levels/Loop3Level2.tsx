import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { LevelComponentProps } from '../types';

type Step = 1 | 2 | 3 | 4;

const STAGE4_ITEMS = [
  { id: 'tn', label: 'term number', category: 'variable', color: 'text-amber-400' },
  { id: 'nt', label: 'number of tiles in each term', category: 'variable', color: 'text-amber-400' },
  { id: 'sv', label: 'starting value', category: 'constant', color: 'text-sky-400' },
  { id: 'at', label: 'add 3 tiles each term', category: 'constant', color: 'text-sky-400' },
];

const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} className={className}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const DraggableItem: React.FC<{ item: typeof STAGE4_ITEMS[0]; isPlaced: boolean }> = ({ item, isPlaced }) => {
  const [{ isDragging }, drag] = useDrag(() => ({ type: 'vocab', item: { id: item.id }, collect: (monitor) => ({ isDragging: !!monitor.isDragging() }) }), [item]);
  return <div ref={drag} className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all cursor-grab active:cursor-grabbing shadow-lg ${isPlaced ? 'opacity-20 pointer-events-none' : 'opacity-100 bg-gray-700 border-gray-600 hover:border-gray-500'}`}><span className={item.color}>{item.label}</span></div>;
};

const DropBox: React.FC<{ category: string; label: string; placedIds: string[]; onDrop: (id: string) => void; onRemove: (id: string) => void; status?: 'incorrect' }> = ({ category, label, placedIds, onDrop, onRemove, status }) => {
  const [{ isOver }, drop] = useDrop(() => ({ accept: 'vocab', drop: (item: { id: string }) => onDrop(item.id), collect: (monitor) => ({ isOver: !!monitor.isOver() }) }), [onDrop]);
  return (
    <div ref={drop} className={`p-6 rounded-2xl border-4 border-dashed transition-all min-h-[160px] flex flex-col items-center gap-3 ${isOver ? 'bg-sky-500/10 border-sky-400' : 'bg-gray-900/40 border-gray-700'} ${status === 'incorrect' ? 'border-rose-500 ring-4 ring-rose-500/10 animate-pulse' : ''}`}>
      <h3 className="text-xl font-black text-gray-500 uppercase tracking-widest">{label}</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {placedIds.map(id => { 
          const item = STAGE4_ITEMS.find(i => i.id === id); 
          return (
            <div 
              key={id} 
              onClick={() => onRemove(id)} 
              className="group relative bg-sky-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md animate-fade-in-up cursor-pointer hover:bg-rose-500 transition-colors"
            >
              {item?.label}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                <span className="text-[10px] font-black uppercase">Remove</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Loop3Level2Inner: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [step, setStep] = useState<Step>(() => partialProgress?.step || 1);
  const [qIndex, setQIndex] = useState(0);
  const [input, setInput] = useState('');
  const [qAnswers, setQAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  const [selectedMCQ, setSelectedMCQ] = useState<string | null>(null);
  const [placedStage4, setPlacedStage4] = useState<Record<string, string[]>>({ variable: [], constant: [] });
  const [stage4Error, setStage4Error] = useState(false);
  
  const [q2Dropdown1, setQ2Dropdown1] = useState('');
  const [q2Dropdown2, setQ2Dropdown2] = useState('');
  const [validationStatus, setValidationStatus] = useState<Record<string, 'correct' | 'incorrect' | null>>({});

  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => { if (!isCompletedRef.current && onSavePartialProgress) onSavePartialProgress({ step }); };
  }, [step]);

  const showCorrect = () => { setFeedback({ type: 'correct', message: '✨ Correct!' }); setTimeout(() => { setFeedback(null); setValidationStatus({}); }, 1500); };
  const showIncorrect = (msg: string) => { setFeedback({ type: 'incorrect', message: msg }); };

  const checkStep1 = () => {
    if (qIndex === 0) {
        const isCorrect = input.trim() === '100';
        setValidationStatus({ q1: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setQAnswers([...qAnswers, "100"]); setQIndex(1); setInput(''); }
        else showIncorrect("Check the prompt again. You earn 100 coins when you sign up.");
    } else if (qIndex === 1) {
        const isCorrect = q2Dropdown1 === 'add' && q2Dropdown2 === '50';
        setValidationStatus({ q2: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setQAnswers([...qAnswers, "add 50"]); setQIndex(2); }
        else showIncorrect("The game says you get 50 coins for *every* level. That's a repeated addition.");
    } else if (qIndex === 2) {
        const isCorrect = input.trim() === '5';
        setValidationStatus({ q3: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setQAnswers([...qAnswers, "5"]); setQIndex(3); setInput(''); }
        else showIncorrect("Term number represents the specific position or step. Level 5 means n = 5.");
    } else if (qIndex === 3) {
        const isCorrect = input.trim() === '350';
        setValidationStatus({ q4: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setStep(2); setQIndex(0); setInput(''); setQAnswers([]); }
        else showIncorrect("Math: 100 (start) + 5 levels × 50 = 350.");
    }
  };

  const checkStep2 = () => {
    const val = input.trim();
    if (qIndex === 0) {
        const isCorrect = val === '7';
        setValidationStatus({ q1: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setQAnswers([...qAnswers, "7"]); setQIndex(1); setInput(''); }
        else showIncorrect("The prompt mentions 7 days. That's our term number.");
    } else if (qIndex === 1) {
        const isCorrect = val === '15';
        setValidationStatus({ q2: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setQAnswers([...qAnswers, "15"]); setQIndex(2); setInput(''); }
        else showIncorrect("Check the gain per day: 15 followers.");
    } else if (qIndex === 2) {
        const isCorrect = val === '120';
        setValidationStatus({ q3: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setQAnswers([...qAnswers, "120"]); setQIndex(3); setInput(''); }
        else showIncorrect("Starting value is the initial count: 120.");
    } else if (qIndex === 3) {
        const isCorrect = val === '180';
        setValidationStatus({ q4: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setStep(3); setQIndex(0); setInput(''); setQAnswers([]); }
        else showIncorrect("Calculation: 120 + (4 days × 15) = 180.");
    }
  };

  const checkStep3 = () => {
    const isCorrect = selectedMCQ === 'C';
    setValidationStatus({ mcq: isCorrect ? 'correct' : 'incorrect' });
    if (isCorrect) { showCorrect(); setTimeout(() => setStep(4), 1500); }
    else showIncorrect("Incorrect. Look at Option C: The 'constant' is actually the starting value (2), while 3 is the 'constant difference'.");
  };

  const checkStep4 = () => {
    const totalPlaced = placedStage4.variable.length + placedStage4.constant.length;
    if (totalPlaced < STAGE4_ITEMS.length) { showIncorrect(`Finish sorting first! (${totalPlaced}/${STAGE4_ITEMS.length})`); return; }
    
    const allCorrect = STAGE4_ITEMS.every(item => placedStage4[item.category].includes(item.id));
    if (allCorrect) { 
      setValidationStatus({ sorting: 'correct' });
      onComplete(3);
      isCompletedRef.current = true; 
      handleCorrectFinal(); 
    } else { 
      setValidationStatus({ sorting: 'incorrect' });
      setStage4Error(true); 
      showIncorrect("Variables can change. Constants stay fixed. Click labels to remove them and retry."); 
    }
  };

  const resetCurrentStep = () => {
    setQIndex(0);
    setInput('');
    setQAnswers([]);
    setSelectedMCQ(null);
    setPlacedStage4({ variable: [], constant: [] });
    setStage4Error(false);
    setQ2Dropdown1('');
    setQ2Dropdown2('');
    setFeedback(null);
  };

  const handleCorrectFinal = () => {
      setFeedback({ type: 'correct', message: "✨ Level Mastered!" });
      setTimeout(() => { setFeedback(null); }, 1500);
  };

  const mixedStage4Items = useMemo(() => [...STAGE4_ITEMS].sort(() => Math.random() - 0.5), [step]);

  const handleReplay = () => {
      setStep(1); setQIndex(0); setInput(''); setQAnswers([]);
      setPlacedStage4({ variable: [], constant: [] });
      isCompletedRef.current = false;
  };

  if (isCompletedRef.current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-8 text-center animate-fade-in">
        <h2 className="text-4xl font-bold text-emerald-400 mb-6 uppercase italic tracking-tighter">Level Mastered!</h2>
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <StarIcon key={i} filled={true} className="w-16 h-16 text-yellow-400" />
          ))}
        </div>
        <p className="text-xl text-gray-300 mb-10 max-w-md">You've successfully identified variables and constants in real-world scenarios.</p>
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
      <h1 className="text-3xl font-black mb-8 text-sky-400 italic uppercase">Identifying Constants</h1>

      <div className="flex gap-4 mb-10">
        {[1, 2, 3, 4].map(i => (
          <button 
            key={i} 
            onClick={() => { setStep(i as Step); setQIndex(0); setInput(''); setQAnswers([]); }} 
            className={`h-4 w-4 rounded-full transition-all duration-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${i <= step ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]' : 'bg-gray-700'}`}
            aria-label={`Go to step ${i}`}
          />
        ))}
      </div>

      {step === 4 && !isCompletedRef.current && (
        <p className="text-center text-white mb-6 text-xl font-medium animate-fade-in">
          Classify the elements into Variables or Constants.
        </p>
      )}

      <div className="w-full max-w-3xl bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl relative">
        {feedback && (
          <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-full px-8 py-3 rounded-2xl font-bold shadow-2xl z-50 animate-fade-in text-center ${
            feedback.type === 'correct' ? 'bg-emerald-500' : 'bg-rose-600 border-2 border-rose-400'
          }`}>
            {feedback.message}
          </div>
        )}

        <>
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="bg-indigo-950/30 p-6 rounded-2xl mb-8 border border-indigo-500/30 text-lg">"In a new online game, you earn <span className="font-bold text-sky-300">100 coins</span> when you sign up and <span className="font-bold text-sky-300">50 coins</span> for every level you complete."</div>
              <div className="space-y-6">
                {[ "1. What is the starting value?", "2. What is the pattern for completing each level?", "3. What is the term number if you've completed 5 levels?", "4. What is the term value for the 5th level?" ].map((text, i) => (
                  <div key={i} className={`transition-opacity duration-500 ${qIndex >= i ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                    <p className="text-lg font-bold mb-3">{text}</p>
                    {qIndex === i ? (
                      <div className="flex gap-4">
                        {i === 1 ? (
                            <div className="flex gap-2 w-full">
                                <select className={`bg-gray-900 border-2 rounded-xl px-2 py-2 flex-grow text-white transition-colors ${validationStatus.q2 === 'correct' ? 'border-emerald-500' : validationStatus.q2 === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`} value={q2Dropdown1} onChange={e=>{setQ2Dropdown1(e.target.value); setFeedback(null); setValidationStatus(prev => ({ ...prev, q2: null })); }}><option value="">Action...</option><option value="add">add</option><option value="subtract">subtract</option></select>
                                <select className={`bg-gray-900 border-2 rounded-xl px-2 py-2 flex-grow text-white transition-colors ${validationStatus.q2 === 'correct' ? 'border-emerald-500' : validationStatus.q2 === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`} value={q2Dropdown2} onChange={e=>{setQ2Dropdown2(e.target.value); setFeedback(null); setValidationStatus(prev => ({ ...prev, q2: null })); }}><option value="">Value...</option><option value="100">100</option><option value="50">50</option></select>
                                <button onClick={checkStep1} className="bg-sky-600 hover:bg-sky-500 px-6 rounded-xl font-black uppercase">Check</button>
                            </div>
                        ) : (
                            <>
                              <input className={`bg-gray-900 border-2 rounded-xl px-4 py-2 text-xl font-mono focus:outline-none w-full transition-colors ${validationStatus[`q${i+1}`] === 'correct' ? 'border-emerald-500' : validationStatus[`q${i+1}`] === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`} value={input} onChange={e => { setInput(e.target.value); setFeedback(null); setValidationStatus(prev => ({ ...prev, [`q${i+1}`]: null })); }} placeholder="Type number..." />
                              <button onClick={checkStep1} className="bg-sky-600 hover:bg-sky-500 px-8 rounded-xl font-black uppercase whitespace-nowrap">Check Answer</button>
                            </>
                        )}
                      </div>
                    ) : qIndex > i ? <div className="bg-gray-900/50 p-3 rounded-xl border border-emerald-500/30 text-emerald-400 font-mono text-xl">{qAnswers[i]}</div> : null}
                  </div>
                ))}
              </div>
              {qIndex > 0 && <button onClick={resetCurrentStep} className="mt-8 text-slate-500 hover:text-slate-300 uppercase font-black text-[10px] tracking-widest transition-colors">Start Step Over</button>}
            </div>
          )}
                    {step === 2 && (
            <div className="animate-fade-in">
              <div className="bg-emerald-900/30 p-6 rounded-2xl mb-8 border border-emerald-500/30 text-lg">"Your social media account started with <span className="font-bold text-emerald-300">120 followers</span> and gained <span className="font-bold text-emerald-300">15 followers</span> every day."</div>
              <div className="space-y-6">
                {[ "1. What is the term number if you've logged in for 7 days?", "2. What is the pattern for each day?", "3. What is the starting value?", "4. What is the term value for the 4th day?" ].map((text, i) => (
                  <div key={i} className={`transition-opacity duration-500 ${qIndex >= i ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                    <p className="text-lg font-bold mb-3">{text}</p>
                    {qIndex === i ? (
                      <div className="flex gap-4"><input className={`bg-gray-900 border-2 rounded-xl px-4 py-2 text-xl font-mono focus:outline-none w-full transition-colors ${validationStatus[`q${i+1}`] === 'correct' ? 'border-emerald-500' : validationStatus[`q${i+1}`] === 'incorrect' ? 'border-rose-500' : 'border-emerald-500'}`} value={input} onChange={e => { setInput(e.target.value); setFeedback(null); setValidationStatus(prev => ({ ...prev, [`q${i+1}`]: null })); }} placeholder="Type number..." /><button onClick={checkStep2} className="bg-sky-600 hover:bg-sky-500 px-8 rounded-xl font-black uppercase whitespace-nowrap">Check Answer</button></div>
                    ) : qIndex > i ? <div className="bg-gray-900/50 p-3 rounded-xl border border-emerald-500/30 text-emerald-400 font-mono text-xl">{qAnswers[i]}</div> : null}
                  </div>
                ))}
              </div>
              {qIndex > 0 && <button onClick={resetCurrentStep} className="mt-8 text-slate-500 hover:text-slate-300 uppercase font-black text-[10px] tracking-widest transition-colors">Start Step Over</button>}
            </div>
          )}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-900 px-6 py-4 rounded-2xl border-2 border-indigo-500 text-3xl font-mono text-indigo-300 mb-6 shadow-xl">2, 5, 8, 11, 14, ...</div>
                  <table className="w-64 border-collapse bg-gray-900 rounded-xl overflow-hidden border border-gray-600"><thead className="bg-gray-700 text-xs"><tr><th className="p-2 border border-gray-600 text-xs uppercase text-indigo-200">n</th><th className="p-2 border border-gray-600 text-xs uppercase text-indigo-200">Value</th></tr></thead><tbody className="font-mono text-center">{[1,2,3,4].map(n => <tr key={n}><td className="p-2 border border-gray-600">{n}</td><td className="p-2 border border-gray-600 text-sky-400 font-bold">{2 + (n-1)*3}</td></tr>)}</tbody></table>
                </div>
                <div className="flex-grow">
                  <h2 className="text-xl font-black mb-6 text-indigo-200 uppercase tracking-tighter">Which statement is <span className="text-rose-400 underline underline-offset-4">NOT</span> correct?</h2>
                  <div className="space-y-3">{[ { id: 'A', text: 'The variable is n.' }, { id: 'B', text: 'The constant difference is 3.' }, { id: 'C', text: 'The constant is 3.' }, { id: 'D', text: 'The starting value is 2.' } ].map(opt => <button key={opt.id} onClick={() => { setSelectedMCQ(opt.id); setFeedback(null); setValidationStatus(prev => ({ ...prev, mcq: null })); }} className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all hover:scale-[1.02] ${selectedMCQ === opt.id ? (validationStatus.mcq === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus.mcq === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-105 shadow-lg') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}><span className="text-sky-300 mr-2">{opt.id}.</span> {opt.text}</button>)}</div>
                  <button onClick={checkStep3} className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-black text-xl shadow-lg transition-transform active:scale-95 uppercase">Verify Choice</button>
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="animate-fade-in flex flex-col items-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-10">
                <DropBox category="variable" label="Variables" placedIds={placedStage4.variable} onDrop={id => { setPlacedStage4(prev => ({...prev, variable: [...prev.variable.filter(x => x !== id), id], constant: prev.constant.filter(x => x !== id)})); setFeedback(null); }} onRemove={id => { setPlacedStage4(prev => ({...prev, variable: prev.variable.filter(x => x !== id)})); setFeedback(null); }} status={stage4Error ? 'incorrect' : undefined} />
                <DropBox category="constant" label="Constants" placedIds={placedStage4.constant} onDrop={id => { setPlacedStage4(prev => ({...prev, constant: [...prev.constant.filter(x => x !== id), id], variable: prev.variable.filter(x => x !== id)})); setFeedback(null); }} onRemove={id => { setPlacedStage4(prev => ({...prev, constant: prev.constant.filter(x => x !== id)})); setFeedback(null); }} status={stage4Error ? 'incorrect' : undefined} />
              </div>
              <div className="flex flex-wrap gap-3 justify-center mb-10 p-6 bg-gray-900/50 rounded-3xl border border-dashed border-gray-700">
                {mixedStage4Items.map(item => (
                  <DraggableItem key={item.id} item={item} isPlaced={placedStage4.variable.includes(item.id) || placedStage4.constant.includes(item.id)} />
                ))}
              </div>
              <div className="flex gap-4 w-full">
                  <button onClick={resetCurrentStep} className="flex-1 bg-gray-700 hover:bg-gray-600 py-4 rounded-xl font-bold uppercase tracking-widest transition-colors">Clear All</button>
                  <button onClick={checkStep4} className="flex-[3] bg-sky-600 hover:bg-sky-500 py-4 rounded-xl font-black text-xl shadow-lg uppercase tracking-tighter">Submit Sorting</button>
              </div>
            </div>
          )}
        </>
      </div>
    </div>
  );
};

const Loop3Level2: React.FC<LevelComponentProps> = (props) => (<DndProvider backend={HTML5Backend}><Loop3Level2Inner {...props} /></DndProvider>);
export default Loop3Level2;
