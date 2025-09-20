import React, { useMemo } from 'react';
import type { FormState } from '../../types';
import { useFormState } from '../../hooks/useFormState';
import { Accordion } from '../common/Accordion';
import { PaperDetails } from './PaperDetails';
import { ContentSelection } from './ContentSelection';
import { WandIcon } from '../common/Icons';
import { SimpleModeConfig } from './SimpleModeConfig';

interface GeneratorFormProps {
  onGenerate: (formData: FormState) => void;
  isLoading: boolean;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isLoading }) => {
  const { formState, formHandlers, derivedState } = useFormState();
  const { areAnyChaptersEnabled } = derivedState;

  // UPDATE: Updated to include map and pointwise questions in the validation logic.
  const submissionError = useMemo(() => {
    if (!areAnyChaptersEnabled) return "Please select at least one chapter.";

    let totalQuestions = 0;

    if (formState.generationMode === 'simple') {
        const { mcqCount, mcqMarks, shortAnswerCount, shortAnswerMarks, longAnswerCount, longAnswerMarks, trueFalseCount, trueFalseMarks, fillInTheBlanksCount, fillInTheBlanksMarks, oneWordAnswerCount, oneWordAnswerMarks, matchTheFollowingCount, matchTheFollowingMarks, mapQuestionCount, mapQuestionMarks, pointwiseQuestionCount, pointwiseQuestionMarks } = formState;
        
        const questionTypes = [
            { count: mcqCount, marks: mcqMarks, name: "MCQs" },
            { count: shortAnswerCount, marks: shortAnswerMarks, name: "Short Answers" },
            { count: longAnswerCount, marks: longAnswerMarks, name: "Long Answers" },
            { count: trueFalseCount, marks: trueFalseMarks, name: "True/False" },
            { count: fillInTheBlanksCount, marks: fillInTheBlanksMarks, name: "Fill in the Blanks" },
            { count: oneWordAnswerCount, marks: oneWordAnswerMarks, name: "One Word Answers" },
            { count: matchTheFollowingCount, marks: matchTheFollowingMarks, name: "Match the Following" },
            { count: mapQuestionCount, marks: mapQuestionMarks, name: "Map-based" },
            { count: pointwiseQuestionCount, marks: pointwiseQuestionMarks, name: "Point-wise" },
        ];

        for (const type of questionTypes) {
            if (type.count > 0) {
                totalQuestions += type.count;
                if (type.marks <= 0) {
                    return `${type.name} must have marks greater than 0.`;
                }
            }
        }
    } else { // advanced mode
        for (const config of formState.chapterConfigs) {
            if (config.enabled) {
                for (const dist of config.distribution) {
                    if (dist.count > 0) {
                        totalQuestions += dist.count;
                        if (dist.marks <= 0) {
                            return `Questions in "${config.chapter}" must have marks greater than 0.`;
                        }
                    }
                }
            }
        }
    }

    if (totalQuestions === 0) {
        return "Please add at least one question to the paper.";
    }
    
    return null;
  }, [formState, areAnyChaptersEnabled]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || submissionError) {
      return;
    }
    onGenerate(formState);
  };
  
  const ModeButton: React.FC<{ mode: 'simple' | 'advanced'; children: React.ReactNode }> = ({ mode, children }) => (
    <button
      type="button"
      onClick={() => formHandlers.setGenerationMode(mode)}
      className={`w-1/2 py-2 text-sm font-semibold transition-colors ${formState.generationMode === mode ? 'bg-blue-600 text-white shadow' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
    >
      {children}
    </button>
  );

  const isSubmitDisabled = isLoading || !!submissionError;

  return (
    <form onSubmit={handleSubmit} className="p-1 sm:p-6 rounded-xl space-y-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'}}>
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-slate-800">Paper Configuration</h2>
        <p className="text-sm font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-full">Total Marks: {derivedState.totalMarks}</p>
      </div>
      
      <div className="space-y-4">
        <Accordion title="1. Paper Details" defaultOpen>
          <PaperDetails
            formState={formState}
            formHandlers={formHandlers}
            derivedState={derivedState}
          />
        </Accordion>

        <Accordion title="2. Generation Mode" defaultOpen>
            <div className="flex rounded-md overflow-hidden border border-slate-300">
                <ModeButton mode="simple">Simple</ModeButton>
                <ModeButton mode="advanced">Advanced</ModeButton>
            </div>
            <p className="text-xs text-slate-500 mt-2 p-2 bg-slate-50 rounded-md">
                <strong>Simple:</strong> Set total question counts for selected chapters. <br/>
                <strong>Advanced:</strong> Define precise question counts for each chapter individually.
            </p>
        </Accordion>

        <Accordion title="3. Content & Structure" defaultOpen>
          {formState.generationMode === 'simple' ? (
              <SimpleModeConfig 
                formState={formState}
                formHandlers={formHandlers}
                derivedState={derivedState}
              />
          ) : (
             <ContentSelection 
                formState={formState}
                formHandlers={formHandlers}
                derivedState={derivedState}
            />
          )}
        </Accordion>
      </div>

      <button type="submit" disabled={isSubmitDisabled} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transform active:scale-95">
        {isLoading ? (
          <>
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
            Generating...
          </>
        ) : (
          <>
            <WandIcon />
            <span className="ml-2">Generate Paper</span>
          </>
        )}
      </button>
      {isSubmitDisabled && submissionError && !isLoading && (
          <p className="text-sm text-red-600 text-center mt-2">{submissionError}</p>
      )}
    </form>
  );
};