
import React, { useState } from 'react';
import type { LevelComponentProps } from '../types';
import GlossaryButton from '../components/GlossaryButton';
import GlossaryModal from '../components/GlossaryModal';

const DividingPercentLevel2: React.FC<LevelComponentProps> = () => {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  return (
    <div className="flex items-center justify-center h-full text-4xl font-bold text-gray-700 italic">
      <GlossaryButton onClick={() => setIsGlossaryOpen(true)} />
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      placeholder
    </div>
  );
};

export default DividingPercentLevel2;
