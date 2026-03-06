import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Level, PlayerProgress, Lesson, QuizQuestion, LevelComponentProps } from './types';
import { LevelStatus } from './types';
import { usePlayerProgress } from './hooks/usePlayerProgress';
import { playSuccessSound } from './services/audioService';
import { ToolbarProvider } from './hooks/useToolbarState';

import LevelView from './components/LevelView';
import PatternLevel1 from './levels/PatternLevel1';
import PatternLevel2 from './levels/PatternLevel2';
import PatternLevel3 from './levels/PatternLevel3';
import Loop2Level1 from './levels/Loop2Level1';
import Loop2Level2 from './levels/Loop2Level2';
import Loop3Level1 from './levels/Loop3Level1';
import Loop3Level2 from './levels/Loop3Level2';
import Loop3Level3 from './levels/Loop3Level3';
import Loop4Level1 from './levels/Loop4Level1';
import Loop4Level2 from './levels/Loop4Level2';
import Loop4Level3 from './levels/Loop4Level3';

// --- Icon Components ---
const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill={filled ? "#FACC15" : "none"} 
        stroke={filled ? "#FACC15" : "#4B5563"} 
        strokeWidth={filled ? 0 : 2}
        className={className}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
    >
        <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm3 8H9V7a3 3 0 0 1 6 0z" />
    </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.89a1.5 1.5 0 0 0 0-2.54L6.3 2.841Z" />
    </svg>
);

const AVATAR_UNLOCK_THRESHOLD = 20;

const PlayerStatusDisplay: React.FC<{ totalStars: number; selectedAvatar: string | null; }> = ({ totalStars, selectedAvatar }) => {
    return (
        <div 
            className="fixed top-4 left-4 z-50 flex items-center gap-3 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-full shadow-lg px-4 py-2"
        >
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-2xl">
                {selectedAvatar || '👤'}
            </div>
            <div className="flex items-center gap-2">
                <StarIcon className="w-6 h-6 text-yellow-400" filled={true} />
                <span className="text-xl font-bold text-white tracking-wider">{totalStars}</span>
            </div>
        </div>
    );
};

const LESSON_DEFINITIONS: Lesson[] = [
    {
        title: "Identifying Patterns",
        levels: [
            { id: 'pattern-1', name: 'Level 1', description: 'Identify repeating, growing, and shrinking patterns.', component: PatternLevel1, topic: 'Patterns' },
            { id: 'pattern-2', name: 'Level 2', description: 'Translate visual patterns to numeric rules.', component: PatternLevel2, topic: 'Pattern Rules' },
            { id: 'pattern-3', name: 'Level 3', description: 'Test your pattern detective skills.', component: PatternLevel3, topic: 'Linearity' },
        ]
    },
    {
        title: "Same Pattern, Different Look",
        levels: [
            { id: 'loop2-1', name: 'Level 1', description: 'Compare different ways to show a pattern.', component: Loop2Level1, topic: 'Representations' },
            { id: 'loop2-2', name: 'Level 2', description: 'Match different representations of the same pattern.', component: Loop2Level2, topic: 'Matching' }
        ]
    },
    {
        title: "Variables and Constants",
        levels: [
            { id: 'loop3-1', name: 'Level 1', description: 'Understand terms, variables, and constants.', component: Loop3Level1, topic: 'Vocabulary' },
            { id: 'loop3-2', name: 'Level 2', description: 'Apply vocabulary to scenarios and figures.', component: Loop3Level2, topic: 'Analysis' },
            { id: 'loop3-3', name: 'Level 3', description: 'Analyze graphs, tables, and real-world scenarios.', component: Loop3Level3, topic: 'Mastery' },
        ]
    },
    {
        title: "Expressions",
        levels: [
            { id: 'loop4-1', name: 'Level 1', description: 'Learn to build algebraic expressions from patterns.', component: Loop4Level1, topic: 'Algebra' },
            { id: 'loop4-2', name: 'Level 2', description: 'Deconstruct and identify parts of algebraic expressions.', component: Loop4Level2, topic: 'Analysis' },
            { id: 'loop4-3', name: 'Level 3', description: 'Solve advanced expression challenges.', component: Loop4Level3, topic: 'Mastery' }
        ]
    }
];

