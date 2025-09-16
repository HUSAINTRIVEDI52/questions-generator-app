import React from 'react';
import type { MarksDistribution, QuestionType } from '../../types';
import { PlusIcon, MinusIcon } from '../common/Icons';

const inputStyles = "w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

interface QuestionStructureProps {
    marksDistribution: MarksDistribution[];
    onDistributionChange: React.Dispatch<React.SetStateAction<MarksDistribution[]>>;
    totalMarks: number;
    subject: string;
}

export const QuestionStructure: React.FC<QuestionStructureProps> = ({ marksDistribution, onDistributionChange, totalMarks, subject }) => {

    const availableQuestionTypes = React.useMemo(() => {
        const baseTypes: QuestionType[] = ['MCQ', 'True/False', 'Fill in the Blanks', 'One Word Answer', 'Short Answer', 'Long Answer', 'Match the Following'];
        if (subject && subject.toLowerCase().includes('social science')) {
            return [...baseTypes, 'Graph Question'];
        }
        return baseTypes;
    }, [subject]);


    const handleDistributionChange = (id: string, field: keyof Omit<MarksDistribution, 'id'>, value: string | number) => {
        onDistributionChange(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const addDistributionRow = () => {
        onDistributionChange(prev => [...prev, { id: crypto.randomUUID(), marks: 1, count: 5, type: 'MCQ' }]);
    };

    const removeDistributionRow = (id: string) => {
        onDistributionChange(prev => prev.filter(row => row.id !== id));
    };

    return (
        <>
            <div className="flex justify-between items-center mb-2">
                <p className="block text-sm font-semibold text-slate-600">Question Distribution</p>
                <p className="text-sm font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded-md">Total: {totalMarks}</p>
            </div>
            <div className="space-y-3">
                {marksDistribution.map((row) => (
                    <div key={row.id} className="grid grid-cols-12 gap-2 p-2 border border-slate-200 rounded-md bg-slate-50/50">
                        <div className="col-span-12 sm:col-span-3">
                            <label className="text-xs font-medium text-slate-500">Marks</label>
                            <input type="number" value={row.marks} onChange={e => handleDistributionChange(row.id, 'marks', Number(e.target.value))} min="1" className={`${inputStyles} text-center`} />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                            <label className="text-xs font-medium text-slate-500">Count</label>
                            <input type="number" value={row.count} onChange={e => handleDistributionChange(row.id, 'count', Number(e.target.value))} min="0" className={`${inputStyles} text-center`} />
                        </div>
                        <div className="col-span-10 sm:col-span-5">
                            <label className="text-xs font-medium text-slate-500">Type</label>
                            <select value={row.type} onChange={e => handleDistributionChange(row.id, 'type', e.target.value)} className={inputStyles}>
                                {availableQuestionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                         <div className="col-span-2 sm:col-span-1 flex items-end justify-center">
                            <button type="button" onClick={() => removeDistributionRow(row.id)} disabled={marksDistribution.length <= 1} className="flex items-center justify-center h-10 w-10 text-red-500 hover:text-red-700 disabled:text-slate-300 disabled:cursor-not-allowed">
                                <MinusIcon />
                            </button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addDistributionRow} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-2 rounded-md transition-colors">
                    <PlusIcon /> Add Question Type
                </button>
            </div>
        </>
    );
};