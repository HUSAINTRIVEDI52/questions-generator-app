import React, { useState } from 'react';
import type { QuestionPaper } from '../../types';
import { PaperActions } from './PaperActions';
import { PaperContent } from './PaperContent';

interface QuestionPaperDisplayProps {
  paper: QuestionPaper;
  onNewPaper: () => void;
}

export const QuestionPaperDisplay: React.FC<QuestionPaperDisplayProps> = ({ paper, onNewPaper }) => {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 print-area animate-fade-in-up">
        <PaperActions
            paper={paper}
            onNewPaper={onNewPaper}
            showAnswers={showAnswers}
            onToggleAnswers={() => setShowAnswers(prev => !prev)}
        />
        <PaperContent paper={paper} showAnswers={showAnswers} />
    </div>
  );
};
