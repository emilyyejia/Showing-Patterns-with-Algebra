import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

type Step = 1 | 2 | 3 | 4 | 5;

const PatternLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [step, setStep] = useState<Step>(() => partialProgress?.step || 1);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  
  const [t1Behavior, setT1Behavior] = useState('');
  const [t1Value, setT1Value] = useState('');
  const [t1Term3, setT1Term3] = useState('');

  const [t2Values, setT2Values] = useState({ 5: '', 6: '', 7: '' });
  const [t2Behavior, setT2Behavior] = useState('');
  const [t2Term9, setT2Term9] = useState('');

  const [t3Behavior, setT3Behavior] = useState('');
  const [t3Value, setT3Value] = useState('');
  const [t3Term5, setT3Term5] = useState('');

  const [t4Behavior, setT4Behavior] = useState('');
  const [t4Term5, setT4Term5] = useState('');

  const [t5Input, setT5Input] = useState('');
  const [t5FinalResult, setT5FinalResult] = useState('');
  const [showT5Popup, setShowT5Popup] = useState(false);
  const [validationStatus, setValidationStatus] = useState<Record<string, 'correct' | 'incorrect' | null>>({});

  const isCompletedRef = useRef(false);

  const isTableComplete = Object.values(t2Values).every(v => v !== '');

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ step });
      }
    };
  }, [step]); // Removed onSavePartialProgress to prevent infinite loops

  const handleCorrect = (nextStep?: Step) => {
    setFeedback({ type: 'correct' });
    setTimeout(() => {
      setFeedback(null);
      setValidationStatus({});
      if (nextStep) setStep(nextStep);
      else {
        isCompletedRef.current = true;
        onComplete(3);
      }
    }, 1500);
  };

  const handleIncorrect = (msg: string) => {
    setFeedback({ type: 'incorrect', message: msg });
  };

  const updateStatus = (id: string, isCorrect: boolean) => {
    setValidationStatus(prev => ({ ...prev, [id]: isCorrect ? 'correct' : 'incorrect' }));
  };

  const clearStatus = (id: string) => {
    setValidationStatus(prev => ({ ...prev, [id]: null }));
  };

  const validateT1 = () => {
    const s1 = t1Behavior === 'increases';
    const s2 = t1Value === '4';
    const s3 = t1Term3 === '11';
    
    setValidationStatus({
      t1Behavior: s1 ? 'correct' : 'incorrect',
      t1Value: s2 ? 'correct' : 'incorrect',
      t1Term3: s3 ? 'correct' : 'incorrect'
    });

    if (s1 && s2 && s3) {
      handleCorrect(2);
    } else {
      let hintMsg = "Check the sequence: 3, 7, 11... how much is added each time?";
      if (t1Term3 !== '11' && t1Term3 !== '') hintMsg = "'Term Number' tells us where you are in the pattern. The 3rd term is 11.";
      handleIncorrect(hintMsg);
    }
  };

  const validateT2 = () => {
    const isTableIncomplete = Object.values(t2Values).some(v => v === '');
    if (isTableIncomplete) { handleIncorrect("Complete the table first."); return; }
    const v5 = parseInt(t2Values[5]);
    const v6 = parseInt(t2Values[6]);
    const v7 = parseInt(t2Values[7]);
    const v9 = parseInt(t2Term9);

    const s5 = v5 === 25;
    const s6 = v6 === 22;
    const s7 = v7 === 19;
    const sB = t2Behavior === 'decreases';
    const s9 = v9 === 13;

    setValidationStatus({
      t2Value5: s5 ? 'correct' : 'incorrect',
      t2Value6: s6 ? 'correct' : 'incorrect',
      t2Value7: s7 ? 'correct' : 'incorrect',
      t2Behavior: sB ? 'correct' : 'incorrect',
      t2Term9: s9 ? 'correct' : 'incorrect'
    });

    if (s5 && s6 && s7 && sB && s9) {
      handleCorrect(3);
    } else {
        if (t2Behavior !== 'decreases' && t2Behavior !== '') handleIncorrect("Are the values in the table getting smaller or larger?");
        else if (v9 !== 13 && t2Term9 !== '') handleIncorrect("For each new term, take away 3.");
        else handleIncorrect("Check the subtraction! 28 - 3 = 25.");
    }
  };

  const validateT3 = () => {
    const sB = t3Behavior === 'increases';
    const sV = t3Value === '3';
    const sT = t3Term5 === '15';

    setValidationStatus({
      t3Behavior: sB ? 'correct' : 'incorrect',
      t3Value: sV ? 'correct' : 'incorrect',
      t3Term5: sT ? 'correct' : 'incorrect'
    });

    if (sB && sV && sT) {
      handleCorrect(4);
    } else {
      if (!sB || !sV) {
        handleIncorrect("Look at the first two dots. At Term 1, the value is 3. At Term 2, it's 6. How much did it increase?");
      } else {
        handleIncorrect("You've found the pattern! Now, if it increases by 3 each time, what would the value be at the 5th step? (Check the graph at n=5).");
      }
    }
  };

  const validateT4 = () => {
    const sB = t4Behavior === 'doubles';
    const sT = t4Term5 === '32';

    setValidationStatus({
      t4Behavior: sB ? 'correct' : 'incorrect',
      t4Term5: sT ? 'correct' : 'incorrect'
    });

    if (sB && sT) handleCorrect(5);
    else handleIncorrect("Look at the Figure titles: 2, 4, 8, 16... it's doubling! 16 x 2 = 32.");
  };

  const validateT5 = () => {
    const sR = t5FinalResult === '4';
    setValidationStatus({ t5FinalResult: sR ? 'correct' : 'incorrect' });
    if (sR) { 
      setShowT5Popup(true); 
    } else {
      handleIncorrect("Check your calculation.");
    }
  };

  const renderProgress = () => (
    <div className="flex gap-4 mb-8">
      {[1, 2, 3, 4, 5].map(i => (
        <button 
          key={i} 
          onClick={() => setStep(i as Step)}
          className={`h-4 w-4 rounded-full transition-all duration-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${step >= i ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]' : 'bg-gray-700'}`} 
          aria-label={`Go to step ${i}`}
        />
      ))}
    </div>
  );

  const getStatusColor = (id: string, defaultColor: string = 'border-sky-500') => {
    const status = validationStatus[id];
    if (status === 'correct') return 'border-emerald-500';
    if (status === 'incorrect') return 'border-rose-500';
    return defaultColor;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 text-white font-sans max-w-5xl mx-auto relative">
      <InstructionModal isOpen={isInstructionOpen} onClose={() => setIsInstructionOpen(false)} title="Lesson 1: Identify Patterns">
        <p>Patterns are relationships between <strong>Term Numbers</strong> and <strong>Term Values</strong>.</p>
      </InstructionModal>

      {renderProgress()}

      {step === 2 && (
        <p className="text-center text-white mb-6 text-xl font-medium animate-fade-in">
          Complete the table, then answer the questions.
        </p>
      )}

      <div className="w-full max-w-3xl bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 relative">
        {showT5Popup && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] animate-fade-in p-4">
              <div className="bg-emerald-600 p-8 rounded-3xl text-center shadow-2xl max-w-md border-4 border-emerald-400">
                  <p className="text-3xl font-black mb-4">✨ Magic!</p>
                  <p className="text-xl font-bold mb-6">Pick another number to see if you get the same answer!</p>
                  <div className="flex flex-col gap-3">
                      <button onClick={() => { setShowT5Popup(false); setT5Input(''); setT5FinalResult(''); }} className="bg-white text-emerald-600 font-black py-3 px-8 rounded-xl hover:bg-emerald-50 transition-colors active:scale-95">Try Another Number</button>
                      <button 
                        onClick={() => { 
                          isCompletedRef.current = true; 
                          onComplete(3); 
                          onExit?.(); 
                        }} 
                        className="bg-emerald-900 text-white font-black py-3 px-8 rounded-xl hover:bg-emerald-950 transition-colors active:scale-95"
                      >
                        Back to Map
                      </button>
                  </div>
              </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in text-center pt-4">
            <div className="bg-gray-900 p-8 rounded-2xl mb-8 flex justify-center gap-4 text-4xl font-mono text-indigo-300 tracking-widest shadow-inner border border-gray-700">3, 7, 11, 15, 19, 23, ...</div>
            <div className="space-y-6 text-lg text-gray-300 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span>The pattern</span>
                <select className={`bg-gray-900 border-2 px-3 py-1 rounded-lg focus:outline-none transition-colors ${getStatusColor('t1Behavior')}`} value={t1Behavior} onChange={(e) => { setT1Behavior(e.target.value); setFeedback(null); clearStatus('t1Behavior'); }}><option value="">-- select --</option><option value="increases">increases</option><option value="decreases">decreases</option></select>
                <span>by</span>
                <select className={`bg-gray-900 border-2 px-3 py-1 rounded-lg focus:outline-none transition-colors ${getStatusColor('t1Value')}`} value={t1Value} onChange={(e) => { setT1Value(e.target.value); setFeedback(null); clearStatus('t1Value'); }}><option value="">--</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select>
                <span>each time!</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span>What's the value for the 3rd term?</span>
                <input type="number" className={`w-20 bg-gray-900 border-2 p-2 text-center rounded-lg focus:outline-none transition-colors ${getStatusColor('t1Term3')}`} value={t1Term3} onChange={(e) => { setT1Term3(e.target.value); setFeedback(null); clearStatus('t1Term3'); }} />
              </div>
              {feedback && (
                <div className={`mt-4 px-6 py-2 rounded-xl font-bold shadow-lg animate-fade-in text-center ${
                  feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white border-2 border-rose-400'
                }`}>
                  {feedback.message || (feedback.type === 'correct' ? '🌟 Correct!' : 'Try again!')}
                </div>
              )}
              <button onClick={validateT1} className="mt-4 bg-sky-600 hover:bg-sky-500 px-10 py-4 rounded-xl font-black transition-all shadow-lg hover:scale-105 uppercase tracking-wider">Check</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="animate-fade-in pt-4">
            <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
              <table className="w-full md:w-64 border-collapse bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-600">
                <thead><tr className="bg-gray-700 text-sky-200"><th className="p-3 border border-gray-600">n (Term #)</th><th className="p-3 border border-gray-600">Value</th></tr></thead>
                <tbody>
                  {[1,2,3,4].map(n => <tr key={n} className="hover:bg-gray-800/50 transition-colors"><td className="p-3 border border-gray-600 text-center font-mono">{n}</td><td className="p-3 border border-gray-600 text-center font-mono text-indigo-300">{37 - (n-1)*3}</td></tr>)}
                  {[5,6,7].map(n => <tr key={n} className="bg-indigo-900/10"><td className="p-3 border border-gray-600 text-center font-mono">{n}</td><td className="p-3 border border-gray-600 text-center"><input type="number" className={`w-16 bg-gray-900 text-center border-2 rounded p-1 focus:outline-none transition-colors ${getStatusColor(`t2Value${n}`)}`} value={t2Values[n as 5|6|7]} onChange={e => { setT2Values({...t2Values, [n]: e.target.value}); setFeedback(null); clearStatus(`t2Value${n}`); }} /></td></tr>)}
                </tbody>
              </table>
              <div className={`flex-1 space-y-6 text-lg bg-gray-800/50 p-6 rounded-xl border border-gray-700 self-stretch flex flex-col transition-all duration-500 ${!isTableComplete ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center flex-wrap gap-2"><span>The pattern</span><select className={`bg-gray-900 border-2 px-2 rounded-lg transition-colors ${getStatusColor('t2Behavior')}`} value={t2Behavior} onChange={(e) => { setT2Behavior(e.target.value); setFeedback(null); clearStatus('t2Behavior'); }}><option value="">-- select --</option><option value="increases">increases</option><option value="decreases">decreases</option></select><span>by 3 each time!</span></div>
                <div className="flex items-center gap-2"><span>What's the 9th term?</span><input type="number" className={`w-20 bg-gray-900 border-2 text-center rounded-lg p-1 transition-colors ${getStatusColor('t2Term9')}`} value={t2Term9} onChange={(e) => { setT2Term9(e.target.value); setFeedback(null); clearStatus('t2Term9'); }} /></div>
                <div className="mt-auto">
                    {feedback && (
                        <div className={`mb-4 px-6 py-2 rounded-xl font-bold shadow-lg animate-fade-in text-center ${
                        feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white border-2 border-rose-400'
                        }`}>
                        {feedback.message || (feedback.type === 'correct' ? '🌟 Correct!' : 'Try again!')}
                        </div>
                    )}
                    <button onClick={validateT2} className="w-full bg-sky-600 hover:bg-sky-500 py-4 rounded-xl font-black transition-all shadow-lg uppercase tracking-wider">Check</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="animate-fade-in text-center pt-4">
            <div className="bg-white p-6 rounded-2xl mb-8 shadow-2xl max-w-md mx-auto border-4 border-indigo-400 overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-full h-auto overflow-visible">
                {Array.from({length: 11}).map((_, i) => (
                  <React.Fragment key={i}>
                    <line x1="12" y1={90-i*8} x2="95" y2={90-i*8} stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1={12+i*11} y1="90" x2={12+i*11} y2="10" stroke="#e2e8f0" strokeWidth="0.5" />
                    <text x="8" y={90-i*8 + 1} fontSize="3" textAnchor="end" fill="#64748b" className="font-mono">{i*2}</text>
                  </React.Fragment>
                ))}
                <line x1="12" y1="90" x2="95" y2="90" stroke="#475569" strokeWidth="1.5" />
                <line x1="12" y1="90" x2="12" y2="5" stroke="#475569" strokeWidth="1.5" />
                {[1, 2, 3, 4, 5, 6, 7].map(x => {
                    const y = x * 3; const svgX = 12 + x * 11; const svgY = 90 - (y / 2) * 8; 
                    return <g key={x}><circle cx={svgX} cy={svgY} r="2" fill="#3b82f6" /><text x={svgX} y="96" fontSize="4" textAnchor="middle" fill="#475569" className="font-bold">{x}</text></g>
                })}
                <polyline points={[1,2,3,4,5,6,7].map(x => `${12 + x*11},${90 - ((x*3)/2)*8}`).join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                <text x="50" y="104" fontSize="5" textAnchor="middle" fill="#1e293b" className="font-bold">Term Number (n)</text>
                <text x="-50" y="-8" fontSize="5" textAnchor="middle" fill="#1e293b" transform="rotate(-90)" className="font-bold">Term Value</text>
              </svg>
            </div>
            <div className="space-y-6 text-lg bg-gray-900/50 p-6 rounded-xl border border-gray-700">
              <div className="flex flex-wrap items-center justify-center gap-2"><span>The pattern</span><select className={`bg-gray-900 border-2 rounded-lg p-1 transition-colors ${getStatusColor('t3Behavior')}`} value={t3Behavior} onChange={(e) => { setT3Behavior(e.target.value); setFeedback(null); clearStatus('t3Behavior'); }}><option value="">-- select --</option><option value="increases">increases</option><option value="decreases">decreases</option></select><span>by</span><select className={`bg-gray-900 border-2 rounded-lg p-1 transition-colors ${getStatusColor('t3Value')}`} value={t3Value} onChange={(e) => { setT3Value(e.target.value); setFeedback(null); clearStatus('t3Value'); }}><option value="">--</option>{[2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}</select><span>each time!</span></div>
              <div className="flex items-center justify-center gap-2"><span>What's the 5th term value?</span><input type="number" className={`w-20 bg-gray-900 border-2 rounded-lg p-1 text-center transition-colors ${getStatusColor('t3Term5')}`} value={t3Term5} onChange={(e) => { setT3Term5(e.target.value); setFeedback(null); clearStatus('t3Term5'); }} /></div>
              {feedback && (
                <div className={`px-6 py-2 rounded-xl font-bold shadow-lg animate-fade-in text-center ${
                  feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white border-2 border-rose-400'
                }`}>
                  {feedback.message || (feedback.type === 'correct' ? '🌟 Correct!' : 'Try again!')}
                </div>
              )}
              <button onClick={validateT3} className="bg-sky-600 hover:bg-sky-500 px-12 py-4 rounded-xl font-black transition-all shadow-lg uppercase tracking-wider">Check</button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="animate-fade-in text-center pt-4">
             <div className="flex flex-wrap justify-center gap-6 mb-10 overflow-x-auto pb-4 px-2">
               {[2, 4, 8, 16].map((count, i) => (
                 <div key={i} className="flex flex-col items-center gap-2 shrink-0 bg-gray-900/50 p-4 rounded-2xl border border-gray-700 shadow-xl"><div className="grid grid-cols-4 gap-1 w-20 h-20">{Array.from({length: count}).map((_, j) => <div key={j} className="w-4 h-4 bg-emerald-500 rounded-sm shadow-[0_0_5px_rgba(16,185,129,0.5)]" />)}</div><span className="text-sm font-bold text-gray-400 mt-2">Figure {i+1}</span></div>
               ))}
             </div>
             <div className="space-y-6 text-lg bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-2xl">
                <div className="flex flex-wrap items-center justify-center gap-3"><span>The pattern</span><select className={`bg-gray-900 border-2 rounded-lg p-2 transition-colors ${getStatusColor('t4Behavior', 'border-emerald-500')}`} value={t4Behavior} onChange={(e) => { setT4Behavior(e.target.value); setFeedback(null); clearStatus('t4Behavior'); }}><option value="">-- select --</option><option value="halves">halves</option><option value="doubles">doubles</option><option value="triples">triples</option></select><span>each time!</span></div>
                <div className="flex items-center justify-center gap-3"><span>What's the value of Figure 5?</span><input type="number" className={`w-24 bg-gray-900 border-2 rounded-lg p-2 text-center transition-colors ${getStatusColor('t4Term5', 'border-emerald-500')}`} value={t4Term5} onChange={(e) => { setT4Term5(e.target.value); setFeedback(null); clearStatus('t4Term5'); }} /></div>
                {feedback && (
                    <div className={`px-6 py-2 rounded-xl font-bold shadow-lg animate-fade-in text-center ${
                    feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white border-2 border-rose-400'
                    }`}>
                    {feedback.message || (feedback.type === 'correct' ? '🌟 Correct!' : 'Try again!')}
                    </div>
                )}
                <button onClick={validateT4} className="bg-emerald-600 hover:bg-emerald-500 px-12 py-4 rounded-xl font-black transition-all shadow-lg hover:scale-105 uppercase tracking-wider">Check</button>
             </div>
          </div>
        )}
        {step === 5 && (
          <div className="animate-fade-in text-center pt-4">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-sky-400 mb-2 uppercase italic tracking-tighter">The Algebraic Magician</h2>
              <p className="text-gray-300 max-w-md mx-auto italic font-medium">Patterns allow us to perform amazing numeric magic tricks because algebra works for <span className="text-amber-400">any</span> number!</p>
            </div>

            <div className="bg-indigo-950 rounded-3xl p-8 border-2 border-indigo-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 text-left space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><span className="text-8xl">✨</span></div>
              <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-white/10">
                <span className="text-sky-300 font-bold">1. Pick any number (your variable 'x'):</span>
                <input type="number" className="w-28 bg-gray-800 border-2 border-sky-400 rounded-xl p-3 text-center text-white text-xl font-bold shadow-inner" value={t5Input} onChange={e => { setT5Input(e.target.value); setT5FinalResult(''); setFeedback(null); }} placeholder="..." />
              </div>
              
              {t5Input && (
                <div className="space-y-4 animate-fade-in text-gray-200 font-bold text-lg">
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <span><span className="text-amber-400 underline underline-offset-4 mr-2">2.</span> Multiply by <span className="text-white">3</span></span>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] uppercase text-indigo-500 font-black tracking-widest">Algebra Example</span>
                      <span className="text-indigo-400 font-mono text-sm">3x</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <span><span className="text-amber-400 mr-2">3.</span> Add <span className="text-white underline underline-offset-4">12</span> to that</span>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] uppercase text-indigo-500 font-black tracking-widest">Algebra Example</span>
                      <span className="text-indigo-400 font-mono text-sm">3x + 12</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <span><span className="text-amber-400 mr-2">4.</span> Divide everything by <span className="text-white underline underline-offset-4">3</span></span>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] uppercase text-indigo-500 font-black tracking-widest">Algebra Example</span>
                      <span className="text-indigo-400 font-mono text-sm">x + 4</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <span><span className="text-amber-400 mr-2">5.</span> Subtract your original number ({t5Input})</span>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] uppercase text-indigo-500 font-black tracking-widest">Algebra Example</span>
                      <span className="text-indigo-400 font-mono text-sm">(x + 4) - x</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-8 bg-emerald-900/40 rounded-2xl border-2 border-emerald-400/40 text-center relative">
                    {feedback && (
                        <div className={`mb-6 px-6 py-2 rounded-xl font-bold shadow-lg animate-fade-in text-center ${
                        feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white border-2 border-rose-400'
                        }`}>
                        {feedback.message || (feedback.type === 'correct' ? '🌟 Correct!' : 'Try again!')}
                        </div>
                    )}
                    <p className="text-2xl mb-4 text-emerald-300">What is the final result?</p>
                    <div className="flex flex-col items-center gap-4">
                      <input type="number" className={`w-32 text-5xl font-black bg-gray-900 border-4 rounded-2xl p-4 text-center transition-colors ${getStatusColor('t5FinalResult', 'border-emerald-400')} ${validationStatus['t5FinalResult'] === 'incorrect' ? 'text-rose-400' : 'text-emerald-400'}`} value={t5FinalResult} onChange={e => { setT5FinalResult(e.target.value); setFeedback(null); clearStatus('t5FinalResult'); }} placeholder="?" />
                      <button onClick={validateT5} className="bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 px-12 rounded-2xl text-xl shadow-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">Check</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {validationStatus.t5FinalResult === 'correct' && (
              <div className="animate-fade-in-up bg-gray-900/80 p-6 rounded-2xl border border-emerald-500/30 mt-4">
                <h3 className="text-emerald-400 font-black uppercase tracking-widest mb-2">Behind the Magic:</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  No matter what number you pick for <span className="text-amber-400 font-bold">x</span>, the algebra simplifies to <span className="text-emerald-400 font-bold">4</span> every single time! 
                  This is the power of patterns—they give us rules that work for every possibility.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternLevel1;