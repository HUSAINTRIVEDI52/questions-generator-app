import React from 'react';
import type { FormState } from '../../types';
import { useFormState } from '../../hooks/useFormState';
import { Accordion } from '../common/Accordion';
import { PaperDetails } from './PaperDetails';
import { ContentSelection } from './ContentSelection';
import { QuestionStructure } from './QuestionStructure';
import { WandIcon } from '../common/Icons';

interface GeneratorFormProps {
  onGenerate: (formData: FormState) => void;
  isLoading: boolean;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isLoading }) => {
  const { formState, formHandlers, derivedState } = useFormState();
  const { totalMarks, isChapterSelectionDisabled } = derivedState;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.chapters.length === 0) {
      alert("Please select at least one chapter.");
      return;
    }
    if (totalMarks <= 0) {
      alert("Total marks must be greater than 0. Please add some questions.");
      return;
    }
    onGenerate({ ...formState, totalMarks });
  };

  const isSubmitDisabled = isLoading || isChapterSelectionDisabled || totalMarks === 0;

  return (
    <form onSubmit={handleSubmit} className="p-1 sm:p-6 rounded-xl space-y-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'}}>
      <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3">Paper Configuration</h2>
      
      <div className="space-y-4">
        <Accordion title="Paper Details" defaultOpen>
          <PaperDetails
            institutionName={formState.institutionName}
            title={formState.title}
            onInstitutionNameChange={formHandlers.setInstitutionName}
            onTitleChange={formHandlers.setTitle}
          />
        </Accordion>

        <Accordion title="Content Selection" defaultOpen>
          <ContentSelection 
            formState={formState}
            formHandlers={formHandlers}
            derivedState={derivedState}
          />
        </Accordion>
        
        <Accordion title="Question Structure" defaultOpen>
          <QuestionStructure
            marksDistribution={formState.marksDistribution}
            onDistributionChange={formHandlers.setMarksDistribution}
            totalMarks={totalMarks}
          />
        </Accordion>
      </div>

      <button type="submit" disabled={isSubmitDisabled} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transform active:scale-95">
        {isLoading ? (
          <>
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
    </form>
  );
};
