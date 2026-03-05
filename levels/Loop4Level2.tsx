
import React, { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { LevelComponentProps } from '../types';

const DRAGGABLE_ITEMS = [
  { id: 'cd', label: 'Constant difference' },
  { id: 'con', label: 'Constant' },
  { id: 'var', label: 'Variable' },
];

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = "w-12 h-12" }) => (
    <svg className={`${className} ${filled ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const DraggablePart: React.FC<{ item: typeof DRAGGABLE_ITEMS[0]; isPlaced: boolean }> = ({ item, isPlaced }) => {
  const [{ isDragging }, drag] = useDrag(() => ({ type: 'part', item: { id: item.id }, collect: (monitor) => ({ isDragging: !!monitor.isDragging() }) }), [item]);
  return <div ref={drag} className={`px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg font-bold text-sm cursor-grab active:cursor-grabbing transition-all ${isPlaced ? 'opacity-20 pointer-events-none' : 'opacity-100 hover:border-sky-400 shadow-md'}`}>{item.label}</div>;
};

const DropZone: React.FC<{ expectedId: string; onDrop: (id: string) => void; onRemove: () => void; placedId: string | null; status?: 'correct' | 'incorrect' }> = ({ expectedId, onDrop, onRemove, placedId, status }) => {
  const [{ isOver }, drop] = useDrop(() => ({ accept: 'part', drop: (item: { id: string }) => onDrop(item.id), collect: (monitor) => ({ isOver: !!monitor.isOver() }) }), [onDrop]);
  const label = DRAGGABLE_ITEMS.find(i => i.id === placedId)?.label;
  
  return (
    <div ref={drop} className={`w-48 h-12 border-2 border-dashed rounded-xl flex items-center justify-center transition-all ${isOver ? 'bg-sky-500/10 border-sky-400' : 'bg-gray-950 border-slate-800'} ${status === 'correct' ? 'border-emerald-500 bg-emerald-900/20' : status === 'incorrect' ? 'border-rose-500 bg-rose-900/20' : ''}`}>
      {placedId ? (
        <div 
          onClick={onRemove}
          className={`group relative w-full h-full flex items-center justify-center bg-sky-600 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg animate-fade-in-up cursor-pointer hover:bg-rose-500 transition-colors ${status === 'correct' ? 'bg-emerald-600' : status === 'incorrect' ? 'bg-rose-600' : ''}`}
        >
          <span>{label}</span>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
            <span className="text-[10px] uppercase font-black">Remove</span>
          </div>
        </div>
      ) : (
        <span className="text-[10px] text-slate-700 uppercase font-bold">Drop Part</span>
      )}
    </div>
  );
};

const Loop4Level2Inner: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [step, setStep] = useState<number>(() => partialProgress?.step || 1);
  const [inputs, setInputs] = useState<Record<string, string>>(() => partialProgress?.inputs || { s2cd: '', s2v: '', s2con: '', s2ex: '', s3cd: '', s3v: '', s3con: '', s3ex: '', s4cd: '', s4v: '', s4ex: '' });
  const [mistakes, setMistakes] = useState(() => partialProgress?.mistakes || 0);
  const [s1Placed, setS1Placed] = useState<Record<string, string>>(() => partialProgress?.s1Placed || { cd: '', var: '', con: '' });
  const [s1Status, setS1Status] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  const [isAllComplete, setIsAllComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [validationStatus, setValidationStatus] = useState<Record<string, 'correct' | 'incorrect' | null>>({});

  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => { 
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ step, inputs, mistakes, s1Placed }); 
      }
    };
  }, [step, inputs, mistakes, s1Placed]);

  const showFeedback = (type: 'correct' | 'incorrect', msg?: string) => {
    document.getElementById('level-content-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    setFeedback({ type, message: msg });
  };

  const showCorrect = (next: number | null) => {
    showFeedback('correct', '✨ Correct!');
    setTimeout(() => {
      setValidationStatus({});
      if (next) setStep(next);
      else finishLevel();
    }, 1500);
  };

  const finishLevel = () => {
    let stars = 3;
    if (mistakes >= 5) stars = 1;
    else if (mistakes >= 2) stars = 2;
    
    setEarnedStars(stars);
    setValidationStatus({});
    isCompletedRef.current = true;
    setIsAllComplete(true);
    onComplete(stars);
  };

  const showIncorrect = (msg: string) => {
    setMistakes(m => m + 1);
    showFeedback('incorrect', msg);
  };

  const handleRemoveS1 = (slotKey: string) => {
    setS1Placed(prev => ({ ...prev, [slotKey]: '' }));
    setS1Status(prev => {
        const newStatus = { ...prev };
        delete newStatus[slotKey];
        return newStatus;
    });
    setFeedback(null);
  };

  const checkS1 = () => {
    const status: Record<string, 'correct' | 'incorrect'> = {};
    let allOk = true;
    if (!s1Placed.cd || !s1Placed.var || !s1Placed.con) { showIncorrect("Place all three labels first!"); return; }
    if (s1Placed.cd === 'cd') status.cd = 'correct'; else { status.cd = 'incorrect'; allOk = false; }
    if (s1Placed.var === 'var') status.var = 'correct'; else { status.var = 'incorrect'; allOk = false; }
    if (s1Placed.con === 'con') status.con = 'correct'; else { status.con = 'incorrect'; allOk = false; }
    setS1Status(status);
    if (allOk) showCorrect(2);
    else showIncorrect("Check labels: 5 is the difference, y is the variable, 3 is the adjustment.");
  };

  const checkS2 = () => {
    const cleanedEx = inputs.s2ex.replace(/\s/g, '').toLowerCase();
    const sCD = inputs.s2cd === '20';
    const sV = inputs.s2v.toLowerCase() === 'm';
    const sCon = inputs.s2con === '15';
    const sEx = (cleanedEx === '20m+15' || cleanedEx === '15+20m');

    setValidationStatus({
      s2cd: sCD ? 'correct' : 'incorrect',
      s2v: sV ? 'correct' : 'incorrect',
      s2con: sCon ? 'correct' : 'incorrect',
      s2ex: sEx ? 'correct' : 'incorrect'
    });

    if (sCD && sV && sCon && sEx) showCorrect(3);
    else showIncorrect("Check the registration fee ($15) as the constant.");
  };

  const checkS3 = () => {
    const cleanedEx = inputs.s3ex.replace(/\s/g, '').toLowerCase();
    const sCD = inputs.s3cd === '5';
    const sV = inputs.s3v.toLowerCase() === 'n';
    const sCon = inputs.s3con === '-8';
    const sEx = (cleanedEx === '5n-8' || cleanedEx === '-8+5n');

    setValidationStatus({
      s3cd: sCD ? 'correct' : 'incorrect',
      s3v: sV ? 'correct' : 'incorrect',
      s3con: sCon ? 'correct' : 'incorrect',
      s3ex: sEx ? 'correct' : 'incorrect'
    });

    if (sCD && sV && sCon && sEx) showCorrect(4);
    else showIncorrect("The adjustment is Term 0: Term 1 (-3) - 5 = -8.");
  };

  const checkS4 = () => {
    const cleanedEx = inputs.s4ex.replace(/\s/g, '').toLowerCase();
    const sCD = inputs.s4cd === '3';
    const sV = inputs.s4v.toLowerCase() === 'w';
    const sEx = (cleanedEx === '3w' || cleanedEx === 'w*3');

    setValidationStatus({
      s4cd: sCD ? 'correct' : 'incorrect',
      s4v: sV ? 'correct' : 'incorrect',
      s4ex: sEx ? 'correct' : 'incorrect'
    });

    if (sCD && sV && sEx) showCorrect(null);
    else showIncorrect("The rule is 3 times the width (3w).");
  };

  const goToStep = (i: number) => {
    setStep(i);
    setFeedback(null);
  };

  if (isAllComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-8 text-center animate-fade-in">
        <h2 className="text-4xl font-bold text-emerald-400 mb-6 uppercase italic tracking-tighter">Level Mastered!</h2>
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <StarIcon key={i} filled={i <= earnedStars} className="w-16 h-16 text-yellow-400" />
          ))}
        </div>
        <p className="text-xl text-gray-300 mb-10 max-w-md">
          You've successfully analyzed pattern components and built algebraic expressions from scenarios.
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
    <div className="flex flex-col items-center justify-center min-h-full p-6 text-white font-sans max-w-6xl mx-auto relative select-none">
      <h1 className="text-3xl font-bold mb-8 text-sky-300 uppercase italic">Expression Detective</h1>
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
        <div className={`fixed top-24 px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl z-[200] animate-fade-in border-4 ${
          feedback.type === 'correct' ? 'bg-emerald-500 border-emerald-300' : 'bg-rose-600 border-rose-400'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="w-full max-w-4xl bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 relative mb-10">
        {step === 1 && (
          <div className="animate-fade-in flex flex-col items-center">
            <h2 className="text-xl font-bold text-indigo-300 mb-12 uppercase tracking-widest italic border-b border-indigo-500/30 pb-2">Deconstruct the Parts</h2>
            <div className="flex items-center gap-4 text-8xl font-mono mb-16 relative">
              <div className="flex flex-col items-center">
                <span>5</span>
                <div className="h-10 w-1 bg-slate-700 my-2" />
                <DropZone expectedId="cd" placedId={s1Placed.cd} onDrop={id => setS1Placed(p => ({ ...p, cd: id }))} onRemove={() => handleRemoveS1('cd')} status={s1Status.cd} />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sky-400">y</span>
                <div className="h-20 w-1 bg-slate-700 my-2" />
                <DropZone expectedId="var" placedId={s1Placed.var} onDrop={id => setS1Placed(p => ({ ...p, var: id }))} onRemove={() => handleRemoveS1('var')} status={s1Status.var} />
              </div>
              <span className="mx-4 text-slate-500">+</span>
              <div className="flex flex-col items-center">
                <span>3</span>
                <div className="h-10 w-1 bg-slate-700 my-2" />
                <DropZone expectedId="con" placedId={s1Placed.con} onDrop={id => setS1Placed(p => ({ ...p, con: id }))} onRemove={() => handleRemoveS1('con')} status={s1Status.con} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center p-8 bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-800">
              {DRAGGABLE_ITEMS.map(item => (
                <DraggablePart key={item.id} item={item} isPlaced={Object.values(s1Placed).includes(item.id)} />
              ))}
            </div>
            <button 
                onClick={checkS1} 
                className="mt-12 w-full bg-sky-600 hover:bg-sky-500 py-4 rounded-xl font-black text-xl shadow-lg transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
            >
                Check labels
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="animate-fade-in space-y-10 flex flex-col items-center">
            <div className="bg-indigo-950/40 p-8 rounded-[2.5rem] border border-indigo-500/20 italic text-xl text-center leading-relaxed max-w-2xl">"A gym charges <span className="text-sky-400 font-bold">$20 per month</span> plus a <span className="text-sky-400 font-bold">$15 signup fee</span>. Let <span className="text-amber-400">m</span> be the number of months."</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest text-center">Difference</span>
                <input placeholder="CD" value={inputs.s2cd} onChange={e => { setInputs({ ...inputs, s2cd: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s2cd: null })); }} className={`bg-slate-900 p-5 rounded-2xl border font-mono text-2xl text-center text-sky-400 focus:border-sky-500 outline-none shadow-inner transition-colors ${validationStatus.s2cd === 'correct' ? 'border-emerald-500' : validationStatus.s2cd === 'incorrect' ? 'border-rose-500' : 'border-slate-700'}`} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest text-center">Variable</span>
                <input placeholder="Var" value={inputs.s2v} onChange={e => { setInputs({ ...inputs, s2v: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s2v: null })); }} className={`bg-slate-900 p-5 rounded-2xl border font-mono text-2xl text-center text-amber-400 focus:border-sky-500 outline-none shadow-inner transition-colors ${validationStatus.s2v === 'correct' ? 'border-emerald-500' : validationStatus.s2v === 'incorrect' ? 'border-rose-500' : 'border-slate-700'}`} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest text-center">Constant</span>
                <input placeholder="Con" value={inputs.s2con} onChange={e => { setInputs({ ...inputs, s2con: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s2con: null })); }} className={`bg-slate-900 p-5 rounded-2xl border font-mono text-2xl text-center text-emerald-400 focus:border-sky-500 outline-none shadow-inner transition-colors ${validationStatus.s2con === 'correct' ? 'border-emerald-500' : validationStatus.s2con === 'incorrect' ? 'border-rose-500' : 'border-slate-700'}`} />
              </div>
            </div>
            <div className="w-full flex flex-col gap-2">
               <span className="text-xs uppercase font-black text-slate-500 tracking-widest ml-4">Full Expression</span>
               <input placeholder="5m + 10" value={inputs.s2ex} onChange={e => { setInputs({ ...inputs, s2ex: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s2ex: null })); }} className={`w-full bg-slate-900 p-6 rounded-[1.5rem] border font-mono text-3xl text-center focus:border-sky-500 outline-none shadow-2xl transition-all ${validationStatus.s2ex === 'correct' ? 'border-emerald-500' : validationStatus.s2ex === 'incorrect' ? 'border-rose-500' : 'border-slate-700'}`} />
            </div>
            <button 
                onClick={checkS2} 
                className="w-full bg-sky-600 hover:bg-sky-500 py-4 rounded-xl font-black text-xl shadow-lg transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
            >
                Verify Expression
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="animate-fade-in space-y-10 text-center flex flex-col items-center pt-8">
            <div className="bg-slate-900 px-10 py-6 rounded-3xl border-2 border-indigo-500/50 text-6xl font-mono tracking-widest text-indigo-300 mb-4 shadow-[0_0_50px_rgba(99,102,241,0.1)]">-3, 2, 7, 12...</div>
            <p className="text-slate-400 text-sm mb-6 max-w-lg italic font-bold">Use variable 'n' to represent the term number.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <div className="flex flex-col gap-2">
                <input placeholder="CD" value={inputs.s3cd} onChange={e => { setInputs({ ...inputs, s3cd: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s3cd: null })); }} className={`bg-slate-900 p-5 rounded-2xl border font-mono text-2xl text-center text-sky-400 focus:border-sky-500 outline-none transition-colors ${validationStatus.s3cd === 'correct' ? 'border-emerald-500' : validationStatus.s3cd === 'incorrect' ? 'border-rose-500' : 'border-slate-700'}`} />
              </div>
              <div className="flex flex-col gap-2">
                <input placeholder="variable" value={inputs.s3v} onChange={e => { setInputs({ ...inputs, s3v: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s3v: null })); }} className={`bg-slate-900 p-5 rounded-2xl border font-mono text-2xl text-center text-amber-400 focus:border-sky-500 outline-none transition-colors ${validationStatus.s3v === 'correct' ? 'border-emerald-500' : validationStatus.s3v === 'incorrect' ? 'border-rose-500' : 'border-slate-700'}`} />
              </div>
              <div className="flex flex-col gap-2">
                <input placeholder="constant" value={inputs.s3con} onChange={e => { setInputs({ ...inputs, s3con: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s3con: null })); }} className={`bg-slate-900 p-5 rounded-2xl border font-mono text-2xl text-center text-emerald-400 focus:border-sky-500 outline-none transition-colors ${validationStatus.s3con === 'correct' ? 'border-emerald-500' : validationStatus.s3con === 'incorrect' ? 'border-rose-500' : 'border-slate-700'}`} />
              </div>
            </div>
            <input placeholder="e.g. 2n + 1" value={inputs.s3ex} onChange={e => { setInputs({ ...inputs, s3ex: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s3ex: null })); }} className={`w-full bg-slate-900 p-6 rounded-[1.5rem] border font-mono text-4xl text-center focus:border-sky-500 outline-none shadow-2xl transition-all ${validationStatus.s3ex === 'correct' ? 'border-emerald-500' : validationStatus.s3ex === 'incorrect' ? 'border-rose-500' : 'border-slate-700'}`} />
            <button 
                onClick={checkS3} 
                className="w-full bg-sky-600 hover:bg-sky-500 py-4 rounded-xl font-black text-xl shadow-lg transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
            >
                Verify Expression
            </button>
          </div>
        )}
        {step === 4 && (
          <div className="animate-fade-in space-y-10 flex flex-col items-center">
            <h2 className="text-xl font-bold text-sky-300 italic uppercase">The Mystery Rectangle</h2>
            <div className="flex flex-col md:flex-row gap-10 items-center w-full justify-center">
                <div className="bg-white p-12 rounded-3xl shadow-xl relative w-full max-w-sm flex items-center justify-center">
                    <div className="w-full h-24 bg-sky-200 border-4 border-sky-600 flex items-center justify-center rounded-xl relative shadow-inner">
                        <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-slate-800 font-black text-xl">w</span>
                        <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-slate-800 font-black text-xl">L</span>
                    </div>
                </div>
                <table className="w-48 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                  <thead className="bg-slate-800 text-xs uppercase tracking-widest text-slate-500"><tr><th className="p-3">Width (w)</th><th className="p-3">Length (L)</th></tr></thead>
                  <tbody className="font-mono text-xl text-center">
                    {[[1,3], [2, 6], [3, 9]].map(([w, l]) => <tr key={w} className="border-t border-slate-800"><td className="p-3">{w}</td><td className="p-3 text-sky-400 font-bold">{l}</td></tr>)}
                  </tbody>
                </table>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
              <input placeholder="Difference" value={inputs.s4cd} onChange={e => { setInputs({ ...inputs, s4cd: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s4cd: null })); }} className={`bg-slate-900 p-5 rounded-2xl border font-mono text-2xl text-center text-sky-400 transition-colors ${validationStatus.s4cd === 'correct' ? 'border-emerald-500' : validationStatus.s4cd === 'incorrect' ? 'border-rose-500' : 'border-slate-700'}`} />
              <input placeholder="Variable" value={inputs.s4v} onChange={e => { setInputs({ ...inputs, s4v: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s4v: null })); }} className={`bg-slate-900 p-5 rounded-2xl border font-mono text-2xl text-center text-amber-400 transition-colors ${validationStatus.s4v === 'correct' ? 'border-emerald-500' : validationStatus.s4v === 'incorrect' ? 'border-rose-500' : 'border-slate-700'}`} />
            </div>
            <input placeholder="Relationship Rule" value={inputs.s4ex} onChange={e => { setInputs({ ...inputs, s4ex: e.target.value }); setFeedback(null); setValidationStatus(prev => ({ ...prev, s4ex: null })); }} className={`w-full bg-slate-900 p-6 rounded-[1.5rem] border font-mono text-4xl text-center focus:border-sky-500 outline-none shadow-2xl transition-all ${validationStatus.s4ex === 'correct' ? 'border-emerald-500' : validationStatus.s4ex === 'incorrect' ? 'border-rose-500' : 'border-slate-700'}`} />
            <button 
                onClick={checkS4} 
                className="w-full bg-sky-600 hover:bg-sky-500 py-4 rounded-xl font-black text-xl shadow-lg transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
            >
                Complete Investigation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Loop4Level2: React.FC<LevelComponentProps> = (props) => (<DndProvider backend={HTML5Backend}><Loop4Level2Inner {...props} /></DndProvider>);
export default Loop4Level2;
