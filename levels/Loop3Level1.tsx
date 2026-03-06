import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { LevelComponentProps } from '../types';
import InstructionModal from '../components/InstructionModal';
import InstructionButton from '../components/InstructionButton';
import GlossaryButton from '../components/GlossaryButton';
import GlossaryModal from '../components/GlossaryModal';

interface VocabItem { id: string; label: string; }

const STAGE1_VOCAB: VocabItem[] = [
  { id: 'tn', label: 'the flag position (1st, 2nd, 3rd...)' },
  { id: 'cd', label: 'same distance between flags' },
  { id: 'sv', label: 'distance at flag 1 = 0 km' },
  { id: 'tv', label: 'total distance to reach flag n' },
];

const STAGE1_SLOTS = [
  { id: 'tn', text: 'Term number (n) (variable)' },
  { id: 'cd', text: 'Constant difference (d)' },
  { id: 'sv', text: 'Starting value (constant)' },
  { id: 'tv', text: 'Term value' },
];

const STAGE3_MATCHES = [
  { id: 'sv', vocab: 'Starting value', desc: 'The value of the pattern at the first term (when the term number is 1).', color: 'text-yellow-400' },
  { id: 'var', vocab: 'Variable', desc: 'A letter that represents a number that can change. In patterns, it usually represents the term number.', color: 'text-sky-400' },
  { id: 'tv', vocab: 'Term value', desc: 'The number that appears at a specific term number.', color: 'text-emerald-400' },
  { id: 'con', vocab: 'Constant', desc: 'A number that stays the same and does not change.', color: 'text-amber-500' },
  { id: 'cd', vocab: 'Constant difference', desc: 'The same amount added or subtracted each time in a pattern.', color: 'text-rose-400' },
  { id: 'tn', vocab: 'Term number', desc: 'The position of a term in a pattern (1st, 2nd, 3rd, ...).', color: 'text-fuchsia-400' },
  { id: 'pat', vocab: 'Pattern', desc: 'A list of numbers or objects that follows a rule.', color: 'text-blue-400' },
];

const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={filled ? "#FACC15" : "none"} stroke={filled ? "#FACC15" : "#4B5563"} strokeWidth={filled ? 0 : 1.5} className={className}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const DraggableVocab: React.FC<{ item: VocabItem; isPlaced: boolean; status?: 'correct' | 'incorrect' }> = ({ item, isPlaced, status }) => {
  const [{ isDragging }, drag] = useDrag(() => ({ type: 'vocab', item: { id: item.id }, collect: (monitor) => ({ isDragging: !!monitor.isDragging() }) }), [item]);
  return <div ref={drag} className={`px-3 py-2 rounded-lg border-2 font-bold text-xs transition-all cursor-grab active:cursor-grabbing ${isPlaced ? 'opacity-30 pointer-events-none' : 'opacity-100'} ${status === 'correct' ? 'border-emerald-500 bg-emerald-900/20' : status === 'incorrect' ? 'border-rose-500 bg-rose-900/20' : 'border-sky-500 bg-sky-900/40 hover:bg-sky-800'}`}>{item.label}</div>;
};

const DropSlot: React.FC<{ slotId: string; text: string; placedId: string | null; onDrop: (id: string) => void; onRemove: () => void; status?: 'correct' | 'incorrect' }> = ({ slotId, text, placedId, onDrop, onRemove, status }) => {
  const [{ isOver }, drop] = useDrop(() => ({ accept: 'vocab', drop: (item: { id: string }) => onDrop(item.id), collect: (monitor) => ({ isOver: !!monitor.isOver() }) }), [onDrop]);
  const placedLabel = STAGE1_VOCAB.find(v => v.id === placedId)?.label;
  return (
    <div ref={drop} className={`p-3 rounded-xl border-2 border-dashed transition-all min-h-[90px] flex flex-col gap-2 ${isOver ? 'bg-sky-500/10 border-sky-400' : 'bg-gray-900/40 border-gray-700'} ${status === 'correct' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : status === 'incorrect' ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`}>
      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{text}</span>
      {placedId && (
        <div 
          onClick={onRemove}
          className={`group relative bg-sky-600 text-white p-2 rounded-lg text-xs font-bold shadow-lg animate-fade-in-up cursor-pointer hover:bg-rose-500 transition-colors ${status === 'correct' ? 'bg-emerald-600' : status === 'incorrect' ? 'bg-rose-600' : ''}`}
        >
          {placedLabel}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
            <span className="text-[10px] uppercase font-black">Remove</span>
          </div>
        </div>
      )}
    </div>
  );
};

