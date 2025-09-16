import { useState, useMemo, useEffect } from 'react';
import type { FormState, ChapterQuestionConfig, MarksDistribution } from '../types';
import { GSEB_CURRICULUM } from '../constants';

const grades = Object.keys(GSEB_CURRICULUM).sort((a, b) => parseInt(b.split(' ')[1]) - parseInt(a.split(' ')[1]));

export const useFormState = () => {
  const [institutionName, setInstitutionName] = useState('GSEB Academy');
  const [title, setTitle] = useState('Annual Examination');
  const [grade, setGrade] = useState(grades[0]);
  const [medium, setMedium] = useState('');
  const [subject, setSubject] = useState('');
  const [chapterConfigs, setChapterConfigs] = useState<ChapterQuestionConfig[]>([]);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  
  const availableMediums = useMemo(() => Object.keys(GSEB_CURRICULUM[grade] || {}), [grade]);
  const availableSubjects = useMemo(() => Object.keys(GSEB_CURRICULUM[grade]?.[medium] || {}), [grade, medium]);
  const availableChapters = useMemo(() => GSEB_CURRICULUM[grade]?.[medium]?.[subject] || [], [grade, medium, subject]);
  
  const totalMarks = useMemo(() => {
    return chapterConfigs.reduce((total, config) => {
      if (!config.enabled) return total;
      const chapterTotal = config.distribution.reduce((subTotal, row) => subTotal + (row.marks * row.count), 0);
      return total + chapterTotal;
    }, 0);
  }, [chapterConfigs]);

  const areAnyChaptersEnabled = useMemo(() => chapterConfigs.some(c => c.enabled), [chapterConfigs]);

  useEffect(() => {
    setMedium(availableMediums[0] || '');
  }, [grade, availableMediums]);

  useEffect(() => {
    setSubject(availableSubjects[0] || '');
  }, [medium, availableSubjects]);

  useEffect(() => {
    const newConfigs = availableChapters.map(chapter => ({
      chapter,
      enabled: false,
      distribution: [{ id: crypto.randomUUID(), marks: 1, count: 0, type: 'MCQ' as const }]
    }));
    setChapterConfigs(newConfigs);
  }, [grade, medium, subject, availableChapters]);

  const formState: Omit<FormState, 'totalMarks' | 'chapters'> = {
    institutionName, title, grade, medium, subject, chapterConfigs, difficulty
  };
  
  const formHandlers = {
    setInstitutionName, setTitle, setGrade, setMedium, setSubject, setChapterConfigs, setDifficulty
  };

  const derivedState = {
    grades, availableMediums, availableSubjects, totalMarks, areAnyChaptersEnabled
  };

  return {
    formState,
    formHandlers,
    derivedState
  };
};