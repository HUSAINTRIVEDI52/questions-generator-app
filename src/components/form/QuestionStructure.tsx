import React from 'react';
import type { MarksDistribution, QuestionType } from '../../types';
import { PlusIcon, MinusIcon } from '../common/Icons';

const inputStyles = "w-full p-2 bg-white text-slate-800 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

interface QuestionStructureProps {
    marksDistribution: MarksDistribution[];
    onDistributionChange: (newDistribution: MarksDistribution[]) => void;
    subject: string;
    grade: string;
}

export const QuestionStructure: React.FC<QuestionStructureProps> = ({ marksDistribution, onDistributionChange, subject, grade }) => {

    const availableQuestionTypes = React.useMemo(() => {
        const baseTypes: QuestionType[] = ['MCQ', 'True/False', 'Fill in the Blanks', 'One Word Answer', 'Short Answer', 'Long Answer', 'Match the Following'];
        if (subject && subject.toLowerCase().includes('social science')) {
            baseTypes.push('Graph Question');
        }
        if (subject && subject.toLowerCase().includes('math') && (grade === 'Class 8' || grade === 'Class 9')) {
            baseTypes.push('Diagram Question');
        }
        return baseTypes;
    }, [subject, grade]);


    const handleDistributionChange = (id: string, field: keyof Omit<MarksDistribution, 'id'>, value: string | number) => {
        onDistributionChange(marksDistribution.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const addDistributionRow = () => {
        onDistributionChange([...marksDistribution, { id: crypto.randomUUID(), marks: 1, count: 1, type: 'MCQ' }]);
    };

    const removeDistributionRow = (id: string) => {
        onDistributionChange(marksDistribution.filter(row => row.id !== id));
    };

    return (
        <div className="space-y-2">
            {marksDistribution.map((row) => (
                <div key={row.id} className="grid grid-cols-12 gap-2">
                    <div className="col-span-3">
                        <label className="text-xs font-medium text-slate-500 sr-only">Marks</label>
                        <input type="number" placeholder="Marks" value={row.marks} onChange={e => handleDistributionChange(row.id, 'marks', Number(e.target.value))} min="0" className={`${inputStyles} text-center`} />
                    </div>
                    <div className="col-span-3">
                        <label className="text-xs font-medium text-slate-500 sr-only">Count</label>
                        <input type="number" placeholder="Count" value={row.count} onChange={e => handleDistributionChange(row.id, 'count', Number(e.target.value))} min="0" className={`${inputStyles} text-center`} />
                    </div>
                    <div className="col-span-5">
                        <label className="text-xs font-medium text-slate-500 sr-only">Type</label>
                        <select value={row.type} onChange={e => handleDistributionChange(row.id, 'type', e.target.value as QuestionType)} className={inputStyles}>
                            {availableQuestionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                     <div className="col-span-1 flex items-center justify-center">
                        <button type="button" onClick={() => removeDistributionRow(row.id)} className="flex items-center justify-center h-10 w-10 text-red-500 hover:text-red-700 disabled:text-slate-300 disabled:cursor-not-allowed">
                            <MinusIcon />
                        </button>
                    </div>
                </div>
            ))}
            <button type="button" onClick={addDistributionRow} className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-1.5 rounded-md transition-colors">
                <PlusIcon /> Add Row
            </button>
        </div>
    );
};