import React, { useState, useEffect } from 'react';
import type { FormState } from '../../types';
import type { useFormState } from '../../hooks/useFormState';

type UseFormStateReturn = ReturnType<typeof useFormState>;

interface ContentSelectionProps {
    formState: UseFormStateReturn['formState'];
    formHandlers: UseFormStateReturn['formHandlers'];
    derivedState: UseFormStateReturn['derivedState'];
}

const labelStyles = "block text-sm font-semibold text-slate-600 mb-1";
const selectStyles = "w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-slate-100 disabled:text-slate-500";

export const ContentSelection: React.FC<ContentSelectionProps> = ({ formState, formHandlers, derivedState }) => {
    const { grade, medium, subject, chapters, difficulty } = formState;
    const { setGrade, setMedium, setSubject, setChapters, setDifficulty } = formHandlers;
    const { grades, availableMediums, availableSubjects, availableChapters } = derivedState;

    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        setSelectAll(chapters.length === availableChapters.length && availableChapters.length > 0);
    }, [chapters, availableChapters]);

    const handleChapterToggle = (chapter: string) => {
        const newSelection = chapters.includes(chapter)
            ? chapters.filter(c => c !== chapter)
            : [...chapters, chapter];
        setChapters(newSelection);
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setChapters(newSelectAll ? [...availableChapters] : []);
    };

    return (
        <>
            <div>
                <label htmlFor="grade" className={labelStyles}>Grade</label>
                <select id="grade" value={grade} onChange={e => setGrade(e.target.value)} className={selectStyles}>
                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="medium" className={labelStyles}>Medium</label>
                <select id="medium" value={medium} onChange={e => setMedium(e.target.value)} disabled={!grade} className={selectStyles}>
                    <option value="">Select Medium</option>
                    {availableMediums.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="subject" className={labelStyles}>Subject</label>
                <select id="subject" value={subject} onChange={e => setSubject(e.target.value)} disabled={!medium} className={selectStyles}>
                    <option value="">Select Subject</option>
                    {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
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
            <div>
                <label htmlFor="difficulty" className={labelStyles}>Difficulty</label>
                <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')} className={selectStyles}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                </select>
            </div>
        </>
    );
};