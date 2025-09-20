import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FormState, ChapterQuestionConfig } from '../types';
import { GSEB_CURRICULUM, SIMPLE_MODE_MARKS_SCHEME } from '../constants';

const grades = Object.keys(GSEB_CURRICULUM).sort((a, b) => parseInt(b.split(' ')[1]) - parseInt(a.split(' ')[1]));

// UPDATE: Replaced graphQuestionCount with mapQuestionCount and added pointwiseQuestionCount.
const initialCounts = {
    mcqCount: 5,
    shortAnswerCount: 5,
    longAnswerCount: 3,
    trueFalseCount: 0,
    fillInTheBlanksCount: 0,
    oneWordAnswerCount: 0,
    matchTheFollowingCount: 0,
    mapQuestionCount: 0,
    pointwiseQuestionCount: 0,
    diagramQuestionCount: 0,
};

// UPDATE: Replaced graphQuestionMarks with mapQuestionMarks and added pointwiseQuestionMarks.
const initialMarks = {
    mcqMarks: SIMPLE_MODE_MARKS_SCHEME.mcqCount,
    shortAnswerMarks: SIMPLE_MODE_MARKS_SCHEME.shortAnswerCount,
    longAnswerMarks: SIMPLE_MODE_MARKS_SCHEME.longAnswerCount,
    trueFalseMarks: SIMPLE_MODE_MARKS_SCHEME.trueFalseCount,
    fillInTheBlanksMarks: SIMPLE_MODE_MARKS_SCHEME.fillInTheBlanksCount,
    oneWordAnswerMarks: SIMPLE_MODE_MARKS_SCHEME.oneWordAnswerCount,
    matchTheFollowingMarks: SIMPLE_MODE_MARKS_SCHEME.matchTheFollowingCount,
    mapQuestionMarks: SIMPLE_MODE_MARKS_SCHEME.mapQuestionCount,
    pointwiseQuestionMarks: SIMPLE_MODE_MARKS_SCHEME.pointwiseQuestionCount,
    diagramQuestionMarks: SIMPLE_MODE_MARKS_SCHEME.diagramQuestionCount,
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
    ...initialMarks,
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
    // UPDATE: Replaced graph question logic with map and pointwise question logic.
    useEffect(() => {
        if (formState.generationMode === 'simple') {
            const {
                mcqCount, mcqMarks, shortAnswerCount, shortAnswerMarks, longAnswerCount, longAnswerMarks,
                trueFalseCount, trueFalseMarks, fillInTheBlanksCount, fillInTheBlanksMarks,
                oneWordAnswerCount, oneWordAnswerMarks, matchTheFollowingCount, matchTheFollowingMarks,
                mapQuestionCount, mapQuestionMarks, pointwiseQuestionCount, pointwiseQuestionMarks,
                diagramQuestionCount, diagramQuestionMarks,
            } = formState;

            const newTotalMarks = 
                (mcqCount * mcqMarks) +
                (shortAnswerCount * shortAnswerMarks) +
                (longAnswerCount * longAnswerMarks) +
                (trueFalseCount * trueFalseMarks) +
                (fillInTheBlanksCount * fillInTheBlanksMarks) +
                (oneWordAnswerCount * oneWordAnswerMarks) +
                (matchTheFollowingCount * matchTheFollowingMarks) +
                (mapQuestionCount * mapQuestionMarks) +
                (pointwiseQuestionCount * pointwiseQuestionMarks) +
                (diagramQuestionCount * diagramQuestionMarks);
            
            setFormState(prev => ({ ...prev, totalMarks: newTotalMarks }));
        }
    }, [
        formState.generationMode,
        formState.mcqCount, formState.mcqMarks,
        formState.shortAnswerCount, formState.shortAnswerMarks,
        formState.longAnswerCount, formState.longAnswerMarks,
        formState.trueFalseCount, formState.trueFalseMarks,
        formState.fillInTheBlanksCount, formState.fillInTheBlanksMarks,
        formState.oneWordAnswerCount, formState.oneWordAnswerMarks,
        formState.matchTheFollowingCount, formState.matchTheFollowingMarks,
        formState.mapQuestionCount, formState.mapQuestionMarks,
        formState.pointwiseQuestionCount, formState.pointwiseQuestionMarks,
        formState.diagramQuestionCount, formState.diagramQuestionMarks,
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

    // UPDATE: Added handlers for new question types.
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
        setMapQuestionCount: createHandler('mapQuestionCount'),
        setPointwiseQuestionCount: createHandler('pointwiseQuestionCount'),
        setDiagramQuestionCount: createHandler('diagramQuestionCount'),
        setMcqMarks: createHandler('mcqMarks'),
        setShortAnswerMarks: createHandler('shortAnswerMarks'),
        setLongAnswerMarks: createHandler('longAnswerMarks'),
        setTrueFalseMarks: createHandler('trueFalseMarks'),
        setFillInTheBlanksMarks: createHandler('fillInTheBlanksMarks'),
        setOneWordAnswerMarks: createHandler('oneWordAnswerMarks'),
        setMatchTheFollowingMarks: createHandler('matchTheFollowingMarks'),
        setMapQuestionMarks: createHandler('mapQuestionMarks'),
        setPointwiseQuestionMarks: createHandler('pointwiseQuestionMarks'),
        setDiagramQuestionMarks: createHandler('diagramQuestionMarks'),
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