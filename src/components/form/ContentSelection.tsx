import React from 'react';
import type { useFormState } from '../../hooks/useFormState';
import { Accordion } from '../common/Accordion';
import { QuestionStructure } from './QuestionStructure';
import type { ChapterQuestionConfig } from '../../types';

type UseFormStateReturn = ReturnType<typeof useFormState>;

interface ContentSelectionProps {
    formState: UseFormStateReturn['formState'];
    formHandlers: UseFormStateReturn['formHandlers'];
    derivedState: UseFormStateReturn['derivedState'];
}

const labelStyles = "block text-sm font-semibold text-slate-600 mb-1";
const selectStyles = "w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-slate-100 disabled:text-slate-500";

export const ContentSelection: React.FC<ContentSelectionProps> = ({ formState, formHandlers, derivedState }) => {
    const { grade, medium, subject, difficulty, chapterConfigs } = formState;
    const { setGrade, setMedium, setSubject, setDifficulty, setChapterConfigs } = formHandlers;
    const { grades, availableMediums, availableSubjects } = derivedState;

    const handleChapterToggle = (chapterName: string, enabled: boolean) => {
        setChapterConfigs(prev =>
            prev.map(config =>
                config.chapter === chapterName ? { ...config, enabled } : config
            )
        );
    };

    const handleChapterDistributionChange = (chapterName: string, newDistribution: ChapterQuestionConfig['distribution']) => {
        setChapterConfigs(prev =>
            prev.map(config =>
                config.chapter === chapterName ? { ...config, distribution: newDistribution } : config
            )
        );
    };
    
    const chapterMarks = (config: ChapterQuestionConfig) => {
        if (!config.enabled) return 0;
        return config.distribution.reduce((acc, row) => acc + row.marks * row.count, 0);
    }

    return (
        <div className="space-y-4">
            {/* Grade, Medium, Subject, Difficulty selectors */}
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
            
            {/* Chapter Configurations */}
            <div>
                 <label className={labelStyles}>Chapters</label>
                 <div className="space-y-2">
                    {chapterConfigs.length > 0 ? chapterConfigs.map(config => (
                        <div key={config.chapter} className="border border-slate-200 rounded-lg">
                             <div className="flex items-center justify-between p-2 bg-slate-50 rounded-t-lg">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`ch-select-${config.chapter}`}
                                        checked={config.enabled}
                                        onChange={e => handleChapterToggle(config.chapter, e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 mr-3"
                                    />
                                    <label htmlFor={`ch-select-${config.chapter}`} className="text-sm font-semibold text-slate-700 flex-grow cursor-pointer">{config.chapter}</label>
                                </div>
                                 <span className={`text-xs font-bold text-slate-600 px-2 py-0.5 rounded-full ${config.enabled && chapterMarks(config) > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-200'}`}>
                                    Marks: {chapterMarks(config)}
                                </span>
                            </div>
                            {config.enabled && (
                                <div className="p-3">
                                    <QuestionStructure
                                        marksDistribution={config.distribution}
                                        onDistributionChange={(newDist) => handleChapterDistributionChange(config.chapter, newDist)}
                                        subject={subject}
                                    />
                                </div>
                            )}
                        </div>
                    )) : <p className="text-sm text-slate-400 text-center py-4">Please select a subject to see chapters.</p>}
                 </div>
            </div>
        </div>
    );
};