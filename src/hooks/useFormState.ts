import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FormState, ChapterQuestionConfig, MarksDistribution } from '../types';
import { GSEB_CURRICULUM } from '../constants';

const grades = Object.keys(GSEB_CURRICULUM).sort((a, b) => parseInt(b.split(' ')[1]) - parseInt(a.split(' ')[1]));

const initialFormState: FormState = {
    institutionName: 'GSEB Academy',
    title: 'Periodic Test - 1',
    grade: grades[0],
    medium: '',
    subject: '',
    difficulty: 'Medium',
    totalMarks: 0, // Let the useEffect calculate the initial correct value
    generationMode: 'simple',
    chapters: [],
    simpleModeDistribution: [
        { id: crypto.randomUUID(), marks: 1, count: 5, type: 'MCQ' },
        { id: crypto.randomUUID(), marks: 2, count: 5, type: 'Short Answer' },
        { id: crypto.randomUUID(), marks: 4, count: 3, type: 'Long Answer' },
    ],
    chapterConfigs: [],
};

export const useFormState = () => {
    const [formState, setFormState] = useState<FormState>(initialFormState);

    const availableMediums = useMemo(() => formState.grade ? Object.keys(GSEB_CURRICULUM[formState.grade] || {}) : [], [formState.grade]);
    const availableSubjects = useMemo(() => formState.grade && formState.medium ? Object.keys(GSEB_CURRICULUM[formState.grade]?.[formState.medium] || {}) : [], [formState.grade, formState.medium]);
    const availableChapters = useMemo(() => formState.grade && formState.medium && formState.subject ? GSEB_CURRICULUM[formState.grade]?.[formState.medium]?.[formState.subject] || [] : [], [formState.grade, formState.medium, formState.subject]);

    // Effects to handle cascading dropdown resets
    useEffect(() => {
        const newMedium = availableMediums.length > 0 ? availableMediums[0] : '';
        setFormState(prev => ({ ...prev, medium: newMedium, subject: '', chapters: [], chapterConfigs: [] }));
    }, [availableMediums]);

    useEffect(() => {
        const newSubject = availableSubjects.length > 0 ? availableSubjects[0] : '';
        setFormState(prev => ({ ...prev, subject: newSubject, chapters: [], chapterConfigs: [] }));
    }, [availableSubjects]);

    useEffect(() => {
        setFormState(prev => ({
            ...prev,
            chapters: [],
            chapterConfigs: availableChapters.map(chapter => ({ chapter, enabled: false, distribution: [] })),
        }));
    }, [availableChapters]);

    // Effect to dynamically update total marks for simple mode
    useEffect(() => {
        if (formState.generationMode === 'simple') {
            const newTotalMarks = formState.simpleModeDistribution.reduce((total, row) => {
                return total + (row.marks * row.count);
            }, 0);
            setFormState(prev => ({ ...prev, totalMarks: newTotalMarks }));
        }
    }, [formState.generationMode, formState.simpleModeDistribution]);

    // Effect to dynamically update total marks for advanced mode
    useEffect(() => {
        if (formState.generationMode === 'advanced') {
            const newTotalMarks = formState.chapterConfigs.reduce((total, config) => {
                if (!config.enabled) return total;
                return total + config.distribution.reduce((acc, row) => acc + row.marks * row.count, 0);
            }, 0);
            setFormState(prev => ({ ...prev, totalMarks: newTotalMarks }));
        }
    }, [formState.generationMode, formState.chapterConfigs]);


    const createHandler = useCallback(<K extends keyof FormState>(key: K) => (value: FormState[K]) => {
        setFormState(prev => ({ ...prev, [key]: value }));
    }, []);
    
    // Specific handler for simpleModeDistribution to work with QuestionStructure component
    const setSimpleModeDistribution = useCallback((updater: React.SetStateAction<MarksDistribution[]>) => {
        setFormState(prev => ({
            ...prev,
            simpleModeDistribution: typeof updater === 'function' ? updater(prev.simpleModeDistribution) : updater,
        }));
    }, []);

    const setChapterConfigs = useCallback((updater: React.SetStateAction<ChapterQuestionConfig[]>) => {
        setFormState(prev => ({
            ...prev,
            chapterConfigs: typeof updater === 'function' ? updater(prev.chapterConfigs) : updater,
        }));
    }, []);
    
    const formHandlers = useMemo(() => ({
        setInstitutionName: createHandler('institutionName'),
        setTitle: createHandler('title'),
        setGrade: createHandler('grade'),
        setMedium: createHandler('medium'),
        setSubject: createHandler('subject'),
        setDifficulty: createHandler('difficulty'),
        setGenerationMode: createHandler('generationMode'),
        setChapters: createHandler('chapters'),
        setSimpleModeDistribution,
        setChapterConfigs,
    }), [createHandler, setChapterConfigs, setSimpleModeDistribution]);

    const areAnyChaptersEnabled = useMemo(() => {
        if (formState.generationMode === 'simple') return formState.chapters.length > 0;
        return formState.chapterConfigs.some(c => c.enabled);
    }, [formState.generationMode, formState.chapters, formState.chapterConfigs]);

    return {
        formState,
        formHandlers,
        derivedState: {
            grades,
            availableMediums,
            availableSubjects,
            availableChapters,
            totalMarks: formState.totalMarks,
            areAnyChaptersEnabled,
        }
    };
};
