import React from 'react';
import type { useFormState } from '../../hooks/useFormState';

type UseFormStateReturn = ReturnType<typeof useFormState>;

interface SimpleModeConfigProps {
    formState: UseFormStateReturn['formState'];
    formHandlers: UseFormStateReturn['formHandlers'];
    derivedState: UseFormStateReturn['derivedState'];
}

const labelStyles = "block text-sm font-semibold text-slate-600 mb-1";
const countInputStyles = "w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

const QuestionCounter: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (
    <div className="grid grid-cols-3 items-center gap-2">
        <label htmlFor={`${label}-count`} className="text-sm col-span-2">{label}</label>
        <input
            type="number"
            id={`${label}-count`}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            min="0"
            className={countInputStyles}
        />
    </div>
);


export const SimpleModeConfig: React.FC<SimpleModeConfigProps> = ({ formState, formHandlers, derivedState }) => {
    const { chapters, totalMarks, mcqCount, shortAnswerCount, longAnswerCount, trueFalseCount, fillInTheBlanksCount, oneWordAnswerCount, matchTheFollowingCount, graphQuestionCount } = formState;
    const { setChapters, setTotalMarks, setMcqCount, setShortAnswerCount, setLongAnswerCount, setTrueFalseCount, setFillInTheBlanksCount, setOneWordAnswerCount, setMatchTheFollowingCount, setGraphQuestionCount } = formHandlers;
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

            {/* Total Marks */}
            <div>
                <label htmlFor="totalMarks" className={labelStyles}>Total Marks</label>
                <input
                    type="number"
                    id="totalMarks"
                    value={totalMarks}
                    onChange={e => setTotalMarks(Number(e.target.value))}
                    min="1"
                    className="w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
            </div>

            {/* Question Counts */}
            <div>
                <p className={labelStyles}>Number of Questions</p>
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <QuestionCounter label="MCQs" value={mcqCount} onChange={setMcqCount} />
                    <QuestionCounter label="Short Answers" value={shortAnswerCount} onChange={setShortAnswerCount} />
                    <QuestionCounter label="Long Answers" value={longAnswerCount} onChange={setLongAnswerCount} />
                    <QuestionCounter label="True/False" value={trueFalseCount} onChange={setTrueFalseCount} />
                    <QuestionCounter label="Fill in the Blanks" value={fillInTheBlanksCount} onChange={setFillInTheBlanksCount} />
                    <QuestionCounter label="One Word Answer" value={oneWordAnswerCount} onChange={setOneWordAnswerCount} />
                    <QuestionCounter label="Match the Following" value={matchTheFollowingCount} onChange={setMatchTheFollowingCount} />
                    {formState.subject.toLowerCase().includes('social science') && (
                         <QuestionCounter label="Graph-based" value={graphQuestionCount} onChange={setGraphQuestionCount} />
                    )}
                </div>
            </div>

        </div>
    );
};
