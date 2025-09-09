import React, { useState } from 'react';
import type { QuestionPaper } from '../types';

// This tells TypeScript that the 'docx' object is available globally,
// loaded from the script tag in index.html.
declare var docx: any;

const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
);

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18.24-5.48-5.48-1.5-1.5-2.25-2.25-1.5-1.5-5.48-5.48a.5.5 0 0 0-.71 0l-1.5 1.5a.5.5 0 0 0 0 .71l5.48 5.48 1.5 1.5 2.25 2.25 1.5 1.5 5.48 5.48a.5.5 0 0 0 .71 0l1.5-1.5a.5.5 0 0 0 0-.71z" /><path d="m2 22 5.5-5.5" /></svg>
);

const DocxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="M12 12.5a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-5 0V15a2.5 2.5 0 0 0-5 0v5a2.5 2.5 0 0 0 5 0v-2.5"/></svg>
);

// FIX: Define the QuestionPaperDisplayProps interface for the component props.
interface QuestionPaperDisplayProps {
  paper: QuestionPaper;
}

export const QuestionPaperDisplay: React.FC<QuestionPaperDisplayProps> = ({ paper }) => {
  const [showAnswers, setShowAnswers] = useState(false);

  const handlePrint = () => {
    window.print();
  };
  
  const handleDocxExport = () => {
    const { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

    const sections = paper.sections.flatMap((section, sectionIndex) => {
        const questions = section.questions.map((q, qIndex) => {
            const questionParts = [
                new Paragraph({
                    children: [
                        new TextRun({ text: `${qIndex + 1}. `, bold: true }),
                        new TextRun(q.question_text),
                        new TextRun({ text: ` [${q.marks} Marks]`, bold: true, italics: true }),
                    ],
                    spacing: { after: 100 },
                })
            ];

            if (q.options) {
                q.options.forEach((option, optIndex) => {
                    questionParts.push(new Paragraph({
                        children: [new TextRun(`\t${String.fromCharCode(97 + optIndex)}) ${option}`)],
                        spacing: { after: 50 },
                    }));
                });
            }
            
            questionParts.push(new Paragraph({
                 children: [
                     new TextRun({ text: `Answer: ${q.correct_answer}`, bold: true, color: "4CAF50" }),
                 ],
                 spacing: { after: 200 },
            }));

            return questionParts;
        });

        return [
            new Paragraph({
                text: section.section_title,
                heading: HeadingLevel.HEADING_2,
                style: "wellSpaced",
                border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } },
                spacing: { after: 200 }
            }),
            ...questions.flat()
        ];
    });

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({ text: paper.institution_name, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: paper.title, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: `${paper.grade} - ${paper.subject}`, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER }),
                new Paragraph({
                    children: [
                        new TextRun(`Total Marks: ${paper.total_marks}`),
                        new TextRun({ text: `\tDuration: ${paper.duration_minutes} minutes`, break: 1 }),
                    ],
                    alignment: AlignmentType.CENTER,
                    border: { top: { size: 4, value: "single" }, bottom: { size: 4, value: "single" } },
                    spacing: { before: 200, after: 400 },
                }),
                ...sections
            ],
        }],
    });

    Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${paper.subject}_${paper.grade}_Question_Paper.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 print-container">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center no-print">
            <h2 className="text-xl font-bold text-slate-700">Generated Paper</h2>
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => setShowAnswers(!showAnswers)}
                    className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${showAnswers ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    aria-pressed={showAnswers}
                    >
                    <KeyIcon />
                    {showAnswers ? 'Hide Answers' : 'Show Answers'}
                </button>
                <button
                    onClick={handleDocxExport}
                    className="flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <DocxIcon />
                    Export as DOCX
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
                                {showAnswers && (
                                    <div className="mt-3 ml-6 p-2 bg-green-50 border border-green-200 rounded-md">
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
    </div>
  );
};