import React from 'react';
import { useFormState } from '../../hooks/useFormState';
import { QuestionStructure } from './QuestionStructure';
import type { ChapterQuestionConfig } from '../../types';

type UseFormStateReturn = ReturnType<typeof useFormState>;

interface ContentSelectionProps {
    formState: UseFormStateReturn['formState'];
    formHandlers: UseFormStateReturn['formHandlers'];
    derivedState: UseFormStateReturn['derivedState'];
}

const labelStyles = "block text-sm font-semibold text-slate-600 mb-1";

export const ContentSelection: React.FC<ContentSelectionProps> = ({ formState, formHandlers }) => {
    const { subject, grade, chapterConfigs } = formState;
    const { setChapterConfigs } = formHandlers;

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
                                        grade={grade}
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