import { useState, useMemo, useEffect } from 'react';
import type { FormState, ChapterQuestionConfig } from '../types';
import { GSEB_CURRICULUM } from '../constants';

const grades = Object.keys(GSEB_CURRICULUM).sort((a, b) => parseInt(b.split(' ')[1]) - parseInt(a.split(' ')[1]));

export const useFormState = () => {
  // Common State
  const [institutionName, setInstitutionName] = useState('GSEB Academy');
  const [title, setTitle] = useState('Annual Examination');
  const [grade, setGrade] = useState(grades[0]);
  const [medium, setMedium] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  // FIX: Broadened the type of generationMode to include both 'simple' and 'advanced'. This resolves errors on lines 45 and 48, and a related error in GeneratorForm.tsx.
  const [generationMode, setGenerationMode] = useState<'simple' | 'advanced'>('advanced');

  // State for Simple Mode
  const [chapters, setChapters] = useState<string[]>([]);
  const [totalMarksSimple, setTotalMarksSimple] = useState(50);
  const [mcqCount, setMcqCount] = useState(5);
  const [shortAnswerCount, setShortAnswerCount] = useState(5);
  const [longAnswerCount, setLongAnswerCount] = useState(3);
  const [trueFalseCount, setTrueFalseCount] = useState(0);
  const [fillInTheBlanksCount, setFillInTheBlanksCount] = useState(0);
  const [oneWordAnswerCount, setOneWordAnswerCount] = useState(0);
  const [matchTheFollowingCount, setMatchTheFollowingCount] = useState(0);
  const [graphQuestionCount, setGraphQuestionCount] = useState(0);

  // State for Advanced Mode
  const [chapterConfigs, setChapterConfigs] = useState<ChapterQuestionConfig[]>([]);

  // Derived Values
  const availableMediums = useMemo(() => Object.keys(GSEB_CURRICULUM[grade] || {}), [grade]);
  const availableSubjects = useMemo(() => Object.keys(GSEB_CURRICULUM[grade]?.[medium] || {}), [grade, medium]);
  const availableChapters = useMemo(() => GSEB_CURRICULUM[grade]?.[medium]?.[subject] || [], [grade, medium, subject]);

  const totalMarksAdvanced = useMemo(() => {
    return chapterConfigs.reduce((total, config) => {
      if (!config.enabled) return total;
      const chapterTotal = config.distribution.reduce((subTotal, row) => subTotal + (row.marks * row.count), 0);
      return total + chapterTotal;
    }, 0);
  }, [chapterConfigs]);
  
  const totalMarks = generationMode === 'simple' ? totalMarksSimple : totalMarksAdvanced;
  
  const areAnyChaptersEnabled = useMemo(() => {
      if (generationMode === 'simple') return chapters.length > 0;
      return chapterConfigs.some(c => c.enabled);
  }, [generationMode, chapters, chapterConfigs]);


  // Effects to handle cascading dropdowns and state resets
  useEffect(() => {
    setMedium(availableMediums[0] || '');
  }, [grade, availableMediums]);

  useEffect(() => {
    setSubject(availableSubjects[0] || '');
  }, [medium, availableSubjects]);

  useEffect(() => {
    // Reset selections and configs when subject changes
    setChapters([]);
    const newConfigs = availableChapters.map(chapter => ({
      chapter,
      enabled: false,
      distribution: [{ id: crypto.randomUUID(), marks: 1, count: 0, type: 'MCQ' as const }]
    }));
    setChapterConfigs(newConfigs);
  }, [subject, availableChapters]); // Dependency on `subject` is key here

  const formState: FormState = {
    institutionName, title, grade, medium, subject, difficulty, generationMode,
    totalMarks,
    chapters, mcqCount, shortAnswerCount, longAnswerCount,
    trueFalseCount, fillInTheBlanksCount, oneWordAnswerCount,
    matchTheFollowingCount, graphQuestionCount,
    chapterConfigs,
  };
  
  const formHandlers = {
    setInstitutionName, setTitle, setGrade, setMedium, setSubject, setDifficulty, setGenerationMode,
    setChapters, setTotalMarksSimple, setMcqCount, setShortAnswerCount, setLongAnswerCount,
    setTrueFalseCount, setFillInTheBlanksCount, setOneWordAnswerCount,
    setMatchTheFollowingCount, setGraphQuestionCount,
    setChapterConfigs,
  };

  const derivedState = {
    grades, availableMediums, availableSubjects, availableChapters, areAnyChaptersEnabled, totalMarks
  };

  return {
    formState,
    formHandlers,
    derivedState
  };
};