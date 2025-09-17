import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FormState, ChapterQuestionConfig } from '../types';
import { GSEB_CURRICULUM, SIMPLE_MODE_MARKS_SCHEME } from '../constants';

const grades = Object.keys(GSEB_CURRICULUM).sort((a, b) => parseInt(b.split(' ')[1]) - parseInt(a.split(' ')[1]));

const initialCounts = {
    mcqCount: 5,
    shortAnswerCount: 5,
    longAnswerCount: 3,
    trueFalseCount: 0,
    fillInTheBlanksCount: 0,
    oneWordAnswerCount: 0,
    matchTheFollowingCount: 0,
    graphQuestionCount: 0,
};

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
    ...initialCounts,
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
            const newTotalMarks = Object.keys(SIMPLE_MODE_MARKS_SCHEME).reduce((total, key) => {
                const count = formState[key as keyof typeof initialCounts] as number || 0;
                const marks = SIMPLE_MODE_MARKS_SCHEME[key];
                return total + (count * marks);
            }, 0);
            
            setFormState(prev => ({ ...prev, totalMarks: newTotalMarks }));
        }
    }, [
        formState.generationMode, formState.mcqCount, formState.trueFalseCount, 
        formState.fillInTheBlanksCount, formState.oneWordAnswerCount, formState.shortAnswerCount,
        formState.longAnswerCount, formState.matchTheFollowingCount, formState.graphQuestionCount
    ]);

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
        setMcqCount: createHandler('mcqCount'),
        setShortAnswerCount: createHandler('shortAnswerCount'),
        setLongAnswerCount: createHandler('longAnswerCount'),
        setTrueFalseCount: createHandler('trueFalseCount'),
        setFillInTheBlanksCount: createHandler('fillInTheBlanksCount'),
        setOneWordAnswerCount: createHandler('oneWordAnswerCount'),
        setMatchTheFollowingCount: createHandler('matchTheFollowingCount'),
        setGraphQuestionCount: createHandler('graphQuestionCount'),
        setChapterConfigs,
    }), [createHandler, setChapterConfigs]);

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