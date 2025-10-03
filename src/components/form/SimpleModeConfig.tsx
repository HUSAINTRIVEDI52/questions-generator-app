import React from 'react';
import { useFormState } from '../../hooks/useFormState';
import { QuestionStructure } from './QuestionStructure';

type UseFormStateReturn = ReturnType<typeof useFormState>;

interface SimpleModeConfigProps {
    formState: UseFormStateReturn['formState'];
    formHandlers: UseFormStateReturn['formHandlers'];
    derivedState: UseFormStateReturn['derivedState'];
}

const labelStyles = "block text-sm font-semibold text-slate-600 mb-1";

export const SimpleModeConfig: React.FC<SimpleModeConfigProps> = ({ formState, formHandlers, derivedState }) => {
    const { chapters } = formState;
    const { setChapters } = formHandlers;
    const { availableChapters } = derivedState;

    const selectAll = chapters.length === availableChapters.length && availableChapters.length > 0;

    const handleChapterToggle = (chapter: string) => {
        const newSelection = chapters.includes(chapter)
            ? chapters.filter(c => c !== chapter)
            : [...chapters, chapter];
        setChapters(newSelection);
    };

    const handleSelectAll = () => {
        setChapters(selectAll ? [] : [...availableChapters]);
    };

    return (
        <div className="space-y-4">
            {/* Chapters */}
            <div>
                <label className={labelStyles}>Chapters</label>
                <div className="border border-slate-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
                    <div className="flex items-center border-b border-slate-200 p-2 space-x-2 bg-slate-50 rounded-t-md">
                        <input id="select-all" type="checkbox" checked={selectAll} onChange={handleSelectAll} disabled={availableChapters.length === 0} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                        <label htmlFor="select-all" className="text-sm text-slate-700 font-medium select-none">Select All Chapters</label>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2 bg-slate-50/50">
                        {availableChapters.length > 0 ? availableChapters.map(chapter => (
                            <div key={chapter} className="flex items-center py-1.5 px-1 rounded-md hover:bg-slate-100">
                                <input id={chapter} type="checkbox" checked={chapters.includes(chapter)} onChange={() => handleChapterToggle(chapter)} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                                <label htmlFor={chapter} className="ml-2.5 text-sm text-slate-700 select-none cursor-pointer w-full">{chapter}</label>
                            </div>
                        )) : <p className="text-sm text-slate-400 text-center py-4">Please select a subject to see chapters.</p>}
                    </div>
                </div>
            </div>

            {/* Question Structure */}
            <div>
                <label className={labelStyles}>Question Structure</label>
                <p className="text-xs text-slate-500 mb-2">Define the types of questions, how many of each, and their marks. You can add multiple rows for the same question type (e.g., 5-mark and 3-mark long questions).</p>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                     <QuestionStructure
                        marksDistribution={formState.simpleModeDistribution}
                        onDistributionChange={formHandlers.setSimpleModeDistribution}
                        subject={formState.subject}
                        grade={formState.grade}
                    />
                </div>
            </div>
        </div>
    );
};