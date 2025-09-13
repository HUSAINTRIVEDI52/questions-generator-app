import React, { useState } from 'react';
import type { QuestionPaper } from '../types';
import { jsPDF } from "jspdf";

// Icons
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18.24-5.48-5.48-1.5-1.5-2.25-2.25-1.5-1.5-5.48-5.48a.5.5 0 0 0-.71 0l-1.5 1.5a.5.5 0 0 0 0 .71l5.48 5.48 1.5 1.5 2.25 2.25 1.5 1.5 5.48 5.48a.5.5 0 0 0 .71 0l1.5-1.5a.5.5 0 0 0 0-.71z" /><path d="m2 22 5.5-5.5" /></svg>;
const DocxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="M12 12.5a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-5 0V15a2.5 2.5 0 0 0-5 0v5a2.5 2.5 0 0 0 5 0v-2.5"/></svg>;
const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="M2 12.5a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-5 0V15a2.5 2.5 0 0 0-5 0v5a2.5 2.5 0 0 0 5 0v-2.5"/></svg>;
const NewPaperIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>;

interface QuestionPaperDisplayProps {
  paper: QuestionPaper;
  onNewPaper?: () => void;
}

export const QuestionPaperDisplay: React.FC<QuestionPaperDisplayProps> = ({ paper, onNewPaper }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [includeAnswersExport, setIncludeAnswersExport] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const getPaperAsText = (includeAnswers: boolean): string => {
    let text = `${paper.institution_name}\n`;
    text += `${paper.title}\n`;
    text += `${paper.grade} - ${paper.subject}\n`;
    text += `Total Marks: ${paper.total_marks}\tDuration: ${paper.duration_minutes} minutes\n`;
    text += `--------------------------------------------------\n\n`;

    paper.sections.forEach(section => {
      text += `${section.section_title}\n\n`;
      section.questions.forEach((q, qIndex) => {
        text += `${qIndex + 1}. ${q.question_text} [${q.marks} Marks]\n`;
        if (q.options) {
          q.options.forEach((opt, optIndex) => {
            text += `   ${String.fromCharCode(97 + optIndex)}) ${opt}\n`;
          });
        }
        if (includeAnswers) {
          text += `   Answer: ${q.correct_answer}\n`;
        }
        text += '\n';
      });
    });
    return text;
  };

  const handleCopyToClipboard = () => {
    const textToCopy = getPaperAsText(includeAnswersExport);
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };
  
  const handleShare = async () => {
    const shareData = {
      title: 'AI Question Paper Generator',
      text: 'Check out this question paper generator for the GSEB curriculum!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for desktop
        alert("Share functionality is typically available on mobile devices. You can copy the link from the address bar.");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handlePdfExport = () => {
    const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4"
    });

    const pageMargin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (pageMargin * 2);
    let yPos = pageMargin;

    const addHeader = () => {
        doc.setFontSize(18).setFont("helvetica", "bold");
        doc.text(paper.institution_name, pageWidth / 2, yPos, { align: "center" });
        yPos += 8;

        doc.setFontSize(14).setFont("helvetica", "normal");
        doc.text(paper.title, pageWidth / 2, yPos, { align: "center" });
        yPos += 6;

        doc.setFontSize(12);
        doc.text(`${paper.grade} - ${paper.subject}`, pageWidth / 2, yPos, { align: "center" });
        yPos += 8;

        doc.setLineWidth(0.2);
        doc.line(pageMargin, yPos, pageWidth - pageMargin, yPos);
        yPos += 6;
        
        const marksText = `Total Marks: ${paper.total_marks}`;
        const durationText = `Duration: ${paper.duration_minutes} minutes`;
        doc.setFontSize(10).setFont("helvetica", "bold");
        doc.text(marksText, pageMargin, yPos);
        doc.text(durationText, pageWidth - pageMargin, yPos, { align: "right" });
        yPos += 4;

        doc.line(pageMargin, yPos, pageWidth - pageMargin, yPos);
        yPos += 10;
    }

    const checkNewPage = (requiredHeight: number) => {
        if (yPos + requiredHeight > pageHeight - pageMargin) {
            doc.addPage();
            yPos = pageMargin;
        }
    }
    
    addHeader();

    paper.sections.forEach(section => {
        checkNewPage(10);
        doc.setFontSize(12).setFont("helvetica", "bold");
        doc.text(section.section_title, pageMargin, yPos);
        yPos += 8;

        section.questions.forEach((q, qIndex) => {
            const questionText = `${qIndex + 1}. ${q.question_text}`;
            const questionLines = doc.splitTextToSize(questionText, contentWidth - 10); // Indent
            const marksText = `[${q.marks} Marks]`;
            
            checkNewPage(questionLines.length * 5 + 10);
            
            doc.setFontSize(11).setFont("helvetica", "normal");
            doc.text(questionLines, pageMargin + 5, yPos);
            doc.setFont("helvetica", "bold");
            doc.text(marksText, pageWidth - pageMargin, yPos, {align: "right"});
            yPos += questionLines.length * 5;

            if(q.options) {
                q.options.forEach((opt, optIndex) => {
                    const optionText = `${String.fromCharCode(97 + optIndex)}) ${opt}`;
                    const optionLines = doc.splitTextToSize(optionText, contentWidth - 15);
                    checkNewPage(optionLines.length * 5);
                    doc.setFont("helvetica", "normal");
                    doc.text(optionLines, pageMargin + 10, yPos);
                    yPos += optionLines.length * 5;
                });
            }

            if(includeAnswersExport) {
                const answerText = `Answer: ${q.correct_answer}`;
                const answerLines = doc.splitTextToSize(answerText, contentWidth - 15);
                checkNewPage(answerLines.length * 5 + 5);
                doc.setFont("helvetica", "bold");
                doc.setTextColor("#16a34a"); // Green color
                doc.text(answerLines, pageMargin + 10, yPos);
                doc.setTextColor("#000000"); // Reset color
                yPos += answerLines.length * 5 + 5; // Extra space after answer
            } else {
                 yPos += 5;
            }
        });
    });

    doc.save(`${paper.subject}_${paper.grade}_Paper.pdf`);
  };

  const handleDocxExport = async () => {
    // Dynamically import docx to avoid making it a hard dependency
    const docx = await import('docx');
    const { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

    const createQuestions = (includeAns: boolean) => paper.sections.flatMap((section) => {
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
            
            if (includeAns) {
                questionParts.push(new Paragraph({
                     children: [
                         new TextRun({ text: `Answer: ${q.correct_answer}`, bold: true, color: "16a34a" }),
                     ],
                     spacing: { after: 200 },
                }));
            }
            return questionParts;
        });

        return [
            new Paragraph({
                text: section.section_title,
                heading: HeadingLevel.HEADING_2,
                // FIX: The 'docx' library uses 'style' for border styles, not 'value'.
                border: { bottom: { color: "auto", space: 1, style: "single", size: 6 } },
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
                new Paragraph({ text: `${paper.grade} - ${paper.subject}`, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
                new Paragraph({
                    children: [
                        new TextRun(`Total Marks: ${paper.total_marks}`),
                        new TextRun({ text: `\tDuration: ${paper.duration_minutes} minutes` }),
                    ],
                    alignment: AlignmentType.BOTH,
                    // FIX: The 'docx' library uses 'style' for border styles, not 'value'.
                    border: { top: { size: 4, style: "single" }, bottom: { size: 4, style: "single" } },
                    spacing: { before: 200, after: 400 },
                }),
                ...createQuestions(includeAnswersExport)
            ],
        }],
    });

    Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${paper.subject}_${paper.grade}_Paper.docx`;
        a.click();
        window.URL.revokeObjectURL(url);
    });
  };

  const ActionButton: React.FC<React.PropsWithChildren<{ onClick: () => void; className?: string }>> = ({ onClick, className, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 active:scale-95 ${className}`}
    >
        {children}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 print-container animate-fade-in-up">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 no-print">
            <h2 className="text-xl font-bold text-slate-700">Generated Paper</h2>
            <div className="flex items-center gap-2 flex-wrap">
                <ActionButton onClick={handleShare} className="bg-blue-600 text-white hover:bg-blue-700">
                  <ShareIcon /> Share
                </ActionButton>
                {onNewPaper && (
                    <ActionButton onClick={onNewPaper} className="lg:hidden bg-slate-100 text-slate-600 hover:bg-slate-200">
                        <NewPaperIcon /> New Paper
                    </ActionButton>
                )}
                <ActionButton onClick={() => setShowAnswers(!showAnswers)} className={showAnswers ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}>
                    <KeyIcon /> {showAnswers ? 'Hide Answers' : 'Show Answers'}
                </ActionButton>
            </div>
        </div>
        
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4 no-print">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                    <ActionButton onClick={handlePdfExport} className="w-full justify-center bg-red-500 text-white hover:bg-red-600"><PdfIcon /> Download PDF</ActionButton>
                    <ActionButton onClick={handleDocxExport} className="w-full justify-center bg-blue-500 text-white hover:bg-blue-600"><DocxIcon /> Export DOCX</ActionButton>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                     <ActionButton onClick={handleCopyToClipboard} className="w-full justify-center bg-slate-600 text-white hover:bg-slate-700">
                        <CopyIcon /> {copyStatus === 'idle' ? 'Copy Content' : 'Copied!'}
                     </ActionButton>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                    <input id="include-answers" type="checkbox" checked={includeAnswersExport} onChange={(e) => setIncludeAnswersExport(e.target.checked)} className="h-5 w-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                    <label htmlFor="include-answers" className="text-sm text-slate-700 font-medium select-none">Include Answers in Export/Copy</label>
                </div>
            </div>
        </div>
      
        <div className="p-6 md:p-10" id="printable-paper">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold" style={{color: 'var(--color-text-main)'}}>{paper.institution_name}</h1>
                <h2 className="text-xl font-semibold mt-1" style={{color: 'var(--color-text-main)'}}>{paper.title}</h2>
                <h3 className="text-lg font-medium" style={{color: 'var(--color-text-muted)'}}>{paper.grade} - {paper.subject}</h3>
                <div className="flex justify-between items-center mt-4 text-sm max-w-lg mx-auto border-t border-b py-2" style={{borderColor: 'var(--color-border)'}}>
                    <span className="font-semibold">Total Marks: {paper.total_marks}</span>
                    <span className="font-semibold">Duration: {paper.duration_minutes} minutes</span>
                </div>
            </header>

            {paper.sections.map((section, sectionIndex) => (
                <section key={sectionIndex} className="mb-8">
                    <h3 className="text-lg font-bold border-b-2 pb-2 mb-4" style={{borderColor: 'var(--color-text-main)'}}>{section.section_title}</h3>
                    <ol className="list-decimal list-inside space-y-6">
                        {section.questions.map((q, qIndex) => (
                            <li key={qIndex} className="break-words">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold pr-4" style={{color: 'var(--color-text-main)'}}>{q.question_text}</p>
                                    <span className="text-sm font-semibold ml-4 whitespace-nowrap">[{q.marks} Marks]</span>
                                </div>

                                {q.options && (
                                <ul className="list-none pl-6 mt-2 space-y-1">
                                    {q.options.map((option, optIndex) => (
                                        <li key={optIndex} className={`flex items-start ${showAnswers && option === q.correct_answer ? 'font-bold text-green-700' : ''}`} style={{color: 'var(--color-text-muted)'}}>
                                            <span className="mr-2">{String.fromCharCode(97 + optIndex)})</span>
                                            <span>{option}</span>
                                        </li>
                                    ))}
                                </ul>
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
    </div>
  );
};