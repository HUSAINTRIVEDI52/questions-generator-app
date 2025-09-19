import React from 'react';
import type { useFormState } from '../../hooks/useFormState';

type UseFormStateReturn = ReturnType<typeof useFormState>;

interface SimpleModeConfigProps {
    formState: UseFormStateReturn['formState'];
    formHandlers: UseFormStateReturn['formHandlers'];
    derivedState: UseFormStateReturn['derivedState'];
}

const labelStyles = "block text-sm font-semibold text-slate-600 mb-1";
const inputStyles = "w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const QuestionConfigRow: React.FC<{
    label: string;
    count: number;
    onCountChange: (value: number) => void;
    marks: number;
    onMarksChange: (value: number) => void;
}> = ({ label, count, onCountChange, marks, onMarksChange }) => (
    <div className="grid grid-cols-5 items-center gap-2">
        <label htmlFor={`${label}-count`} className="text-sm col-span-3">{label}</label>
        <div className="col-span-1">
             <input
                type="number"
                id={`${label}-count`}
                value={count}
                onChange={e => onCountChange(Number(e.target.value))}
                min="0"
                className={inputStyles}
                aria-label={`${label} count`}
            />
        </div>
        <div className="col-span-1">
             <input
                type="number"
                id={`${label}-marks`}
                value={marks}
                onChange={e => onMarksChange(Number(e.target.value))}
                min="0"
                className={inputStyles}
                aria-label={`${label} marks`}
            />
        </div>
    </div>
);


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

            {/* Question Counts */}
            <div>
                <p className={labelStyles}>Number of Questions</p>
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-5 items-center gap-2 text-xs text-slate-500 font-semibold px-1">
                        <span className="col-span-3">Question Type</span>
                        <span className="col-span-1 text-center">Count</span>
                        <span className="col-span-1 text-center">Marks/Q</span>
                    </div>
                    <QuestionConfigRow label="MCQs" count={formState.mcqCount} onCountChange={formHandlers.setMcqCount} marks={formState.mcqMarks} onMarksChange={formHandlers.setMcqMarks} />
                    <QuestionConfigRow label="Short Answers" count={formState.shortAnswerCount} onCountChange={formHandlers.setShortAnswerCount} marks={formState.shortAnswerMarks} onMarksChange={formHandlers.setShortAnswerMarks} />
                    <QuestionConfigRow label="Long Answers" count={formState.longAnswerCount} onCountChange={formHandlers.setLongAnswerCount} marks={formState.longAnswerMarks} onMarksChange={formHandlers.setLongAnswerMarks} />
                    <QuestionConfigRow label="True/False" count={formState.trueFalseCount} onCountChange={formHandlers.setTrueFalseCount} marks={formState.trueFalseMarks} onMarksChange={formHandlers.setTrueFalseMarks} />
                    <QuestionConfigRow label="Fill in the Blanks" count={formState.fillInTheBlanksCount} onCountChange={formHandlers.setFillInTheBlanksCount} marks={formState.fillInTheBlanksMarks} onMarksChange={formHandlers.setFillInTheBlanksMarks} />
                    <QuestionConfigRow label="One Word Answer" count={formState.oneWordAnswerCount} onCountChange={formHandlers.setOneWordAnswerCount} marks={formState.oneWordAnswerMarks} onMarksChange={formHandlers.setOneWordAnswerMarks} />
                    <QuestionConfigRow label="Match the Following" count={formState.matchTheFollowingCount} onCountChange={formHandlers.setMatchTheFollowingCount} marks={formState.matchTheFollowingMarks} onMarksChange={formHandlers.setMatchTheFollowingMarks} />
                    {formState.subject.toLowerCase().includes('social science') && (
                         <QuestionConfigRow label="Graph-based" count={formState.graphQuestionCount} onCountChange={formHandlers.setGraphQuestionCount} marks={formState.graphQuestionMarks} onMarksChange={formHandlers.setGraphQuestionMarks} />
                    )}
                    {formState.subject.toLowerCase().includes('math') && (formState.grade === 'Class 8' || formState.grade === 'Class 9') && (
                        <QuestionConfigRow label="Diagram-based" count={formState.diagramQuestionCount} onCountChange={formHandlers.setDiagramQuestionCount} marks={formState.diagramQuestionMarks} onMarksChange={formHandlers.setDiagramQuestionMarks} />
                    )}
                </div>
            </div>

        </div>
    );
};