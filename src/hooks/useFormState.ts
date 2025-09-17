import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FormState, ChapterQuestionConfig } from '../types';
import { GSEB_CURRICULUM } from '../constants';

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

const initialSimpleMarks = (initialCounts.mcqCount * 1) + (initialCounts.shortAnswerCount * 2) + (initialCounts.longAnswerCount * 5);


const initialFormState: FormState = {
    institutionName: 'GSEB Academy',
    title: 'Periodic Test - 1',
    grade: grades[0],
    medium: '',
    subject: '',
    difficulty: 'Medium',
    totalMarks: initialSimpleMarks,
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
            const marksScheme = {
                mcqCount: 1,
                trueFalseCount: 1,
                fillInTheBlanksCount: 1,
                oneWordAnswerCount: 1,
                shortAnswerCount: 2,
                longAnswerCount: 5,
                matchTheFollowingCount: 4,
                graphQuestionCount: 5,
            };
            const newTotalMarks = 
                (formState.mcqCount * marksScheme.mcqCount) +
                (formState.trueFalseCount * marksScheme.trueFalseCount) +
                (formState.fillInTheBlanksCount * marksScheme.fillInTheBlanksCount) +
                (formState.oneWordAnswerCount * marksScheme.oneWordAnswerCount) +
                (formState.shortAnswerCount * marksScheme.shortAnswerCount) +
                (formState.longAnswerCount * marksScheme.longAnswerCount) +
                (formState.matchTheFollowingCount * marksScheme.matchTheFollowingCount) +
                (formState.graphQuestionCount * marksScheme.graphQuestionCount);
            
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