const getLevelStatus = (level: Level, progress: PlayerProgress): LevelStatus => {
    if ((progress[level.id] || 0) >= 2) return LevelStatus.COMPLETED;
    
    let lessonForLevel: Lesson | undefined;
    let indexInLesson = -1;
    let lessonIndex = -1;
    for (let i = 0; i < LESSON_DEFINITIONS.length; i++) {
        const lesson = LESSON_DEFINITIONS[i];
        const foundIndex = lesson.levels.findIndex(l => l.id === level.id);
        if (foundIndex !== -1) { lessonForLevel = lesson; indexInLesson = foundIndex; lessonIndex = i; break; }
    }
    if (!lessonForLevel) return LevelStatus.LOCKED;
    if (indexInLesson > 0) {
        const prevLevelInLesson = lessonForLevel.levels[indexInLesson - 1];
        if ((progress[prevLevelInLesson.id] || 0) < 2) return LevelStatus.LOCKED;
    }
    if (lessonIndex === 0) return LevelStatus.UNLOCKED;
    if (lessonIndex > 0) {
        const prevLesson = LESSON_DEFINITIONS[lessonIndex - 1];
        const prevLessonComplete = prevLesson.levels.every(l => (progress[l.id] || 0) >= 2);
        return prevLessonComplete ? LevelStatus.UNLOCKED : LevelStatus.LOCKED;
    }
    return LevelStatus.LOCKED;
};

