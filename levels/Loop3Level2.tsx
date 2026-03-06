import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { LevelComponentProps } from '../types';
import GlossaryButton from '../components/GlossaryButton';
import GlossaryModal from '../components/GlossaryModal';

type Step = 1 | 2 | 3 | 4;

const STAGE4_ITEMS = [
  { id: 'tn', label: 'term number', category: 'variable' },
  { id: 'nt', label: 'number of tiles in each term', category: 'variable' },
  { id: 'sv', label: 'starting value', category: 'constant' },
  { id: 'at', label: 'add 3 tiles each term', category: 'constant' },
];

const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} className={className}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const DraggableItem: React.FC<{ item: typeof STAGE4_ITEMS[0]; isPlaced: boolean }> = ({ item, isPlaced }) => {
  const [{ isDragging }, drag] = useDrag(() => ({ type: 'vocab', item: { id: item.id }, collect: (monitor) => ({ isDragging: !!monitor.isDragging() }) }), [item]);
  return <div ref={drag} className={`px-6 py-4 rounded-xl border-2 font-bold text-lg transition-all cursor-grab active:cursor-grabbing shadow-lg ${isPlaced ? 'opacity-20 pointer-events-none' : 'opacity-100 bg-gray-700 border-gray-600 hover:border-gray-500'}`}>{item.label}</div>;
};

