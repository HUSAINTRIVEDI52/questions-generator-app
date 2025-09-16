import React, { useState } from 'react';
import type { useFormState } from '../../hooks/useFormState';
import { TrueFalseIcon, FileTextIcon } from '../common/Icons';

type UseFormStateReturn = ReturnType<typeof useFormState>;

interface SimpleModeConfigProps {
    formState: UseFormStateReturn['formState'];
    formHandlers: UseFormStateReturn['formHandlers'];
    derivedState: UseFormStateReturn['derivedState'];
}

const labelStyles = "block text-sm font-semibold text-slate-600 mb-1";
const inputStyles = "w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

export const SimpleModeConfig: React.FC<SimpleModeConfigProps> = ({ formState, formHandlers, derivedState }) => {
    const { 
        chapters, subject, totalMarks, mcqCount, shortAnswerCount, longAnswerCount, 
        trueFalseCount, fillInTheBlanksCount, oneWordAnswerCount, 
        matchTheFollowingCount, graphQuestionCount
    } = formState;
    const { 
        setChapters, setTotalMarksSimple, setMcqCount, setShortAnswerCount, setLongAnswerCount,
        setTrueFalseCount, setFillInTheBlanksCount, setOneWordAnswerCount,
        setMatchTheFollowingCount, setGraphQuestionCount
    } = formHandlers;
    const { availableChapters } = derivedState;

    const [selectAll, setSelectAll] = useState(false);

    const handleChapterToggle = (chapter: string) => {
        const newSelection = chapters.includes(chapter)
            ? chapters.filter(c => c !== chapter)
            : [...chapters, chapter];
        setChapters(newSelection);
        setSelectAll(newSelection.length === availableChapters.length && availableChapters.length > 0);
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setChapters(newSelectAll ? [...availableChapters] : []);
    };
    
     React.useEffect(() => {
        setSelectAll(chapters.length === availableChapters.length && availableChapters.length > 0);
    }, [chapters, availableChapters]);

    const showGraphQuestion = subject && subject.toLowerCase().includes('social science');

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
                <input type="number" id="totalMarks" value={totalMarks} onChange={e => setTotalMarksSimple(Number(e.target.value))} min="10" className={inputStyles} />
            </div>

            {/* Question Counts */}
            <div>
                <p className={labelStyles}>Number of Questions</p>
                <div className="space-y-2">
                    {/* Basic Types */}
                    <div className="grid grid-cols-12 items-center gap-2"><label htmlFor="mcqCount" className="text-sm col-span-9 font-medium">MCQs</label><div className="col-span-3"><input type="number" id="mcqCount" value={mcqCount} onChange={e => setMcqCount(Number(e.target.value))} min="0" className={`${inputStyles} text-center`} /></div></div>
                    <div className="grid grid-cols-12 items-center gap-2"><label htmlFor="trueFalseCount" className="text-sm col-span-9 font-medium">True/False</label><div className="col-span-3"><input type="number" id="trueFalseCount" value={trueFalseCount} onChange={e => setTrueFalseCount(Number(e.target.value))} min="0" className={`${inputStyles} text-center`} /></div></div>
                    <div className="grid grid-cols-12 items-center gap-2"><label htmlFor="fillInTheBlanksCount" className="text-sm col-span-9 font-medium">Fill in the Blanks</label><div className="col-span-3"><input type="number" id="fillInTheBlanksCount" value={fillInTheBlanksCount} onChange={e => setFillInTheBlanksCount(Number(e.target.value))} min="0" className={`${inputStyles} text-center`} /></div></div>
                    <div className="grid grid-cols-12 items-center gap-2"><label htmlFor="oneWordAnswerCount" className="text-sm col-span-9 font-medium">One Word Answer</label><div className="col-span-3"><input type="number" id="oneWordAnswerCount" value={oneWordAnswerCount} onChange={e => setOneWordAnswerCount(Number(e.target.value))} min="0" className={`${inputStyles} text-center`} /></div></div>
                    
                    {/* Answer Types */}
                    <div className="grid grid-cols-12 items-center gap-2"><label htmlFor="shortAnswerCount" className="text-sm col-span-9 font-medium">Short Answers</label><div className="col-span-3"><input type="number" id="shortAnswerCount" value={shortAnswerCount} onChange={e => setShortAnswerCount(Number(e.target.value))} min="0" className={`${inputStyles} text-center`} /></div></div>
                    <div className="grid grid-cols-12 items-center gap-2"><label htmlFor="longAnswerCount" className="text-sm col-span-9 font-medium">Long Answers</label><div className="col-span-3"><input type="number" id="longAnswerCount" value={longAnswerCount} onChange={e => setLongAnswerCount(Number(e.target.value))} min="0" className={`${inputStyles} text-center`} /></div></div>

                    {/* Complex Types */}
                    <div className="grid grid-cols-12 items-center gap-2"><label htmlFor="matchTheFollowingCount" className="text-sm col-span-9 font-medium">Match the Following</label><div className="col-span-3"><input type="number" id="matchTheFollowingCount" value={matchTheFollowingCount} onChange={e => setMatchTheFollowingCount(Number(e.target.value))} min="0" className={`${inputStyles} text-center`} /></div></div>
                    {showGraphQuestion && <div className="grid grid-cols-12 items-center gap-2"><label htmlFor="graphQuestionCount" className="text-sm col-span-9 font-medium">Graph Questions</label><div className="col-span-3"><input type="number" id="graphQuestionCount" value={graphQuestionCount} onChange={e => setGraphQuestionCount(Number(e.target.value))} min="0" className={`${inputStyles} text-center`} /></div></div>}
                </div>
            </div>
        </div>
    );
};