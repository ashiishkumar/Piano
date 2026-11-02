import React from 'react';
import { ReadyLesson } from '../../types/lesson';
import { ConceptPlayer } from './ConceptPlayer';
import { RhythmPlayer } from './RhythmPlayer';
import { ChordDrillPlayer } from './ChordDrillPlayer';
import { QuizPlayer } from './QuizPlayer';
import { KeyboardTaskPlayer } from './KeyboardTaskPlayer';
import { PatternPlayer } from './PatternPlayer';
import { EarPlayer } from './EarPlayer';
import { CheckpointPlayer } from './CheckpointPlayer';
import { LessonFrame } from './LessonFrame';

/** Routes a non-song lesson to its player. Song lessons use the score engine instead. */
export const LessonPlayer: React.FC<{ lesson: ReadyLesson }> = ({ lesson }) => {
  switch (lesson.type) {
    case 'concept':
      return <ConceptPlayer lesson={lesson} />;
    case 'rhythm':
      return <RhythmPlayer lesson={lesson} />;
    case 'chord-drill':
      return <ChordDrillPlayer lesson={lesson} />;
    case 'quiz':
      return <QuizPlayer lesson={lesson} />;
    case 'keyboard-task':
      return <KeyboardTaskPlayer lesson={lesson} />;
    case 'pattern':
      return <PatternPlayer lesson={lesson} />;
    case 'ear':
      return <EarPlayer lesson={lesson} />;
    case 'checkpoint':
      return <CheckpointPlayer lesson={lesson} />;
    default:
      return (
        <LessonFrame lesson={lesson}>
          <div className="max-w-2xl mx-auto px-6 py-12 text-slate-400">This lesson type does not have a player yet.</div>
        </LessonFrame>
      );
  }
};
