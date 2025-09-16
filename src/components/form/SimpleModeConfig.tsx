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
    const { chapters, totalMarks, mcqCount, shortAnswerCount, longAnswerCount } = formState;
    const { setChapters, setTotalMarksSimple, setMcqCount, setShortAnswerCount, setLongAnswerCount } = formHandlers;
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
                    <div className="grid grid-cols-12 items-center gap-2">
                        <label htmlFor="mcqCount" className="text-sm col-span-2 flex items-center"><TrueFalseIcon /></label>
                        <label htmlFor="mcqCount" className="text-sm col-span-7 font-medium">MCQs</label>
                        <div className="col-span-3">
                            <input type="number" id="mcqCount" value={mcqCount} onChange={e => setMcqCount(Number(e.target.value))} min="0" className={`${inputStyles} text-center`} />
                        </div>
                    </div>
                    <div className="grid grid-cols-12 items-center gap-2">
                         <label htmlFor="shortAnswerCount" className="text-sm col-span-2 flex items-center"><FileTextIcon /></label>
                        <label htmlFor="shortAnswerCount" className="text-sm col-span-7 font-medium">Short Answers</label>
                        <div className="col-span-3">
                            <input type="number" id="shortAnswerCount" value={shortAnswerCount} onChange={e => setShortAnswerCount(Number(e.target.value))} min="0" className={`${inputStyles} text-center`} />
                        </div>
                    </div>
                    <div className="grid grid-cols-12 items-center gap-2">
                         <label htmlFor="longAnswerCount" className="text-sm col-span-2 flex items-center"><FileTextIcon /></label>
                        <label htmlFor="longAnswerCount" className="text-sm col-span-7 font-medium">Long Answers</label>
                        <div className="col-span-3">
                            <input type="number" id="longAnswerCount" value={longAnswerCount} onChange={e => setLongAnswerCount(Number(e.target.value))} min="0" className={`${inputStyles} text-center`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};