const LevelNode: React.FC<{ level: Level; status: LevelStatus; stars: number; onSelectLevel: (id: string) => void; onCompleteLevel: (id: string, stars: number) => void; }> = ({ level, status, stars, onSelectLevel, onCompleteLevel }) => {
    const isLocked = status === LevelStatus.LOCKED;
    const isCompleted = status === LevelStatus.COMPLETED;
    
    return (
        <div className="flex flex-col items-center relative w-24 text-center">
            <button 
                onClick={() => !isLocked && onSelectLevel(level.id)} 
                disabled={isLocked}
                className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 
                  ${isLocked ? 'border-slate-700 bg-slate-800 text-slate-600' : 'border-slate-500 bg-slate-700 text-white hover:border-white shadow-xl'}
                  ${isCompleted ? 'bg-emerald-600 border-emerald-400' : ''}
                `}
            >
                {isLocked ? <LockIcon className="w-6 h-6" /> : isCompleted ? <CheckCircleIcon className="w-8 h-8" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            
            <p className="mt-4 font-bold text-[10px] text-white uppercase tracking-wider h-8 line-clamp-2">
                {level.name}
            </p>
            
            <div className="flex gap-0.5 mt-1">
                {[1, 2, 3].map(i => <StarIcon key={i} filled={i <= stars} className="w-3.5 h-3.5" />)}
            </div>
        </div>
    );
};

const LevelMap: React.FC<{ lessons: Lesson[], progress: PlayerProgress; onSelectLevel: (id: string) => void; totalStars: number; selectedAvatar: string | null; onCompleteLevel: (id: string, stars: number) => void; }> = ({ lessons, progress, onSelectLevel, totalStars, selectedAvatar, onCompleteLevel }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#0B1120] text-white antialiased overflow-hidden">
            <PlayerStatusDisplay totalStars={totalStars} selectedAvatar={selectedAvatar} />
            
            <div className="text-center mt-12 mb-20 flex-shrink-0 z-10 px-4">
                <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">Showing Patterns with Algebra</h1>
                <p className="mt-2 text-slate-400 font-bold text-sm italic max-w-4xl mx-auto">
                    Goal: I can write algebraic expressions to show patterns and relationships that I see in words, numbers, or pictures.
                </p>
            </div>

            {/* Scrollable Container */}
            <div 
                ref={scrollContainerRef}
                className="flex-grow flex items-center overflow-x-auto custom-scrollbar px-[10vw] pb-12"
            >
                <div className="flex items-center relative min-w-max h-full">
                    {/* The Solid Yellow Connecting Pipe with a 3D tubular effect */}
                    <div 
                        className="absolute top-[50%] left-[-10vw] h-6 -translate-y-[20px] pointer-events-none"
                        style={{ 
                            width: `calc(100% + 20vw)`,
                            background: 'linear-gradient(to bottom, #854D0E 0%, #EAB308 25%, #FACC15 50%, #EAB308 75%, #713F12 100%)',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        }}
                    />

                    <div className="flex gap-16 z-10">
                        {lessons.map((lesson, idx) => (
                            <div 
                                key={lesson.title + idx} 
                                className="bg-[#161B2E]/60 backdrop-blur-md border border-slate-700/50 rounded-[2.5rem] p-10 min-w-[500px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative"
                            >
                                <h2 className="text-[#38BDF8] text-lg font-black tracking-widest mb-12 text-center">
                                    {lesson.title}
                                </h2>
                                <div className="flex justify-around items-start gap-6">
                                    {lesson.levels.map(level => (
                                        <LevelNode 
                                            key={level.id} 
                                            level={level} 
                                            status={getLevelStatus(level, progress)} 
                                            onSelectLevel={onSelectLevel} 
                                            stars={progress[level.id] || 0} 
                                            onCompleteLevel={onCompleteLevel} 
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AVATARS = ['👩‍🚀', '🕵️‍♀️', '👨‍🌾', '👩‍🎨', '👨‍開', '🦸‍♀️', '🧑‍🔬', '🧑‍開'];
const AvatarSelectionModal: React.FC<{ onSelect: (avatar: string) => void }> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex flex-col justify-center items-center z-[200] p-4">
      <div className="bg-white rounded-[3rem] p-12 max-w-2xl w-full text-center text-gray-900 border-[12px] border-yellow-100">
        <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4">Choose Your Identity</h2>
        <div className="grid grid-cols-4 gap-6 my-12">
            {AVATARS.map(avatar => (
                <button 
                    key={avatar} 
                    onClick={() => setSelected(avatar)} 
                    className={`text-6xl p-6 rounded-[2rem] transition-all duration-300 ${selected === avatar ? 'bg-yellow-400 scale-110 shadow-2xl' : 'bg-slate-50 hover:bg-slate-100 border-2 border-slate-100'}`}
                >
                    {avatar}
                </button>
            ))}
        </div>
        <button 
            onClick={() => selected && onSelect(selected)} 
            disabled={!selected} 
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-200 text-white font-black py-5 px-12 rounded-2xl text-2xl shadow-xl transition-all active:scale-95 uppercase"
        >
            Begin Journey
        </button>
      </div>
    </div>
  );
};

function App() {
    const { progress, partialProgress, savePartialProgress, completeLevel, resetProgress, selectedAvatar, setSelectedAvatar } = usePlayerProgress(LESSON_DEFINITIONS);
    const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const totalStars = useMemo(() => Object.values(progress).reduce((sum, stars) => sum + stars, 0), [progress]);
    
    useEffect(() => { 
        if (!selectedAvatar && totalStars >= AVATAR_UNLOCK_THRESHOLD) {
            setShowAvatarModal(true);
        }
    }, [totalStars, selectedAvatar]);

    const allLevels = useMemo(() => LESSON_DEFINITIONS.flatMap(lesson => lesson.levels), []);
    const currentLevel = allLevels.find(l => l.id === currentLevelId);
    
    // Find current lesson and determine if current level is last in lesson
    const currentLesson = useMemo(() => 
        LESSON_DEFINITIONS.find(lesson => lesson.levels.some(l => l.id === currentLevelId)),
        [currentLevelId]
    );
    
    const isLastLevel = useMemo(() => {
        if (!currentLesson || !currentLevel) return false;
        const lastLevelInLesson = currentLesson.levels[currentLesson.levels.length - 1];
        return lastLevelInLesson.id === currentLevel.id;
    }, [currentLesson, currentLevel]);
    
    // Find next level in the same lesson
    const nextLevelId = useMemo(() => {
        if (!currentLesson || !currentLevel || isLastLevel) return null;
        const currentIndex = currentLesson.levels.findIndex(l => l.id === currentLevel.id);
        if (currentIndex >= 0 && currentIndex < currentLesson.levels.length - 1) {
            return currentLesson.levels[currentIndex + 1].id;
        }
        return null;
    }, [currentLesson, currentLevel, isLastLevel]);

    return (
        <ToolbarProvider>
            <div className="min-h-screen bg-[#0B1120] font-sans text-white antialiased">
                {currentLevel ? (
                    <LevelView
                        level={currentLevel}
                        onBackToMap={() => setCurrentLevelId(null)}
                        onComplete={(stars) => completeLevel(currentLevel.id, stars)}
                        onExit={() => setCurrentLevelId(null)}
                        partialProgress={partialProgress[currentLevel.id]}
                        onSavePartialProgress={(state) => savePartialProgress(currentLevel.id, state)}
                        progress={progress}
                        lessonTitle={currentLesson?.title}
                        isLastLevel={isLastLevel}
                        onNext={() => nextLevelId && setCurrentLevelId(nextLevelId)}
                    />
                ) : (
                    <LevelMap 
                        lessons={LESSON_DEFINITIONS} progress={progress} onSelectLevel={setCurrentLevelId}
                        totalStars={totalStars} selectedAvatar={selectedAvatar} onCompleteLevel={completeLevel}
                    />
                )}
                {showAvatarModal && <AvatarSelectionModal onSelect={(avatar) => { setSelectedAvatar(avatar); setShowAvatarModal(false); }} />}
            </div>
        </ToolbarProvider>
    );
}
export default App;