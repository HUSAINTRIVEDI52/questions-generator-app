import React from 'react';
import type { useFormState } from '../../hooks/useFormState';
import { SIMPLE_MODE_MARKS_SCHEME } from '../../constants';

type UseFormStateReturn = ReturnType<typeof useFormState>;

interface SimpleModeConfigProps {
    formState: UseFormStateReturn['formState'];
    formHandlers: UseFormStateReturn['formHandlers'];
    derivedState: UseFormStateReturn['derivedState'];
}

const labelStyles = "block text-sm font-semibold text-slate-600 mb-1";
const countInputStyles = "w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const QuestionCounter: React.FC<{ label: string; value: number; onChange: (value: number) => void; marks: number }> = ({ label, value, onChange, marks }) => (
    <div className="grid grid-cols-5 items-center gap-2">
        <label htmlFor={`${label}-count`} className="text-sm col-span-3">
            {label}
            <span className="text-xs text-slate-500 ml-1">({marks} {marks === 1 ? 'Mark' : 'Marks'})</span>
        </label>
        <div className="col-span-2">
            <input
                type="number"
                id={`${label}-count`}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                min="0"
                className={countInputStyles}
            />
        </div>
    </div>
);


export const SimpleModeConfig: React.FC<SimpleModeConfigProps> = ({ formState, formHandlers, derivedState }) => {
    const { chapters, mcqCount, shortAnswerCount, longAnswerCount, trueFalseCount, fillInTheBlanksCount, oneWordAnswerCount, matchTheFollowingCount, graphQuestionCount } = formState;
    const { setChapters, setMcqCount, setShortAnswerCount, setLongAnswerCount, setTrueFalseCount, setFillInTheBlanksCount, setOneWordAnswerCount, setMatchTheFollowingCount, setGraphQuestionCount } = formHandlers;
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
                    <QuestionCounter label="MCQs" value={mcqCount} onChange={setMcqCount} marks={SIMPLE_MODE_MARKS_SCHEME.mcqCount} />
                    <QuestionCounter label="Short Answers" value={shortAnswerCount} onChange={setShortAnswerCount} marks={SIMPLE_MODE_MARKS_SCHEME.shortAnswerCount} />
                    <QuestionCounter label="Long Answers" value={longAnswerCount} onChange={setLongAnswerCount} marks={SIMPLE_MODE_MARKS_SCHEME.longAnswerCount} />
                    <QuestionCounter label="True/False" value={trueFalseCount} onChange={setTrueFalseCount} marks={SIMPLE_MODE_MARKS_SCHEME.trueFalseCount} />
                    <QuestionCounter label="Fill in the Blanks" value={fillInTheBlanksCount} onChange={setFillInTheBlanksCount} marks={SIMPLE_MODE_MARKS_SCHEME.fillInTheBlanksCount} />
                    <QuestionCounter label="One Word Answer" value={oneWordAnswerCount} onChange={setOneWordAnswerCount} marks={SIMPLE_MODE_MARKS_SCHEME.oneWordAnswerCount} />
                    <QuestionCounter label="Match the Following" value={matchTheFollowingCount} onChange={setMatchTheFollowingCount} marks={SIMPLE_MODE_MARKS_SCHEME.matchTheFollowingCount} />
                    {formState.subject.toLowerCase().includes('social science') && (
                         <QuestionCounter label="Graph-based" value={graphQuestionCount} onChange={setGraphQuestionCount} marks={SIMPLE_MODE_MARKS_SCHEME.graphQuestionCount} />
                    )}
                </div>
            </div>

        </div>
    );
};