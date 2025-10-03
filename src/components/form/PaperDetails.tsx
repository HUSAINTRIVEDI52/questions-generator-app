import React from 'react';
import { useFormState } from '../../hooks/useFormState';

type UseFormStateReturn = ReturnType<typeof useFormState>;

interface PaperDetailsProps {
    formState: UseFormStateReturn['formState'];
    formHandlers: UseFormStateReturn['formHandlers'];
    derivedState: UseFormStateReturn['derivedState'];
}

const labelStyles = "block text-sm font-semibold text-slate-600 mb-1";
const inputStyles = "w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
const selectStyles = `${inputStyles} disabled:bg-slate-100 disabled:text-slate-500`;

export const PaperDetails: React.FC<PaperDetailsProps> = ({ formState, formHandlers, derivedState }) => {
    const { institutionName, title, grade, medium, subject, difficulty } = formState;
    const { setInstitutionName, setTitle, setGrade, setMedium, setSubject, setDifficulty } = formHandlers;
    const { grades, availableMediums, availableSubjects } = derivedState;
    
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="institutionName" className={labelStyles}>Institution Name</label>
                <input
                    type="text"
                    id="institutionName"
                    value={institutionName}
                    onChange={e => setInstitutionName(e.target.value)}
                    className={inputStyles}
                />
            </div>
            <div>
                <label htmlFor="title" className={labelStyles}>Paper Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className={inputStyles}
                    placeholder="e.g., Annual Examination"
                />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <label htmlFor="difficulty" className={labelStyles}>Difficulty</label>
                    <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')} className={selectStyles}>
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                    </select>
                </div>
            </div>
        </div>
    );
};