import React from 'react';
import type { QuestionPaper } from '../../types';

interface PaperContentProps {
    paper: QuestionPaper;
    showAnswers: boolean;
}

export const PaperContent: React.FC<PaperContentProps> = ({ paper, showAnswers }) => {
    return (
        <div className="p-6 md:p-10" id="printable-paper">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold">{paper.institution_name}</h1>
                <h2 className="text-xl font-semibold text-slate-700 mt-1">{paper.title}</h2>
                <h3 className="text-lg font-medium text-slate-600">{paper.grade} - {paper.subject}</h3>
                <div className="flex justify-between items-center mt-4 text-sm max-w-lg mx-auto border-t border-b py-2">
                    <span><strong>Total Marks:</strong> {paper.total_marks}</span>
                    <span><strong>Duration:</strong> {paper.duration_minutes} minutes</span>
                </div>
            </header>

            {paper.sections.map((section, sectionIndex) => (
                <section key={sectionIndex} className="mb-8">
                    <h3 className="text-lg font-bold border-b-2 border-slate-400 pb-2 mb-4">{section.section_title}</h3>
                    <ol className="list-decimal list-inside space-y-6">
                        {section.questions.map((q, qIndex) => (
                            <li key={qIndex} className="break-words">
                                <div className="flex justify-between items-start">
                                    <p className="font-medium text-slate-800 pr-4">{q.question_text}</p>
                                    <span className="text-sm font-semibold ml-4 whitespace-nowrap">[{q.marks} Marks]</span>
                                </div>

                                {q.options && (
                                    <ul className="list-none pl-6 mt-2 space-y-1">
                                        {q.options.map((option, optIndex) => (
                                            <li key={optIndex} className={`text-slate-700 flex items-start ${showAnswers && option === q.correct_answer ? 'font-bold text-green-700' : ''}`}>
                                                <span className="mr-2">{String.fromCharCode(97 + optIndex)})</span>
                                                <span>{option}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {q.match_a && q.match_b && (
                                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 pl-6">
                                        <div>
                                            <h4 className="font-semibold mb-2 border-b">Column A</h4>
                                            <ol className="list-decimal list-inside space-y-1">
                                                {q.match_a.map((item, idx) => <li key={idx} className="pl-2">{item}</li>)}
                                            </ol>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2 border-b">Column B</h4>
                                            <ol className="list-[lower-alpha] list-inside space-y-1">
                                                {q.match_b.map((item, idx) => <li key={idx} className="pl-2">{item}</li>)}
                                            </ol>
                                        </div>
                                    </div>
                                )}
                                {showAnswers && (
                                    <div className="mt-3 ml-6 p-2 bg-green-50 border border-green-200 rounded-md printable-answer">
                                        <p className="text-sm font-semibold text-green-800">
                                            Correct Answer: <span className="font-normal">{q.correct_answer}</span>
                                        </p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ol>
                </section>
            ))}
        </div>
    );
};