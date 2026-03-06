
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import GlossaryButton from '../components/GlossaryButton';
import GlossaryModal from '../components/GlossaryModal';

type Question = 1 | 2 | 3 | 4;

const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} className={className}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const PatternLevel3: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [currentQ, setCurrentQ] = useState<Question>(() => partialProgress?.currentQ || 1);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  const [isAllComplete, setIsAllComplete] = useState(false);

  // Q1: Multiple choice
  const [q1Selection, setQ1Selection] = useState<string | null>(null);
  
  // Q2: Table completion
  const [q2Input, setQ2Input] = useState('');
  
  // Q3: Number input
  const [q3Input, setQ3Input] = useState('');
  
  // Q4: Multiple choice (table selection)
  const [q4Selection, setQ4Selection] = useState<string | null>(null);

  const [validationStatus, setValidationStatus] = useState<Record<string, 'correct' | 'incorrect' | null>>({});
  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ currentQ });
      }
    };
  }, [currentQ]);

  const handleCorrect = (nextQ?: Question) => {
    setFeedback({ type: 'correct' });
    setTimeout(() => {
      setFeedback(null);
      setValidationStatus({});
      if (nextQ) {
        setCurrentQ(nextQ);
      } else {
        setIsAllComplete(true);
        isCompletedRef.current = true;
        onComplete(3);
      }
    }, 1500);
  };

  const handleIncorrect = (msg: string) => {
    setFeedback({ type: 'incorrect', message: msg });
  };

  const validateQ1 = () => {
    const isCorrect = q1Selection === '32';
    setValidationStatus({ q1: isCorrect ? 'correct' : 'incorrect' });
    if (isCorrect) handleCorrect(2);
    else handleIncorrect("Try again! Look at the pattern carefully.");
  };

  const validateQ2 = () => {
    const isCorrect = q2Input === '15';
    setValidationStatus({ q2: isCorrect ? 'correct' : 'incorrect' });
    if (isCorrect) handleCorrect(3);
    else handleIncorrect("Try again! The value increases by the same amount each time.");
  };

  const validateQ3 = () => {
    const isCorrect = q3Input === '15';
    setValidationStatus({ q3: isCorrect ? 'correct' : 'incorrect' });
    if (isCorrect) handleCorrect(4);
    else handleIncorrect("Try again! Count the dots in each figure carefully.");
  };

  const validateQ4 = () => {
    const isCorrect = q4Selection === 'C';
    setValidationStatus({ q4: isCorrect ? 'correct' : 'incorrect' });
    if (isCorrect) handleCorrect();
    else handleIncorrect("Try again! Look for the table where the value increases by 3 each time.");
  };

  if (isAllComplete) {
    return (
        <div className="flex flex-col items-center justify-center min-h-full p-8 text-center animate-fade-in">
            <h2 className="text-4xl font-bold text-emerald-400 mb-6">Level Complete!</h2>
            <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3].map(i => <StarIcon key={i} filled={true} className="w-16 h-16 text-yellow-400" />)}
            </div>
            <p className="text-xl text-gray-300 mb-10">Excellent work on pattern recognition!</p>
            <button onClick={onExit} className="bg-emerald-600 hover:bg-emerald-500 px-12 py-4 rounded-2xl font-black text-xl shadow-lg transition-transform hover:scale-105 active:scale-95">Back to Map</button>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 text-white bg-gray-900 font-sans max-w-4xl mx-auto relative">
      <GlossaryButton onClick={() => setIsGlossaryOpen(true)} />
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      <InstructionButton onClick={() => setIsInstructionOpen(true)} />
      <InstructionModal isOpen={isInstructionOpen} onClose={() => setIsInstructionOpen(false)} title="Pattern Practice">
        <p>Test your understanding of patterns by answering these questions about sequences, tables, and figures.</p>
      </InstructionModal>

      <div className="flex gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className={`h-4 w-4 rounded-full transition-all duration-500 ${currentQ >= i ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]' : 'bg-gray-700'}`} 
            aria-label={`Question ${i}`}
          />
        ))}
      </div>

      <div className="w-full bg-gray-800 rounded-3xl p-10 shadow-2xl border border-gray-700">
        {currentQ === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-8 text-white">1) The first four terms of a pattern are 2, 4, 8, 16. Which term is next?</h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {['18', '20', '24', '32'].map((option) => (
                <button
                  key={option}
                  onClick={() => { setQ1Selection(option); setFeedback(null); setValidationStatus({}); }}
                  className={`p-4 rounded-xl border-2 font-bold text-lg transition-all ${
                    q1Selection === option
                      ? validationStatus.q1 === 'correct'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : validationStatus.q1 === 'incorrect'
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-sky-600 border-sky-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {feedback && (
              <div className={`mb-4 p-3 rounded-lg font-semibold ${
                feedback.type === 'correct' ? 'text-emerald-400' : 'text-yellow-400'
              }`}>
                {feedback.message}
              </div>
            )}
            <button 
              onClick={validateQ1} 
              disabled={!q1Selection}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 text-white font-black py-4 rounded-xl transition-all"
            >
              Check
            </button>
          </div>
        )}

        {currentQ === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-8 text-white">2) Complete the table.</h2>
            <table className="w-full max-w-sm mx-auto mb-6 border-collapse border-2 border-gray-600">
              <thead>
                <tr className="bg-gray-700">
                  <th className="border-2 border-gray-600 p-3 text-gray-200">Term</th>
                  <th className="border-2 border-gray-600 p-3 text-gray-200">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-2 border-gray-600 p-3 text-center text-gray-200">1</td>
                  <td className="border-2 border-gray-600 p-3 text-center text-gray-200">5</td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-600 p-3 text-center text-gray-200">2</td>
                  <td className="border-2 border-gray-600 p-3 text-center text-gray-200">10</td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-600 p-3 text-center text-gray-200">3</td>
                  <td className="border-2 border-gray-600 p-3 text-center">
                    <input
                      type="number"
                      value={q2Input}
                      onChange={(e) => { setQ2Input(e.target.value); setFeedback(null); setValidationStatus({}); }}
                      className={`w-full px-3 py-2 text-center border-2 rounded bg-gray-900 text-white ${
                        validationStatus.q2 === 'correct'
                          ? 'border-emerald-500'
                          : validationStatus.q2 === 'incorrect'
                          ? 'border-rose-500'
                          : 'border-gray-600'
                      }`}
                      placeholder="?"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-gray-400 mb-6 text-center">The value increases by the same amount each time.</p>
            {feedback && (
              <div className={`mb-4 p-3 rounded-lg font-semibold ${
                feedback.type === 'correct' ? 'text-emerald-400' : 'text-yellow-400'
              }`}>
                {feedback.message}
              </div>
            )}
            <button 
              onClick={validateQ2}
              disabled={!q2Input}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 text-white font-black py-4 rounded-xl transition-all"
            >
              Check
            </button>
          </div>
        )}

        {currentQ === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-8 text-white">3) The figures below grow by adding one more row of dots each time.</h2>
            <div className="flex justify-center items-end gap-8 mb-8 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
              {/* Figure 1: 1 dot */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              {/* Figure 2: 3 dots (1+2) */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              {/* Figure 3: 6 dots (1+2+3) */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              {/* Figure 4: 10 dots (1+2+3+4) */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-sky-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 font-bold mb-3">How many dots are in figure 5?</label>
              <input
                type="number"
                value={q3Input}
                onChange={(e) => { setQ3Input(e.target.value); setFeedback(null); setValidationStatus({}); }}
                className={`w-32 px-4 py-3 text-xl text-center border-2 rounded-xl bg-gray-900 text-white ${
                  validationStatus.q3 === 'correct'
                    ? 'border-emerald-500'
                    : validationStatus.q3 === 'incorrect'
                    ? 'border-rose-500'
                    : 'border-gray-600'
                }`}
                placeholder="0"
              />
            </div>
            {feedback && (
              <div className={`mb-4 p-3 rounded-lg font-semibold ${
                feedback.type === 'correct' ? 'text-emerald-400' : 'text-yellow-400'
              }`}>
                {feedback.message}
              </div>
            )}
            <button 
              onClick={validateQ3}
              disabled={!q3Input}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 text-white font-black py-4 rounded-xl transition-all"
            >
              Check
            </button>
          </div>
        )}

        {currentQ === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-8 text-white">4) Which table best matches this description? "The value increases by 3 each time."</h2>
            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Table A */}
              <button
                onClick={() => { setQ4Selection('A'); setFeedback(null); setValidationStatus({}); }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  q4Selection === 'A'
                    ? validationStatus.q4 === 'correct'
                      ? 'bg-emerald-600 border-emerald-500'
                      : validationStatus.q4 === 'incorrect'
                      ? 'bg-rose-600 border-rose-500'
                      : 'bg-sky-600 border-sky-500'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="font-bold mb-3 text-white">A)</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="p-1 text-gray-300">Term</th>
                      <th className="p-1 text-gray-300">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-1 text-center text-white">1</td><td className="p-1 text-center text-white">2</td></tr>
                    <tr><td className="p-1 text-center text-white">2</td><td className="p-1 text-center text-white">4</td></tr>
                    <tr><td className="p-1 text-center text-white">3</td><td className="p-1 text-center text-white">8</td></tr>
                  </tbody>
                </table>
              </button>
              {/* Table B */}
              <button
                onClick={() => { setQ4Selection('B'); setFeedback(null); setValidationStatus({}); }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  q4Selection === 'B'
                    ? validationStatus.q4 === 'correct'
                      ? 'bg-emerald-600 border-emerald-500'
                      : validationStatus.q4 === 'incorrect'
                      ? 'bg-rose-600 border-rose-500'
                      : 'bg-sky-600 border-sky-500'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="font-bold mb-3 text-white">B)</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="p-1 text-gray-300">Term</th>
                      <th className="p-1 text-gray-300">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-1 text-center text-white">1</td><td className="p-1 text-center text-white">5</td></tr>
                    <tr><td className="p-1 text-center text-white">2</td><td className="p-1 text-center text-white">8</td></tr>
                    <tr><td className="p-1 text-center text-white">3</td><td className="p-1 text-center text-white">11</td></tr>
                  </tbody>
                </table>
              </button>
              {/* Table C */}
              <button
                onClick={() => { setQ4Selection('C'); setFeedback(null); setValidationStatus({}); }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  q4Selection === 'C'
                    ? validationStatus.q4 === 'correct'
                      ? 'bg-emerald-600 border-emerald-500'
                      : validationStatus.q4 === 'incorrect'
                      ? 'bg-rose-600 border-rose-500'
                      : 'bg-sky-600 border-sky-500'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="font-bold mb-3 text-white">C)</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="p-1 text-gray-300">Term</th>
                      <th className="p-1 text-gray-300">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-1 text-center text-white">1</td><td className="p-1 text-center text-white">3</td></tr>
                    <tr><td className="p-1 text-center text-white">2</td><td className="p-1 text-center text-white">9</td></tr>
                    <tr><td className="p-1 text-center text-white">3</td><td className="p-1 text-center text-white">27</td></tr>
                  </tbody>
                </table>
              </button>
            </div>
            {feedback && (
              <div className={`mb-4 p-3 rounded-lg font-semibold ${
                feedback.type === 'correct' ? 'text-emerald-400' : 'text-yellow-400'
              }`}>
                {feedback.message}
              </div>
            )}
            <button 
              onClick={validateQ4}
              disabled={!q4Selection}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 text-white font-black py-4 rounded-xl transition-all"
            >
              Check
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternLevel3;