const DraggableItem3: React.FC<{ id: string; label: string; isPlaced: boolean; color: string }> = ({ id, label, isPlaced, color }) => {
  const [{ isDragging }, drag] = useDrag(() => ({ type: 'vocab-match', item: { id }, collect: (monitor) => ({ isDragging: !!monitor.isDragging() }) }), [id]);
  return <div ref={drag} className={`px-6 py-3 rounded-xl border-2 font-bold text-lg cursor-grab active:cursor-grabbing transition-all ${isPlaced ? 'opacity-20 pointer-events-none' : 'opacity-100 bg-gray-700 border-gray-600 hover:border-sky-500 shadow-lg'} ${isDragging ? 'scale-105 rotate-2' : ''} ${color}`}>{label}</div>;
};

const DropTarget3: React.FC<{ index: number; description: string; placedId: string | null; onDrop: (id: string) => void; status?: 'correct' | 'incorrect'; onRemove: () => void }> = ({ index, description, placedId, onDrop, status, onRemove }) => {
  const [{ isOver }, drop] = useDrop(() => ({ accept: 'vocab-match', drop: (item: { id: string }) => onDrop(item.id), collect: (monitor) => ({ isOver: !!monitor.isOver() }) }), [onDrop]);
  const placedItem = STAGE3_MATCHES.find(m => m.id === placedId);
  return (
    <div ref={drop} className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col md:flex-row items-center gap-6 ${isOver ? 'bg-sky-500/10 border-sky-400' : 'bg-gray-900/40 border-gray-700'} ${status === 'correct' ? 'border-emerald-500 bg-emerald-900/10' : status === 'incorrect' ? 'border-rose-500 bg-rose-900/10' : ''}`}>
      <div className="flex-grow text-base font-medium text-gray-300 italic">{description}</div>
      <div 
        onClick={onRemove} 
        className={`w-48 h-12 rounded-lg flex items-center justify-center font-bold text-sm uppercase tracking-widest border border-gray-600 bg-gray-800/50 cursor-pointer transition-all hover:border-rose-400 group ${placedId ? 'border-sky-500 bg-sky-900/20 shadow-inner' : ''}`}
      >
        {placedId ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <span className={`${placedItem?.color} group-hover:opacity-0`}>{placedItem?.vocab}</span>
            <span className="absolute inset-0 flex items-center justify-center text-rose-400 opacity-0 group-hover:opacity-100">Remove</span>
          </div>
        ) : 'Drop Match'}
      </div>
    </div>
  );
};

const Loop3Level1Inner: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [stage, setStage] = useState(() => partialProgress?.stage || 1);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);

  const [runnerPos, setRunnerPos] = useState(1);
  const [placedStage1, setPlacedStage1] = useState<Record<string, string>>({}); 
  const [stage1Status, setStage1Status] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [validationStatus, setValidationStatus] = useState<Record<string, 'correct' | 'incorrect' | null>>({});

  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);

  const [placedStage3, setPlacedStage3] = useState<Record<number, string>>({});
  const [stage3Status, setStage3Status] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [attempts, setAttempts] = useState(() => partialProgress?.attempts || 0);
  const [earnedStars, setEarnedStars] = useState(0);

  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => { if (!isCompletedRef.current && onSavePartialProgress) onSavePartialProgress({ stage, attempts }); };
  }, [stage, attempts]);

  const handleCorrect = (nextStage?: number) => {
    document.getElementById('level-content-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    setFeedback({ type: 'correct' });
    setTimeout(() => { 
      setFeedback(null); 
      if (nextStage) {
        setStage(nextStage); 
      } else { 
        let stars = 3;
        if (attempts > 4) stars = 1;
        else if (attempts > 1) stars = 2;
        setEarnedStars(stars);
        isCompletedRef.current = true; 
        onComplete(stars); 
      } 
    }, 1500);
  };

  const handleIncorrect = (msg: string) => { 
    setAttempts(a => a + 1);
    document.getElementById('level-content-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    setFeedback({ type: 'incorrect', message: msg }); 
  };

  const checkStage1 = () => {
    const newStatus: Record<string, 'correct' | 'incorrect'> = {};
    let allCorrect = true;
    const placedCount = Object.keys(placedStage1).length;
    if (placedCount < 4) { handleIncorrect(`Place all vocabulary boxes first! (Placed ${placedCount}/4)`); return; }
    
    STAGE1_SLOTS.forEach((slot, index) => { 
      if (placedStage1[index] === slot.id) {
        newStatus[index] = 'correct'; 
      } else { 
        newStatus[index] = 'incorrect'; 
        allCorrect = false; 
      } 
    });
    
    setStage1Status(newStatus);
    if (allCorrect) {
      handleCorrect(2);
    } else {
      handleIncorrect("Try again! Use the information from the table.");
    }
  };

  const resetStage1 = () => {
    setPlacedStage1({});
    setStage1Status({});
    setFeedback(null);
  };

  const validateStage2 = () => { 
    const isQ1Correct = q1 === 'term number';
    const isQ2Correct = q2 === 'add 3 each time';
    setValidationStatus({ q1: isQ1Correct ? 'correct' : 'incorrect', q2: isQ2Correct ? 'correct' : 'incorrect' });
    if (isQ1Correct && isQ2Correct) {
      handleCorrect(3);
    } else {
      handleIncorrect("Think carefully!");
    }
  };

  const checkStage3 = () => {
    const newStatus: Record<number, 'correct' | 'incorrect'> = {}; 
    let allCorrect = true;
    const placedCount = Object.keys(placedStage3).length;
    if (placedCount < STAGE3_MATCHES.length) { handleIncorrect(`Match all definitions first! (Matched ${placedCount}/${STAGE3_MATCHES.length})`); return; }
    
    STAGE3_MATCHES.forEach((item, index) => { 
      if (placedStage3[index] === item.id) {
        newStatus[index] = 'correct'; 
      } else { 
        newStatus[index] = 'incorrect'; 
        allCorrect = false; 
      } 
    });
    
    setStage3Status(newStatus);
    if (allCorrect) { 
      handleCorrect(); 
    } else {
      handleIncorrect("Try again!");
    }
  };

  const resetStage3 = () => {
    setPlacedStage3({});
    setStage3Status({});
    setFeedback(null);
  };

  const randomizedStage1Vocab = useMemo(() => [...STAGE1_VOCAB].sort(() => Math.random() - 0.5), [stage]);
  const randomizedStage3Matches = useMemo(() => [...STAGE3_MATCHES].sort(() => Math.random() - 0.5), [stage]);
  
  const choicesArr = ['term value', 'starting value', 'term number', 'add 3 each time'];
  const randomizedTerms = useMemo(() => [...choicesArr].sort(() => Math.random() - 0.5), []);
  const randomizedDiffs = useMemo(() => [...choicesArr].sort(() => Math.random() - 0.5), []);

  const handleReplay = () => {
      setStage(1);
      setPlacedStage1({});
      setStage1Status({});
      setPlacedStage3({});
      setStage3Status({});
      setRunnerPos(1);
      setQ1(null);
      setQ2(null);
      setAttempts(0);
      setEarnedStars(0);
      isCompletedRef.current = false;
  };

  if (isCompletedRef.current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-8 text-center animate-fade-in">
        <h2 className="text-4xl font-bold text-emerald-400 mb-6 uppercase italic tracking-tighter">Mastery Complete!</h2>
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <StarIcon key={i} filled={i <= earnedStars} className="w-16 h-16 text-yellow-400" />
          ))}
        </div>
        <p className="text-xl text-gray-300 mb-10 max-w-md">You've mastered the building blocks of algebraic patterns.</p>
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
    <div className="flex flex-col items-center min-h-full p-6 text-white font-sans max-w-6xl mx-auto relative select-none">
      <GlossaryButton onClick={() => setIsGlossaryOpen(true)} />
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      <InstructionModal isOpen={isInstructionOpen} onClose={() => setIsInstructionOpen(false)} title="Variables and Constants">
        <p>A <strong>Variable</strong> is something that changes, like the term number.</p>
        <p className="mt-2">A <strong>Constant</strong> is something that stays the same, like the starting value or the common difference.</p>
      </InstructionModal>

      <InstructionButton onClick={() => setIsInstructionOpen(true)} />

      <div className="flex gap-4 mb-10">
        {[1, 2, 3].map(i => (
          <button 
            key={i} 
            onClick={() => { setStage(i); setPlacedStage1({}); setStage1Status({}); setPlacedStage3({}); setStage3Status({}); }} 
            className={`h-4 w-4 rounded-full transition-all duration-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${i <= stage ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]' : 'bg-gray-700'}`}
            aria-label={`Go to stage ${i}`}
          />
        ))}
      </div>

      {/* Stage Instructions - Outside the main box */}
      {stage === 1 && runnerPos === 1 && (
        <p className="text-center text-white mb-6 text-2xl font-bold leading-relaxed animate-fade-in">
          Click "Run Further" and watch how the distance in the table increases for each new flag.
        </p>
      )}
      {stage === 1 && runnerPos > 1 && runnerPos < 6 && (
        <p className="text-center text-white mb-6 text-2xl font-bold leading-relaxed animate-fade-in">
          Continue clicking "Run Further" to reach all flags and see the complete pattern.
        </p>
      )}
      {stage === 1 && runnerPos === 6 && (
        <p className="text-center text-white mb-6 text-2xl font-bold leading-relaxed animate-fade-in">
          Use the information from the image and table on the left. Match each vocabulary term to the correct description by dragging and dropping.
        </p>
      )}
      {stage === 2 && (
        <p className="text-center text-white mb-6 text-2xl font-bold leading-relaxed animate-fade-in">
          Examine the number sequence and the table of values. Then, answer the questions.
        </p>
      )}
      {stage === 3 && (
        <p className="text-center text-white mb-6 text-2xl font-bold leading-relaxed animate-fade-in">
          Drag and drop to match each term with its definition.
        </p>
      )}
      
      {feedback && (
        <div className={`fixed top-24 px-8 py-3 rounded-2xl font-semibold shadow-2xl z-[200] animate-fade-in ${feedback.type === 'correct' ? 'text-emerald-400' : 'text-yellow-400'}`}>
          {feedback.message || '✨ Correct!'}
        </div>
      )}

      <div className="w-full max-w-5xl bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 relative mb-10">
        {stage === 1 && (
          <div className="w-full flex flex-col gap-8 animate-fade-in">
            <div className={`grid grid-cols-1 gap-8 ${runnerPos === 6 ? 'lg:grid-cols-[1fr_350px]' : ''}`}>
              <div className="bg-gray-900/50 rounded-3xl p-6 border border-gray-700 shadow-xl flex flex-col gap-6">
                <div className="relative h-32 bg-gray-900 rounded-2xl border-y-4 border-gray-700 overflow-hidden flex items-center">
                  {[1,2,3,4,5,6].map(f => (
                    <div 
                      key={f} 
                      className="absolute flex flex-col items-center gap-1 -translate-x-1/2" 
                      style={{ left: `${10 + (f-1) * 16}%` }}
                    >
                      <span className="text-xl">🚩</span>
                      <span className="text-[8px] font-bold text-gray-500 uppercase">Flag {f}</span>
                    </div>
                  ))}
                  <div 
                    className="absolute text-3xl transition-all duration-1000 ease-in-out -translate-x-1/2" 
                    style={{ left: `${10 + (runnerPos-1) * 16}%` }}
                  >
                    <span className="inline-block transform scale-x-[-1]">🏃</span>
                  </div>
                  <div className="absolute top-2 right-4 bg-gray-800 px-3 py-1 rounded-full text-xs font-mono border border-gray-600">Distance Ran = <span className="text-sky-400 font-bold">{(runnerPos - 1) * 5} km</span></div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setRunnerPos(p => Math.min(6, p+1))} disabled={runnerPos === 6} className={`bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 px-6 py-2 rounded-lg font-bold ${runnerPos < 6 ? 'animate-pulse' : ''}`}>🏃 Run Further</button>
                  <button onClick={() => setRunnerPos(1)} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-bold">Reset Track</button>
                </div>
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                  <table className="w-full border-collapse bg-gray-900 rounded-lg overflow-hidden border border-gray-700"><thead className="bg-gray-700"><tr><th className="p-2 border border-gray-600 text-sky-200 text-sm">Flag (n)</th><th className="p-2 border border-gray-600 text-sky-200 text-sm">Distance (km)</th></tr></thead><tbody className="font-mono text-sm">{[1,2,3,4,5,6].map(n => <tr key={n} className={n <= runnerPos ? 'opacity-100' : 'opacity-20'}><td className="p-2 border border-gray-600 text-center">{n}</td><td className="p-2 border border-gray-600 text-center text-indigo-300">{(n-1)*5}</td></tr>)}</tbody></table>
                </div>
              </div>
              {runnerPos === 6 && (
              <div className="bg-gray-900/50 rounded-3xl p-6 border border-gray-700 shadow-xl flex flex-col gap-4 animate-fade-in">
                <h3 className="text-center font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-700 pb-2">Vocabulary</h3>
                <div className="flex flex-col gap-3">
                  {STAGE1_SLOTS.map((slot, i) => (
                    <DropSlot 
                      key={slot.id} 
                      slotId={slot.id} 
                      text={slot.text} 
                      placedId={placedStage1[i]} 
                      onDrop={id => {
                        setPlacedStage1(prev => ({...prev, [i]: id}));
                        setStage1Status(prev => { const n = {...prev}; delete n[i]; return n; });
                        setFeedback(null);
                      }} 
                      onRemove={() => {
                        setPlacedStage1(prev => { const n = {...prev}; delete n[i]; return n; });
                        setFeedback(null);
                      }}
                      status={stage1Status[i]} 
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-2 mt-4 p-4 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
                  <span className="text-[10px] text-gray-500 uppercase font-bold mb-1">Available Terms:</span>
                  {randomizedStage1Vocab.map(v => (
                    <DraggableVocab key={v.id} item={v} isPlaced={Object.values(placedStage1).includes(v.id)} />
                  ))}
                </div>
              </div>
              )}
            </div>
            {runnerPos === 6 && (
            <div className="flex gap-4 animate-fade-in">
              <button onClick={checkStage1} className="w-full bg-sky-600 hover:bg-sky-500 py-4 rounded-xl font-black text-xl shadow-lg uppercase tracking-tighter transition-transform hover:scale-[1.02]">Check</button>
            </div>
            )}
          </div>
        )}

        {stage === 2 && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 w-full">
              <div className="flex flex-col items-center">
                <div className="bg-gray-900 p-8 rounded-2xl border-2 border-indigo-500 text-4xl font-mono text-indigo-300 mb-6 shadow-xl w-full text-center">2, 5, 8, 11, 14, ...</div>
                <table className="w-full border-collapse bg-gray-900 rounded-xl overflow-hidden border border-gray-600">
                  <thead className="bg-gray-700 text-xs uppercase tracking-widest"><tr><th className="p-3 border border-gray-600">Term Number (n)</th><th className="p-3 border border-gray-600">Term Value</th></tr></thead>
                  <tbody className="font-mono text-center">{[1,2,3,4].map(n => <tr key={n}><td className="p-3 border border-gray-600">{n}</td><td className="p-3 border border-gray-600 text-sky-400 font-bold">{2 + (n-1)*3}</td></tr>)}</tbody>
                </table>
              </div>
              <div className="space-y-8">
                <div className={`bg-gray-900/50 p-6 rounded-2xl border-2 transition-all shadow-lg ${validationStatus.q1 === 'correct' ? 'border-emerald-500 bg-emerald-500/5' : validationStatus.q1 === 'incorrect' ? 'border-rose-500 bg-rose-500/5' : 'border-gray-700'}`}>
                  <p className="mb-4 font-bold text-lg">Q1. A variable tells you which position in the pattern you are looking for. What is the variable in this pattern?</p>
                  <div className="grid grid-cols-1 gap-2">
                    {randomizedTerms.map(opt => (
                      <button 
                        key={opt} 
                        onClick={() => { setQ1(opt); setFeedback(null); setValidationStatus(prev => ({ ...prev, q1: null })); }} 
                        className={`p-3 rounded-xl border-2 text-left font-bold transition-all ${q1 === opt ? (validationStatus.q1 === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus.q1 === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-[1.02] shadow-lg') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {validationStatus.q1 === 'correct' && (
                <div className="bg-gray-900/50 p-6 rounded-2xl border-2 transition-all shadow-lg animate-fade-in">
                  <p className="mb-4 font-bold text-lg">Q2. Constant difference shows the change between each term. What is the constant difference in this pattern?</p>
                  <div className="grid grid-cols-1 gap-2">
                    {randomizedDiffs.map(opt => (
                      <button 
                        key={opt} 
                        onClick={() => { setQ2(opt); setFeedback(null); setValidationStatus(prev => ({ ...prev, q2: null })); }} 
                        className={`p-3 rounded-xl border-2 text-left font-bold transition-all ${q2 === opt ? (validationStatus.q2 === 'correct' ? 'bg-emerald-600 border-emerald-400' : validationStatus.q2 === 'incorrect' ? 'bg-rose-600 border-rose-400' : 'bg-sky-600 border-sky-400 scale-[1.02] shadow-lg') : 'bg-gray-700 border-gray-600 hover:border-sky-500'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                )}
              </div>
            </div>
            <div className="flex gap-4 w-full">
              <button onClick={validateStage2} className="w-full bg-sky-600 hover:bg-sky-500 py-4 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-transform uppercase">Check</button>
            </div>
          </div>
        )}

        {stage === 3 && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full mb-12">
              <div className="bg-gray-900/60 p-8 rounded-3xl border-2 border-dashed border-gray-700 flex flex-wrap gap-4 items-center justify-center h-fit shadow-inner">
                {randomizedStage3Matches.map(item => (
                  <DraggableItem3 key={item.id} id={item.id} label={item.vocab} isPlaced={Object.values(placedStage3).includes(item.id)} color={item.color} />
                ))}
              </div>
              <div className="space-y-6">
                {STAGE3_MATCHES.map((item, idx) => (
                  <DropTarget3 
                    key={idx} 
                    index={idx} 
                    description={item.desc} 
                    placedId={placedStage3[idx]} 
                    onDrop={id => {
                      setPlacedStage3(p => ({...p, [idx]: id}));
                      setStage3Status(prev => { const n = {...prev}; delete n[idx]; return n; });
                      setFeedback(null);
                    }} 
                    onRemove={() => {
                      setPlacedStage3(p => { const n = {...p}; delete n[idx]; return n; });
                      setFeedback(null);
                    }} 
                    status={stage3Status[idx]} 
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-4 w-full">
              <button onClick={checkStage3} className="w-full bg-sky-600 hover:bg-sky-500 py-5 rounded-2xl font-black text-xl shadow-lg uppercase transition-transform hover:scale-[1.01]">Check</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Loop3Level1: React.FC<LevelComponentProps> = (props) => (<DndProvider backend={HTML5Backend}><Loop3Level1Inner {...props} /></DndProvider>);

export default Loop3Level1;