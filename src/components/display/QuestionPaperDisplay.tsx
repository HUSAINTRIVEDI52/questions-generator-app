import React, { useState } from 'react';
import type { QuestionPaper } from '../../types';
import { PaperActions } from './PaperActions';
import { PaperContent } from './PaperContent';

interface QuestionPaperDisplayProps {
  paper: QuestionPaper;
  onNewPaper: () => void;
  onRegenerateQuestion: (questionId: string, sectionIndex: number) => void;
  regeneratingQuestionId: string | null;
  error: string | null;
}

export const QuestionPaperDisplay: React.FC<QuestionPaperDisplayProps> = ({ paper, onNewPaper, onRegenerateQuestion, regeneratingQuestionId, error }) => {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 print-area animate-fade-in-up">
        {error && (
            <div className="p-4 m-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md" role="alert">
              <p>{error}</p>
            </div>
        )}
        <PaperActions
            paper={paper}
            onNewPaper={onNewPaper}
            showAnswers={showAnswers}
            onToggleAnswers={() => setShowAnswers(prev => !prev)}
        />
        <PaperContent 
            paper={paper} 
            showAnswers={showAnswers}
            onRegenerateQuestion={onRegenerateQuestion}
            regeneratingQuestionId={regeneratingQuestionId}
        />
    </div>
  );
};