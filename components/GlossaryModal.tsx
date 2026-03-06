import React from 'react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const glossaryTerms = [
  {
    term: 'Algebra',
    definition: 'Algebra is a part of mathematics that uses letters, numbers, and symbols to represent relationships and patterns.',
    example: 'We use letters (called variables) to stand for numbers we do not know yet.\n\n• describe patterns\n• solve problems with unknowns\n• write rules (formulas)\n• understand relationships between quantities'
  },
  {
    term: 'Constant',
    definition: 'A constant is a number that does not change.',
    example: 'In 3y+7, the constant is 7.'
  },
  {
    term: 'Constant difference',
    definition: 'The constant difference is the amount you add or subtract every time in a sequence.',
    example: 'Sequence: 4, 9, 14, 19, 24…\nEach time you add 5.\nThe constant difference is +5.'
  },
  {
    term: 'Expand',
    definition: 'To multiply the brackets out and write the expression without brackets.',
    example: 'Expand 5(2n - 1)\n  → 5 x 2n = 10n\n  → 5 x -1 = -5\n  Answer: 10n - 5'
  },
  {
    term: 'Equation',
    definition: 'An equation is a math sentence that shows two things are equal. It always has an equal sign (=).',
    details: 'Left side = Right side',
    example: 'Examples:\n3 + 5 = 8\n2x + 3 = 15\n5n = 20'
  },
  {
    term: 'Expression',
    definition: 'An expression is a group of numbers, variables, and operations (like +, −, ×, ÷), but it does not have an equal sign.',
    example: 'Examples:\n3x+5\n4(a+2)\nx²−9x+1\n\nNot examples:\n3x + 5 = 20\n4(a+2) = -2'
  },
  {
    term: 'Pattern',
    definition: 'A pattern is list of numbers or objects that follows a rule.',
    example: '2,5,8,11,14,…\n\nPattern is: add 3 each time'
  },
  {
    term: 'Represent',
    definition: 'To represent means to show something in a different way using numbers, words, pictures, tables, graphs, or symbols.'
  },
  {
    term: 'Sequence',
    definition: 'A sequence is a list of numbers in a specific order.',
    example: '2, 5, 8, 11, 14, …'
  },
  {
    term: 'Simplify',
    definition: 'To simplify means to make an expression shorter, cleaner, or easier to understand.',
    details: 'You do this by:\ncombining like terms\nmultiplying\nreducing fractions\nusing rules for exponents',
    example: 'Simplify 3x + 2y + 5x:\n8x + 2y'
  },
  {
    term: 'Starting value',
    definition: 'The starting value is the first term in a sequence.',
    example: 'Sequence: 6, 9, 12, 15…\nThe starting value is 6.'
  },
  {
    term: 'Substitute',
    definition: 'To substitute means to replace a variable with a number.',
    details: 'Substitute = switch the letter for a number.',
    example: 'Example:\nSubstitute x = 3 into 2x + 5.\nStep 1: Replace 3 into x.\n             2(3) + 5 = 10'
  },
  {
    term: 'Term',
    definition: 'A term is one number in a sequence.',
    example: 'In the sequence 4, 7, 10, 13…\n4 is the 1st term\n7 is the 2nd term\n10 is the 3rd term'
  },
  {
    term: 'Term number',
    definition: 'A term number tells you the position of a term in the sequence (1st, 2nd, 3rd, etc.).',
    example: 'In the sequence 2, 6, 10, 14…\n2 → term number 1\n6 → term number 2\n10 → term number 3'
  },
  {
    term: 'Term value',
    definition: 'A term value is the number at a specific place in the sequence.',
    example: 'Sequence: 3, 8, 13, 18…\nThe 1st term value is 3\nThe 2nd term value is 8\nThe 4th term value is 18'
  },
  {
    term: 'Variable',
    definition: 'A variable is a letter that represents a number that can change.',
    example: 'x in 2x + 5 is a variable.'
  },
  {
    term: 'Value',
    definition: 'A value is the number you see or get.',
    example: '10, 13, 16, 19…\nThe value of the 3rd term is 16.'
  },
  {
    term: 'Verify',
    definition: 'To verify means to check if an answer is correct.',
    details: 'You verify by substituting a value back into the equation to see if both sides are equal.',
    example: 'Equation:\nx + 5 = 12\n\nSolution:\nx = 7\n\nVerify:\nSubstitute 7 for x.\n(7) + 5 = 12\n12 = 12\n✔ Both sides are equal. The answer is correct.'
  }
];

const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[150] p-6 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] text-white border border-slate-700 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-slate-700 flex-shrink-0">
          <h2 id="glossary-title" className="text-3xl font-bold text-sky-400 italic">Glossary</h2>
          <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close glossary"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
        </div>
        <div ref={scrollRef} className="space-y-6 overflow-y-auto p-6 sm:p-8 custom-scrollbar flex-1">
            {glossaryTerms.map((item, index) => (
              <div key={index} className="bg-slate-700/50 rounded-2xl p-5 border border-slate-600/50">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <h3 className="text-xl font-bold text-sky-400">{item.term}</h3>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <p className="text-slate-200">{item.definition}</p>
                    {item.details && (
                      <p className="text-slate-300 text-sm whitespace-pre-line">{item.details}</p>
                    )}
                    {item.example && (
                      <div className="bg-slate-800/70 border-l-4 border-emerald-500 p-3 rounded mt-2">
                        <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">EXAMPLE</p>
                        <pre className="text-slate-300 text-sm font-mono whitespace-pre-wrap break-words">{item.example}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GlossaryModal;
