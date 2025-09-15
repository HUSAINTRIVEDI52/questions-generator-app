import React from 'react';
import type { QuestionPaper } from '../../types';
import { exportToDocx } from '../../services/exportService';
import { KeyIcon, DocxIcon, PrintIcon, CreateIcon } from '../common/Icons';

interface PaperActionsProps {
    paper: QuestionPaper;
    onNewPaper: () => void;
    showAnswers: boolean;
    onToggleAnswers: () => void;
}

export const PaperActions: React.FC<PaperActionsProps> = ({ paper, onNewPaper, showAnswers, onToggleAnswers }) => {

    const handlePrint = () => {
        const printable = document.querySelector('.print-area');
        if (!printable) return;

        // Temporarily add a class to the container if we want to print answers
        if (showAnswers) {
            printable.classList.add('print-with-answers');
        }

        window.print();

        // Clean up the class after printing
        if (showAnswers) {
            printable.classList.remove('print-with-answers');
        }
    };

    return (
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
            <h2 className="text-xl font-bold text-slate-700">Generated Paper</h2>
            <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                    onClick={onNewPaper}
                    className="flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <CreateIcon />
                    New Paper
                </button>
                <button
                    onClick={onToggleAnswers}
                    className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${showAnswers ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    aria-pressed={showAnswers}
                >
                    <KeyIcon />
                    {showAnswers ? 'Hide Answers' : 'Show Answers'}
                </button>
                <button
                    onClick={() => exportToDocx(paper)}
                    className="flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <DocxIcon />
                    Export DOCX
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    <PrintIcon />
                    Print / PDF
                </button>
            </div>
        </div>
    );
};
