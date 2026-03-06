
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { LevelComponentProps } from '../types';
import GlossaryButton from '../components/GlossaryButton';
import GlossaryModal from '../components/GlossaryModal';

type CardType = 'sequence' | 'table' | 'graph' | 'words';
type PatternID = 'A' | 'B';

interface Card {
  id: string;
  type: CardType;
  pattern: PatternID;
  content: React.ReactNode;
}

const TableCard = ({ nValues, values }: { nValues: number[], values: number[] }) => (
    <table className="w-full text-[10px] border-collapse bg-gray-800 text-white rounded">
        <thead>
            <tr className="bg-gray-700">
                <th className="border border-gray-600 p-0.5 text-xs uppercase text-indigo-200">n</th>
                <th className="border border-gray-600 p-0.5 text-xs uppercase text-indigo-200">Value</th>
            </tr>
        </thead>
        <tbody>
            {nValues.map((n, i) => (
                <tr key={n} className="border-t border-gray-600">
                    <td className="border border-gray-600 p-0.5 text-center">{n}</td>
                    <td className="border border-gray-600 p-0.5 text-center font-bold text-amber-400">{values[i]}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const LineGraphCard = ({ data, maxVal, color }: { data: number[], maxVal: number, color: string }) => (
    <div className="w-full h-20 pt-2 pr-1 relative border-l-2 border-b-2 border-gray-400">
        <div className="absolute left-[-18px] top-0 bottom-0 flex flex-col justify-between text-[7px] text-gray-500 font-bold">
            <span>{maxVal}</span><span>{Math.floor(maxVal/2)}</span><span>0</span>
        </div>
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <polyline 
                points={data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - (val / maxVal) * 100}`).join(' ')}
                fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
            />
            {data.map((val, i) => (
                <circle key={i} cx={(i / (data.length - 1)) * 100} cy={100 - (val / maxVal) * 100} r="8" fill={color} />
            ))}
        </svg>
    </div>
);

interface Stage {
  hintA: string;
  hintB: string;
  cards: Card[];
}

const STAGES: Stage[] = [
  {
    hintA: "multiply by 2 each time",
    hintB: "add 3 each time",
    cards: [
      { id: '1a', pattern: 'A', type: 'sequence', content: <div className="text-center font-mono font-bold text-blue-900">2, 4, 8, 16, ...</div> },
      { id: '1b', pattern: 'A', type: 'table', content: <TableCard nValues={[1,2,3]} values={[2,4,8]} /> },
      { id: '1c', pattern: 'A', type: 'graph', content: <LineGraphCard data={[2, 4, 8, 16]} maxVal={16} color="#3b82f6" /> },
      { id: '1d', pattern: 'A', type: 'words', content: <p className="text-[10px] text-center italic text-blue-900 font-bold">"Each term is doubled from the previous."</p> },
      { id: '1e', pattern: 'B', type: 'sequence', content: <div className="text-center font-mono font-bold text-emerald-900">1, 4, 7, 10, ...</div> },
      { id: '1f', pattern: 'B', type: 'table', content: <TableCard nValues={[1,2,3]} values={[1,4,7]} /> },
      { id: '1g', pattern: 'B', type: 'graph', content: <LineGraphCard data={[1, 4, 7, 10]} maxVal={10} color="#10b981" /> },
      { id: '1h', pattern: 'B', type: 'words', content: <p className="text-[10px] text-center italic text-emerald-900 font-bold">"The value increases by 3 each time."</p> },
    ]
  },
  {
    hintA: "add 5 each time",
    hintB: "multiply by 2 each time",
    cards: [
      { id: '2a', pattern: 'A', type: 'sequence', content: <div className="text-center font-mono font-bold text-sky-900">5, 10, 15, 20, ...</div> },
      { id: '2b', pattern: 'A', type: 'table', content: <TableCard nValues={[1,2,3]} values={[5,10,15]} /> },
      { id: '2c', pattern: 'A', type: 'graph', content: <LineGraphCard data={[5, 10, 15, 20]} maxVal={20} color="#0ea5e9" /> },
      { id: '2d', pattern: 'A', type: 'words', content: <p className="text-[10px] text-center italic text-sky-900 font-bold">"Multiples of 5 starting from 5."</p> },
      { id: '2e', pattern: 'B', type: 'sequence', content: <div className="text-center font-mono font-bold text-indigo-900">1, 2, 4, 8, ...</div> },
      { id: '2f', pattern: 'B', type: 'table', content: <TableCard nValues={[1,2,3]} values={[1,2,4]} /> },
      { id: '2g', pattern: 'B', type: 'graph', content: <LineGraphCard data={[1, 2, 4, 8]} maxVal={8} color="#6366f1" /> },
      { id: '2h', pattern: 'B', type: 'words', content: <p className="text-[10px] text-center italic text-indigo-900 font-bold">"Start at 1, then double the value."</p> },
    ]
  }
];

const DraggableCard: React.FC<{ card: Card; status?: 'correct' | 'incorrect' }> = ({ card, status }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'card',
    item: { id: card.id },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }), [card]);

  return (
    <div ref={drag} className={`bg-white text-gray-800 p-4 rounded-xl shadow-lg border-2 transition-all cursor-grab active:cursor-grabbing w-full h-40 flex flex-col items-center justify-center ${isDragging ? 'opacity-40' : 'opacity-100'} ${status === 'correct' ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : status === 'incorrect' ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'border-gray-200 hover:border-sky-400'}`}>
      <span className="text-[8px] uppercase font-bold text-gray-400 mb-2 self-start">{card.type}</span>
      <div className="flex-grow flex items-center justify-center w-full px-1">{card.content}</div>
    </div>
  );
};

const DropZone: React.FC<{ id: PatternID; onDrop: (cardId: string) => void; children: React.ReactNode; hint: string; }> = ({ id, onDrop, children, hint }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'card',
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }), [onDrop]);

  return (
    <div ref={drop} className={`min-h-[450px] rounded-3xl p-6 transition-colors border-4 border-dashed ${isOver ? 'bg-sky-500/10 border-sky-400' : 'bg-gray-800/40 border-gray-700'}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="text-center w-full">
          <h3 className="text-xl font-black text-sky-400 mb-1">Pattern {id}</h3>
          <p className="text-sm text-gray-400">{hint}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
};

const Loop2Level2Inner: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [stageIdx, setStageIdx] = useState(() => partialProgress?.stageIdx || 0);
  const [bucketA, setBucketA] = useState<string[]>([]);
  const [bucketB, setBucketB] = useState<string[]>([]);
  const [validationStatus, setValidationStatus] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  const [isAllComplete, setIsAllComplete] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const isCompletedRef = useRef(false);

  const currentStage = STAGES[stageIdx];
  
  const gallery = useMemo(() => {
      const remaining = currentStage.cards.filter(c => !bucketA.includes(c.id) && !bucketB.includes(c.id));
      return [...remaining].sort(() => Math.random() - 0.5);
  }, [currentStage, bucketA.length, bucketB.length, stageIdx]);

  const handleDrop = (cardId: string, to: PatternID) => {
    setValidationStatus(prev => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
    setFeedback(null);
    if (to === 'A') {
      setBucketA(prev => [...prev.filter(id => id !== cardId), cardId]);
      setBucketB(prev => prev.filter(id => id !== cardId));
    } else {
      setBucketB(prev => [...prev.filter(id => id !== cardId), cardId]);
      setBucketA(prev => prev.filter(id => id !== cardId));
    }
  };

  const handleCheck = () => {
    const newStatus: Record<string, 'correct' | 'incorrect'> = {};
    let allOk = true;
    if (bucketA.length + bucketB.length < currentStage.cards.length) {
      setFeedback({ type: 'incorrect', message: "Place all cards before checking!" }); return;
    }
    
    bucketA.forEach(id => {
      const isCorrect = currentStage.cards.find(c => c.id === id)?.pattern === 'A';
      newStatus[id] = isCorrect ? 'correct' : 'incorrect';
      if (!isCorrect) allOk = true; // Wait, if any is incorrect, allOk is false
    });
    // Let's rewrite this properly
    currentStage.cards.forEach(card => {
      const inA = bucketA.includes(card.id);
      const inB = bucketB.includes(card.id);
      if (inA) {
        newStatus[card.id] = card.pattern === 'A' ? 'correct' : 'incorrect';
      } else if (inB) {
        newStatus[card.id] = card.pattern === 'B' ? 'correct' : 'incorrect';
      }
      if (newStatus[card.id] === 'incorrect') allOk = false;
    });

    setValidationStatus(newStatus);

    if (allOk) {
      setFeedback({ type: 'correct', message: '✨ Perfectly matched!' });
      setTimeout(() => {
        if (stageIdx < STAGES.length - 1) {
          setStageIdx(s => s + 1); setBucketA([]); setBucketB([]); setValidationStatus({}); setFeedback(null);
        } else {
          setIsAllComplete(true);
        }
      }, 1500);
    } else {
      setFeedback({ type: 'incorrect', message: "Some cards are in the wrong place. Check their patterns carefully." });
    }
  };

  if (isAllComplete) {
    return (
        <div className="flex flex-col items-center justify-center min-h-full p-8 text-center animate-fade-in">
            <h2 className="text-4xl font-bold text-emerald-400 mb-6">Perfect Match!</h2>
            <div className="flex justify-center gap-2 mb-8">{[1, 2, 3].map(i => <StarIcon key={i} filled={true} className="w-16 h-16 text-yellow-400" />)}</div>
            <p className="text-xl text-gray-300 mb-10">You've mastered pattern translation.</p>
            <button onClick={onExit} className="bg-emerald-600 hover:bg-emerald-500 px-12 py-4 rounded-2xl font-black text-xl shadow-lg transition-transform hover:scale-105 active:scale-95">Back to Map</button>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-full p-6 text-white font-sans max-w-7xl mx-auto">
      <GlossaryButton onClick={() => setIsGlossaryOpen(true)} />
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      <div className="flex gap-4 mb-8">
        {STAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => {setStageIdx(i); setBucketA([]); setBucketB([]); setValidationStatus({}); setFeedback(null);}}
            className={`h-4 w-4 rounded-full transition-all duration-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${i <= stageIdx ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]' : 'bg-gray-700'}`}
            aria-label={`Go to stage ${i + 1}`}
          />
        ))}
      </div>

      <p className="text-center text-white mb-6 text-2xl font-bold leading-relaxed animate-fade-in">
        Sort the cards into Pattern A or Pattern B based on which pattern they describe.
      </p>

      {feedback && <div className={`fixed top-24 px-8 py-3 rounded-2xl font-semibold shadow-2xl z-50 animate-fade-in ${feedback.type === 'correct' ? 'text-emerald-400' : 'text-yellow-400'}`}>{feedback.message}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <DropZone id="A" hint={currentStage.hintA} onDrop={id => handleDrop(id, 'A')}>{bucketA.map(id => <DraggableCard key={id} card={currentStage.cards.find(c => c.id === id)!} status={validationStatus[id] || undefined} />)}</DropZone>
        <div className="bg-gray-900/60 rounded-3xl p-6 border-2 border-gray-800 shadow-inner flex flex-col">
          <h3 className="text-center font-bold text-gray-500 uppercase tracking-widest mb-6">Gallery Deck</h3>
          <div className="grid grid-cols-2 gap-4">{gallery.map(card => <DraggableCard key={card.id} card={card} />)}</div>
        </div>
        <DropZone id="B" hint={currentStage.hintB} onDrop={id => handleDrop(id, 'B')}>{bucketB.map(id => <DraggableCard key={id} card={currentStage.cards.find(c => c.id === id)!} status={validationStatus[id] || undefined} />)}</DropZone>
      </div>
      <button onClick={handleCheck} className="mt-12 bg-sky-600 hover:bg-sky-500 px-12 py-4 rounded-2xl font-black text-xl shadow-lg transition-transform hover:scale-105">Check</button>
    </div>
  );
};

const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} className={className}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
);

const Loop2Level2: React.FC<LevelComponentProps> = (props) => (<DndProvider backend={HTML5Backend}><Loop2Level2Inner {...props} /></DndProvider>);

export default Loop2Level2;