const DropBox: React.FC<{ category: string; label: string; placedIds: string[]; onDrop: (id: string) => void; onRemove: (id: string) => void; status?: 'incorrect' }> = ({ category, label, placedIds, onDrop, onRemove, status }) => {
  const [{ isOver }, drop] = useDrop(() => ({ accept: 'vocab', drop: (item: { id: string }) => onDrop(item.id), collect: (monitor) => ({ isOver: !!monitor.isOver() }) }), [onDrop]);
  return (
    <div ref={drop} className={`p-8 rounded-2xl border-4 border-dashed transition-all min-h-[200px] flex flex-col items-center gap-4 ${isOver ? 'bg-sky-500/10 border-sky-400' : 'bg-gray-900/40 border-gray-700'} ${status === 'incorrect' ? 'border-rose-500 ring-4 ring-rose-500/10 animate-pulse' : ''}`}>
      <h3 className="text-2xl font-black text-gray-500 tracking-widest">{label}</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {placedIds.map(id => { 
          const item = STAGE4_ITEMS.find(i => i.id === id); 
          return (
            <div 
              key={id} 
              onClick={() => onRemove(id)} 
              className="group relative bg-sky-600 text-white px-4 py-2.5 rounded-lg text-base font-bold shadow-md animate-fade-in-up cursor-pointer hover:bg-rose-500 transition-colors"
            >
              {item?.label}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                <span className="text-xs font-black">remove</span>
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
  const [q2Status, setQ2Status] = useState<{ dropdown1: 'correct' | 'incorrect' | null; dropdown2: 'correct' | 'incorrect' | null }>({ dropdown1: null, dropdown2: null });
  
  const [step2Q2Dropdown1, setStep2Q2Dropdown1] = useState('');
  const [step2Q2Dropdown2, setStep2Q2Dropdown2] = useState('');
  const [step2Q2Status, setStep2Q2Status] = useState<{ dropdown1: 'correct' | 'incorrect' | null; dropdown2: 'correct' | 'incorrect' | null }>({ dropdown1: null, dropdown2: null });
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

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
        else showIncorrect("Try again! How much do you earn when you sign up?");
    } else if (qIndex === 1) {
        const dropdown1Correct = q2Dropdown1 === 'add';
        const dropdown2Correct = q2Dropdown2 === '50';
        const isCorrect = dropdown1Correct && dropdown2Correct;
        setQ2Status({ dropdown1: dropdown1Correct ? 'correct' : 'incorrect', dropdown2: dropdown2Correct ? 'correct' : 'incorrect' });
        setValidationStatus({ q2: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setQAnswers([...qAnswers, "add 50"]); setQIndex(2); setQ2Status({ dropdown1: null, dropdown2: null }); }
        else showIncorrect("What changes when you go from Level 1 to Level 2, Level 2 to Level 3, and so on?");
    } else if (qIndex === 2) {
        const isCorrect = input.trim() === '5';
        setValidationStatus({ q3: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setQAnswers([...qAnswers, "5"]); setQIndex(3); setInput(''); }
        else showIncorrect("Term number represents the specific position or step.");
    } else if (qIndex === 3) {
        const isCorrect = input.trim() === '350';
        setValidationStatus({ q4: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setStep(2); setQIndex(0); setInput(''); setQAnswers([]); }
        else showIncorrect("You already know the starting value (100). What happens to your coins each time you complete a level?");
    }
  };

  const checkStep2 = () => {
    const val = input.trim();
    if (qIndex === 0) {
        const isCorrect = val === '7';
        setValidationStatus({ q1: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setQAnswers([...qAnswers, "7"]); setQIndex(1); setInput(''); }
        else showIncorrect("Term number represents the specific position or step.");
    } else if (qIndex === 1) {
        const dropdown1Correct = step2Q2Dropdown1 === 'add';
        const dropdown2Correct = step2Q2Dropdown2 === '15';
        const isCorrect = dropdown1Correct && dropdown2Correct;
        setStep2Q2Status({ dropdown1: dropdown1Correct ? 'correct' : 'incorrect', dropdown2: dropdown2Correct ? 'correct' : 'incorrect' });
        setValidationStatus({ q2: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setQAnswers([...qAnswers, "add 15"]); setQIndex(2); setStep2Q2Status({ dropdown1: null, dropdown2: null }); }
        else showIncorrect("Think about what happens to the number of followers each day.");
    } else if (qIndex === 2) {
        const isCorrect = val === '120';
        setValidationStatus({ q3: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setQAnswers([...qAnswers, "120"]); setQIndex(3); setInput(''); }
        else showIncorrect("Try again! How many followers are you starting with?");
    } else if (qIndex === 3) {
        const isCorrect = val === '180';
        setValidationStatus({ q4: isCorrect ? 'correct' : 'incorrect' });
        if (isCorrect) { showCorrect(); setStep(3); setQIndex(0); setInput(''); setQAnswers([]); }
        else showIncorrect("You already know the starting value (120). Use that pattern to find the total on Day 4.");
    }
  };

  const checkStep3 = () => {
    const isCorrect = selectedMCQ === 'C';
    setValidationStatus({ mcq: isCorrect ? 'correct' : 'incorrect' });
    if (isCorrect) { showCorrect(); setTimeout(() => setStep(4), 1500); }
    else showIncorrect("Try again! Check the glossary to review the terms.");
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
      showIncorrect("Try again! Variables can change and constants stay the same."); 
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
    setStep2Q2Dropdown1('');
    setStep2Q2Dropdown2('');
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
      <GlossaryButton onClick={() => setIsGlossaryOpen(true)} />
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
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
        <p className="text-center text-white mb-6 text-3xl font-bold leading-relaxed animate-fade-in">
          Drag and drop each term into the correct box, decide if it is a variable or a constant.
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
              <div className="mb-8 text-2xl leading-relaxed">"in a new online game, you earn <span className="font-bold">100 coins</span> when you sign up and <span className="font-bold">50 coins</span> for every level you complete."</div>
              <div className="space-y-6">
                {[ "1. what is the starting value?", "2. what is the pattern for completing each level?", "3. what is the term number if you've completed 5 levels?", "4. what is the term value for the 5th level?" ].map((text, i) => (
                  <div key={i} className={`transition-opacity duration-500 ${qIndex >= i ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                    <p className="text-xl font-bold mb-3">{text}</p>
                    {qIndex === i ? (
                      <div className="flex gap-4">
                        {i === 1 ? (
                            <div className="flex gap-2 w-full">
                                <select className={`bg-gray-900 border-2 rounded-xl px-2 py-2 flex-grow text-white transition-colors ${q2Status.dropdown1 === 'correct' ? 'border-emerald-500' : q2Status.dropdown1 === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`} value={q2Dropdown1} onChange={e=>{setQ2Dropdown1(e.target.value); setFeedback(null); setValidationStatus(prev => ({ ...prev, q2: null })); setQ2Status({ dropdown1: null, dropdown2: null }); }}><option value="">Action...</option><option value="add">add</option><option value="subtract">subtract</option></select>
                                <select className={`bg-gray-900 border-2 rounded-xl px-2 py-2 flex-grow text-white transition-colors ${q2Status.dropdown2 === 'correct' ? 'border-emerald-500' : q2Status.dropdown2 === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`} value={q2Dropdown2} onChange={e=>{setQ2Dropdown2(e.target.value); setFeedback(null); setValidationStatus(prev => ({ ...prev, q2: null })); setQ2Status({ dropdown1: null, dropdown2: null }); }}><option value="">Value...</option><option value="100">100</option><option value="50">50</option></select>
                                <button onClick={checkStep1} className="bg-sky-600 hover:bg-sky-500 px-6 rounded-xl font-black uppercase">Check</button>
                            </div>
                        ) : (
                            <>
                              <input className={`bg-gray-900 border-2 rounded-xl px-4 py-2 text-xl font-mono focus:outline-none w-full transition-colors ${validationStatus[`q${i+1}`] === 'correct' ? 'border-emerald-500' : validationStatus[`q${i+1}`] === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`} value={input} onChange={e => { setInput(e.target.value); setFeedback(null); setValidationStatus(prev => ({ ...prev, [`q${i+1}`]: null })); }} placeholder="type number..." />
                              <button onClick={checkStep1} className="bg-sky-600 hover:bg-sky-500 px-8 rounded-xl font-black uppercase whitespace-nowrap">Check</button>
                            </>
                        )}
                      </div>
                    ) : qIndex > i ? <div className="bg-gray-900/50 p-3 rounded-xl border border-emerald-500/30 text-emerald-400 font-mono text-xl">{qAnswers[i]}</div> : null}
                  </div>
                ))}
              </div>
            </div>
          )}
                    {step === 2 && (
            <div className="animate-fade-in">
              <div className="mb-8 text-2xl leading-relaxed">"your social media account started with <span className="font-bold">120 followers</span> and gained <span className="font-bold">15 followers</span> every day."</div>
              <div className="space-y-6">
                {[ "1. what is the term number if you've logged in for 7 days?", "2. what is the pattern for each day?", "3. what is the starting value?", "4. what is the term value for the 4th day?" ].map((text, i) => (
                  <div key={i} className={`transition-opacity duration-500 ${qIndex >= i ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                    <p className="text-xl font-bold mb-3">{text}</p>
                    {qIndex === i ? (
                      <div className="flex gap-4">
                        {i === 1 ? (
                            <div className="flex gap-2 w-full">
                                <select className={`bg-gray-900 border-2 rounded-xl px-2 py-2 flex-grow text-white transition-colors ${step2Q2Status.dropdown1 === 'correct' ? 'border-emerald-500' : step2Q2Status.dropdown1 === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`} value={step2Q2Dropdown1} onChange={e=>{setStep2Q2Dropdown1(e.target.value); setFeedback(null); setValidationStatus(prev => ({ ...prev, q2: null })); setStep2Q2Status({ dropdown1: null, dropdown2: null }); }}><option value="">action...</option><option value="add">add</option><option value="subtract">subtract</option></select>
                                <select className={`bg-gray-900 border-2 rounded-xl px-2 py-2 flex-grow text-white transition-colors ${step2Q2Status.dropdown2 === 'correct' ? 'border-emerald-500' : step2Q2Status.dropdown2 === 'incorrect' ? 'border-rose-500' : 'border-sky-500'}`} value={step2Q2Dropdown2} onChange={e=>{setStep2Q2Dropdown2(e.target.value); setFeedback(null); setValidationStatus(prev => ({ ...prev, q2: null })); setStep2Q2Status({ dropdown1: null, dropdown2: null }); }}><option value="">number...</option><option value="120">120</option><option value="15">15</option></select>
                                <button onClick={checkStep2} className="bg-sky-600 hover:bg-sky-500 px-6 rounded-xl font-black uppercase">Check</button>
                            </div>
                        ) : (
                            <><input className={`bg-gray-900 border-2 rounded-xl px-4 py-2 text-xl font-mono focus:outline-none w-full transition-colors ${validationStatus[`q${i+1}`] === 'correct' ? 'border-emerald-500' : validationStatus[`q${i+1}`] === 'incorrect' ? 'border-rose-500' : 'border-emerald-500'}`} value={input} onChange={e => { setInput(e.target.value); setFeedback(null); setValidationStatus(prev => ({ ...prev, [`q${i+1}`]: null })); }} placeholder="type number..." /><button onClick={checkStep2} className="bg-sky-600 hover:bg-sky-500 px-8 rounded-xl font-black uppercase whitespace-nowrap">Check</button></>
                        )}
                      </div>
                    ) : qIndex > i ? <div className="bg-gray-900/50 p-3 rounded-xl border border-emerald-500/30 text-emerald-400 font-mono text-xl">{qAnswers[i]}</div> : null}
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex flex-col items-center">
                  <div className="px-6 py-4 rounded-2xl text-4xl font-mono mb-6">2, 5, 8, 11, 14, ...</div>
                  <table className="w-64 border-collapse rounded-xl overflow-hidden border border-gray-600"><thead className="bg-gray-700 text-sm"><tr><th className="p-3 border border-gray-600 text-sm">n</th><th className="p-3 border border-gray-600 text-sm">value</th></tr></thead><tbody className="font-mono text-center text-lg">{[1,2,3,4].map(n => <tr key={n}><td className="p-3 border border-gray-600">{n}</td><td className="p-3 border border-gray-600 font-bold">{2 + (n-1)*3}</td></tr>)}</tbody></table>
                </div>
                <div className="flex-grow">
                  <h2 className="text-2xl font-black mb-6 tracking-tighter">which statement is <span className="text-rose-400 underline underline-offset-4">not</span> correct?</h2>
                  <div className="space-y-3">{[ { id: 'A', text: 'the variable is n.' }, { id: 'B', text: 'the constant difference is 3.' }, { id: 'C', text: 'the constant is 3.' }, { id: 'D', text: 'the starting value is 2.' } ].map(opt => <button key={opt.id} onClick={() => { setSelectedMCQ(opt.id); setFeedback(null); setValidationStatus(prev => ({ ...prev, mcq: null })); }} className={`w-full p-5 rounded-xl border-2 text-left text-lg font-bold transition-all hover:scale-[1.02] ${selectedMCQ === opt.id ? (validationStatus.mcq === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus.mcq === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-105 shadow-lg') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}>{opt.text}</button>)}</div>
                  <button onClick={checkStep3} className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-black text-xl shadow-lg transition-transform active:scale-95 uppercase">Check</button>
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="animate-fade-in flex flex-col items-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-10">
                <DropBox category="variable" label="variables" placedIds={placedStage4.variable} onDrop={id => { setPlacedStage4(prev => ({...prev, variable: [...prev.variable.filter(x => x !== id), id], constant: prev.constant.filter(x => x !== id)})); setFeedback(null); }} onRemove={id => { setPlacedStage4(prev => ({...prev, variable: prev.variable.filter(x => x !== id)})); setFeedback(null); }} status={stage4Error ? 'incorrect' : undefined} />
                <DropBox category="constant" label="constants" placedIds={placedStage4.constant} onDrop={id => { setPlacedStage4(prev => ({...prev, constant: [...prev.constant.filter(x => x !== id), id], variable: prev.variable.filter(x => x !== id)})); setFeedback(null); }} onRemove={id => { setPlacedStage4(prev => ({...prev, constant: prev.constant.filter(x => x !== id)})); setFeedback(null); }} status={stage4Error ? 'incorrect' : undefined} />
              </div>
              <div className="flex flex-wrap gap-4 justify-center mb-10 p-8 rounded-3xl">
                {mixedStage4Items.map(item => (
                  <DraggableItem key={item.id} item={item} isPlaced={placedStage4.variable.includes(item.id) || placedStage4.constant.includes(item.id)} />
                ))}
              </div>
              <button onClick={checkStep4} className="w-full bg-sky-600 hover:bg-sky-500 py-4 rounded-xl font-black text-xl shadow-lg uppercase tracking-tighter">Check</button>
            </div>
          )}
        </>
      </div>
    </div>
  );
};

const Loop3Level2: React.FC<LevelComponentProps> = (props) => (<DndProvider backend={HTML5Backend}><Loop3Level2Inner {...props} /></DndProvider>);
export default Loop3Level2;
