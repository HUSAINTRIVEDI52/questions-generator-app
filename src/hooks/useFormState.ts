import { useState, useMemo, useEffect } from 'react';
import type { FormState, MarksDistribution, QuestionType } from '../types';
import { GSEB_CURRICULUM } from '../constants';

const grades = Object.keys(GSEB_CURRICULUM).sort((a, b) => parseInt(b.split(' ')[1]) - parseInt(a.split(' ')[1]));

const initialDistribution: MarksDistribution[] = [
    { id: crypto.randomUUID(), marks: 1, count: 10, type: 'MCQ' },
    { id: crypto.randomUUID(), marks: 2, count: 5, type: 'Short Answer' },
    { id: crypto.randomUUID(), marks: 3, count: 5, type: 'Short Answer' },
    { id: crypto.randomUUID(), marks: 5, count: 3, type: 'Long Answer' },
];

export const useFormState = () => {
  const [institutionName, setInstitutionName] = useState('GSEB Academy');
  const [title, setTitle] = useState('Annual Examination');
  const [grade, setGrade] = useState(grades[0]);
  const [medium, setMedium] = useState('');
  const [subject, setSubject] = useState('');
  const [chapters, setChapters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [marksDistribution, setMarksDistribution] = useState<MarksDistribution[]>(initialDistribution);

  const availableMediums = useMemo(() => Object.keys(GSEB_CURRICULUM[grade] || {}), [grade]);
  const availableSubjects = useMemo(() => Object.keys(GSEB_CURRICULUM[grade]?.[medium] || {}), [grade, medium]);
  const availableChapters = useMemo(() => GSEB_CURRICULUM[grade]?.[medium]?.[subject] || [], [grade, medium, subject]);
  
  const totalMarks = useMemo(() => {
    return marksDistribution.reduce((total, row) => total + (row.marks * row.count), 0);
  }, [marksDistribution]);

  const isChapterSelectionDisabled = chapters.length === 0 || !grade || !medium || !subject;

  useEffect(() => {
    setMedium(availableMediums[0] || '');
  }, [grade, availableMediums]);

  useEffect(() => {
    setSubject(availableSubjects[0] || '');
  }, [medium, availableSubjects]);

  useEffect(() => {
    setChapters([]);
  }, [grade, medium, subject]);

  const formState: Omit<FormState, 'totalMarks'> = {
    institutionName, title, grade, medium, subject, chapters, difficulty, marksDistribution
  };
  
  const formHandlers = {
    setInstitutionName, setTitle, setGrade, setMedium, setSubject, setChapters, setDifficulty, setMarksDistribution
  };

  const derivedState = {
    grades, availableMediums, availableSubjects, availableChapters, totalMarks, isChapterSelectionDisabled
  };

  return {
    formState,
    formHandlers,
    derivedState
  };
};
