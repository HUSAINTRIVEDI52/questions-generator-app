
import React, { useState, useEffect, useMemo } from 'react';
import type { FormState, MarksDistribution, QuestionType } from '../types';
import { GSEB_CURRICULUM } from '../constants';

interface GeneratorFormProps {
  onGenerate: (formData: FormState) => void;
  isLoading: boolean;
}

const grades = Object.keys(GSEB_CURRICULUM).sort((a, b) => parseInt(b.split(' ')[1]) - parseInt(a.split(' ')[1]));

const questionTypes: QuestionType[] = ['MCQ', 'True/False', 'Fill in the Blanks', 'Short Answer', 'Long Answer'];

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>;


export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isLoading }) => {
  // State for form inputs
  const [institutionName, setInstitutionName] = useState<string>('GSEB Academy');
  const [grade, setGrade] = useState<string>(grades[0]);
  const [medium, setMedium] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  
  const [marksDistribution, setMarksDistribution] = useState<MarksDistribution[]>([
    { id: crypto.randomUUID(), marks: 1, count: 10, type: 'MCQ' },
    { id: crypto.randomUUID(), marks: 2, count: 5, type: 'Short Answer' },
    { id: crypto.randomUUID(), marks: 3, count: 5, type: 'Short Answer' },
    { id: crypto.randomUUID(), marks: 5, count: 3, type: 'Long Answer' },
  ]);

  const totalMarks = useMemo(() => {
    return marksDistribution.reduce((total, row) => total + (row.marks * row.count), 0);
  }, [marksDistribution]);


  // Memoized derived values for cascading dropdowns
  const availableMediums = useMemo(() => grade ? Object.keys(GSEB_CURRICULUM[grade] || {}) : [], [grade]);
  const availableSubjects = useMemo(() => grade && medium ? Object.keys(GSEB_CURRICULUM[grade]?.[medium] || {}) : [], [grade, medium]);
  const availableChapters = useMemo(() => grade && medium && subject ? GSEB_CURRICULUM[grade]?.[medium]?.[subject] || [] : [], [grade, medium, subject]);

  // Effect to reset dependent fields on change
  useEffect(() => {
    if (availableMediums.length > 0) {
      setMedium(availableMediums[0]);
    } else {
      setMedium('');
    }
  }, [grade, availableMediums]);

  useEffect(() => {
    if (availableSubjects.length > 0) {
      setSubject(availableSubjects[0]);
    } else {
      setSubject('');
    }
  }, [medium, availableSubjects]);
  
  useEffect(() => {
    setSelectedChapters([]);
    setSelectAll(false);
  }, [grade, medium, subject]);

  const handleChapterToggle = (chapter: string) => {
    const newSelection = selectedChapters.includes(chapter) 
      ? selectedChapters.filter(c => c !== chapter)
      : [...selectedChapters, chapter];
    setSelectedChapters(newSelection);
    setSelectAll(newSelection.length === availableChapters.length && availableChapters.length > 0);
  };
  
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSelectedChapters(newSelectAll ? [...availableChapters] : []);
  }

  const handleDistributionChange = (id: string, field: keyof Omit<MarksDistribution, 'id'>, value: string | number) => {
    setMarksDistribution(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const addDistributionRow = () => {
    setMarksDistribution(prev => [...prev, { id: crypto.randomUUID(), marks: 1, count: 5, type: 'MCQ' }]);
  };

  const removeDistributionRow = (id: string) => {
    setMarksDistribution(prev => prev.filter(row => row.id !== id));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChapters.length === 0) {
      alert("Please select at least one chapter.");
      return;
    }
    if (totalMarks <= 0) {
      alert("Total marks must be greater than 0. Please add some questions.");
      return;
    }
    onGenerate({
      institutionName,
      grade,
      medium,
      subject,
      chapters: selectedChapters,
      difficulty,
      marksDistribution,
      totalMarks
    });
  };

  const isSubmitDisabled = isLoading || selectedChapters.length === 0 || !grade || !medium || !subject || totalMarks === 0;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
      <h2 className="text-xl font-bold text-slate-700 border-b border-slate-200 pb-3">Paper Configuration</h2>
      
      <div className='space-y-4'>
        {/* Institution Name */}
        <div>
          <label htmlFor="institutionName" className="block text-sm font-semibold text-slate-600 mb-1">Institution Name</label>
          <input type="text" id="institutionName" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
        </div>

        {/* Grade */}
        <div>
          <label htmlFor="grade" className="block text-sm font-semibold text-slate-600 mb-1">Grade</label>
          <select id="grade" value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Medium */}
        <div>
          <label htmlFor="medium" className="block text-sm font-semibold text-slate-600 mb-1">Medium</label>
          <select id="medium" value={medium} onChange={e => setMedium(e.target.value)} disabled={!grade} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-slate-100 disabled:text-slate-500">
            <option value="">Select Medium</option>
            {availableMediums.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-slate-600 mb-1">Subject</label>
          <select id="subject" value={subject} onChange={e => setSubject(e.target.value)} disabled={!medium} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-slate-100 disabled:text-slate-500">
            <option value="">Select Subject</option>
            {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      
      {/* Chapters */}
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-2">Chapters</label>
        <div className="border border-slate-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
          <div className="flex items-center border-b border-slate-200 p-2 space-x-2 bg-slate-50 rounded-t-md">
              <input id="select-all" type="checkbox" checked={selectAll} onChange={handleSelectAll} disabled={availableChapters.length === 0} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
              <label htmlFor="select-all" className="text-sm text-slate-700 font-medium select-none">Select All Chapters</label>
          </div>
          <div className="max-h-80 overflow-y-auto p-2 bg-slate-50/50">
            {availableChapters.length > 0 ? availableChapters.map(chapter => (
              <div key={chapter} className="flex items-center py-1.5 px-1 rounded-md hover:bg-slate-100">
                <input id={chapter} type="checkbox" checked={selectedChapters.includes(chapter)} onChange={() => handleChapterToggle(chapter)} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                <label htmlFor={chapter} className="ml-2.5 text-sm text-slate-700 select-none cursor-pointer w-full">{chapter}</label>
              </div>
            )) : <p className="text-sm text-slate-400 text-center py-4">Please select a subject to see chapters.</p>}
          </div>
        </div>
      </div>

      {/* Difficulty */}
      <div>
          <label htmlFor="difficulty" className="block text-sm font-semibold text-slate-600 mb-1">Difficulty</label>
          <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
      
      {/* Question Distribution */}
      <div>
        <div className="flex justify-between items-center mb-2">
            <p className="block text-sm font-semibold text-slate-600">Question Distribution</p>
            <p className="text-sm font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded-md">Total Marks: {totalMarks}</p>
        </div>
        <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 px-2">
                <div className="col-span-3">Marks</div>
                <div className="col-span-3">Count</div>
                <div className="col-span-5">Type</div>
            </div>
            {marksDistribution.map((row, index) => (
                <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                    <input type="number" value={row.marks} onChange={e => handleDistributionChange(row.id, 'marks', Number(e.target.value))} min="1" className="col-span-3 w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    <input type="number" value={row.count} onChange={e => handleDistributionChange(row.id, 'count', Number(e.target.value))} min="0" className="col-span-3 w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    <select value={row.type} onChange={e => handleDistributionChange(row.id, 'type', e.target.value)} className="col-span-5 w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                        {questionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <button type="button" onClick={() => removeDistributionRow(row.id)} disabled={marksDistribution.length <= 1} className="col-span-1 flex items-center justify-center h-full text-red-500 hover:text-red-700 disabled:text-slate-300 disabled:cursor-not-allowed">
                        <MinusIcon />
                    </button>
                </div>
            ))}
            <button type="button" onClick={addDistributionRow} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-2 rounded-md transition-colors">
                <PlusIcon /> Add Question Type
            </button>
        </div>
      </div>

      <button type="submit" disabled={isSubmitDisabled} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50">
        {isLoading ? (
          <>
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
            Generating...
          </>
        ) : 'Generate Paper'}
      </button>
    </form>
  );
};
