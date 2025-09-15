import React, { useState } from 'react';
import type { QuestionPaper } from '../types';
import { reviewQuestionPaper } from '../services/geminiService';

// This tells TypeScript that the 'jspdf' object is available globally,
// loaded from the script tag in index.html.
declare var jspdf: any;

const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
);

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18.24-5.48-5.48-1.5-1.5-2.25-2.25-1.5-1.5-5.48-5.48a.5.5 0 0 0-.71 0l-1.5 1.5a.5.5 0 0 0 0 .71l5.48 5.48 1.5 1.5 2.25 2.25 1.5 1.5 5.48 5.48a.5.5 0 0 0 .71 0l1.5-1.5a.5.5 0 0 0 0-.71z" /><path d="m2 22 5.5-5.5" /></svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
);

const NewPaperIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
);

const ReviewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

interface QuestionPaperDisplayProps {
  paper: QuestionPaper;
  onNewPaper: () => void;
}

export const QuestionPaperDisplay: React.FC<QuestionPaperDisplayProps> = ({ paper, onNewPaper }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [includeAnswersInExport, setIncludeAnswersInExport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // State for AI Review Modal
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewPrompt, setReviewPrompt] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
        setToastMessage(null);
    }, 5000);
  };

  const handlePrint = () => {
    const paperElement = document.querySelector('.print-area');
    if (!paperElement) return;

    if (includeAnswersInExport) {
        paperElement.classList.add('print-with-answers');
    }

    window.print();

    // Use a timeout to ensure the class is removed after the print dialog has closed
    setTimeout(() => {
        if (includeAnswersInExport) {
            paperElement.classList.remove('print-with-answers');
        }
    }, 1000);
  };

  const generatePdfBlob = async (): Promise<Blob> => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    let yPos = 15;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const maxWidth = doc.internal.pageSize.width - margin * 2;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }
    };

    doc.setFontSize(18).setFont('helvetica', 'bold');
    doc.text(paper.institution_name, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    yPos += 8;

    doc.setFontSize(14).setFont('helvetica', 'normal');
    doc.text(paper.title, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    yPos += 6;

    doc.setFontSize(12);
    doc.text(`${paper.grade} - ${paper.subject}`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(10);
    doc.text(`Total Marks: ${paper.total_marks}`, margin, yPos);
    doc.text(`Duration: ${paper.duration_minutes} minutes`, doc.internal.pageSize.width - margin, yPos, { align: 'right' });
    yPos += 10;
    doc.setLineWidth(0.5).line(margin, yPos - 7, doc.internal.pageSize.width - margin, yPos - 7);

    for (const section of paper.sections) {
        checkPageBreak(12);
        doc.setFontSize(14).setFont('helvetica', 'bold');
        doc.text(section.section_title, margin, yPos);
        yPos += 2;
        doc.setLineWidth(0.2).line(margin, yPos, margin + 50, yPos);
        yPos += 8;

        for (const [qIndex, q] of section.questions.entries()) {
            const questionText = `${qIndex + 1}. ${q.question_text}`;
            const marksText = `[${q.marks} Marks]`;
            
            const questionLines = doc.splitTextToSize(questionText, maxWidth - 20);
            const questionHeight = questionLines.length * 5;
            checkPageBreak(questionHeight + 5);

            doc.setFontSize(11).setFont('helvetica', 'normal');
            doc.text(questionLines, margin, yPos, { maxWidth: maxWidth - 15 });
            doc.setFont('helvetica', 'bold');
            doc.text(marksText, doc.internal.pageSize.width - margin, yPos, { align: 'right' });
            yPos += questionHeight;

            if (q.options) {
                doc.setFont('helvetica', 'normal');
                for (const [optIndex, option] of q.options.entries()) {
                    const optionText = `${String.fromCharCode(97 + optIndex)}) ${option}`;
                    const optionLines = doc.splitTextToSize(optionText, maxWidth - 10);
                    const optionHeight = optionLines.length * 5;
                    checkPageBreak(optionHeight);
                    doc.text(optionLines, margin + 5, yPos);
                    yPos += optionHeight;
                }
            }

            if (includeAnswersInExport) {
                const answerText = `Answer: ${q.correct_answer}`;
                const answerLines = doc.splitTextToSize(answerText, maxWidth - 5);
                const answerHeight = answerLines.length * 5;
                checkPageBreak(answerHeight + 5);
                yPos += 2;
                doc.setFont('helvetica', 'bold').setTextColor(22, 101, 52); // Dark Green
                doc.text(answerLines, margin + 5, yPos);
                doc.setTextColor(0, 0, 0);
                yPos += answerHeight + 3;
            } else {
                yPos += 5;
            }
        }
    }
    
    return doc.output('blob');
  }
  
  const handleShareOrDownload = async () => {
    try {
        const pdfBlob = await generatePdfBlob();
        const fileName = `${paper.subject.replace(/[\s/]/g, '_')}_${paper.grade.replace(/\s/g, '_')}_Paper.pdf`;
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

        // Try Web Share API first, as it's the best user experience
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
                files: [pdfFile],
                title: `${paper.subject} Question Paper`,
                text: `Here is the question paper for ${paper.grade} ${paper.subject}.`,
            });
        } else {
            // Fallback for environments that don't support Web Share (like some WebViews)
            // Use FileReader to convert Blob to a Base64 Data URI for robust downloading
            const reader = new FileReader();
            reader.readAsDataURL(pdfBlob);
            reader.onloadend = () => {
                const base64data = reader.result as string;
                const a = document.createElement("a");
                a.href = base64data;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showToast("Web Share not supported. PDF downloaded for manual sharing.");
            };
            reader.onerror = (error) => {
                console.error("Error converting blob to Data URI:", error);
                showToast("Failed to prepare PDF for download.");
            };
        }
    } catch (error) {
        // Silently ignore AbortError which happens if the user cancels the share dialog
        if (error instanceof Error && error.name !== 'AbortError') {
             console.error("Error during share/download attempt:", error);
             showToast("Could not share or download PDF. An unexpected error occurred.");
        }
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewPrompt.trim()) {
        setReviewError("Please enter a review request.");
        return;
    }
    setIsReviewing(true);
    setReviewFeedback('');
    setReviewError('');
    try {
        const feedback = await reviewQuestionPaper(paper, reviewPrompt);
        setReviewFeedback(feedback);
    } catch (err) {
        setReviewError(err instanceof Error ? err.message : "An unknown error occurred during review.");
    } finally {
        setIsReviewing(false);
    }
  };

  const openReviewModal = () => {
    setReviewPrompt('');
    setReviewFeedback('');
    setReviewError('');
    setReviewModalOpen(true);
  };

  return (
    <>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 print-area">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
                <h2 className="text-xl font-bold text-slate-700">Generated Paper</h2>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                    <button onClick={onNewPaper} className="flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"><NewPaperIcon /> New Paper</button>
                    <button onClick={() => setShowAnswers(!showAnswers)} className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${showAnswers ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} aria-pressed={showAnswers}><KeyIcon /> {showAnswers ? 'Hide Answers' : 'Show Answers'}</button>
                    <button onClick={openReviewModal} className="flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"><ReviewIcon /> AI Review</button>
                    <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm font-semibold bg-slate-100 text-slate-600">
                        <input id="include-answers" type="checkbox" checked={includeAnswersInExport} onChange={(e) => setIncludeAnswersInExport(e.target.checked)} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                        <label htmlFor="include-answers" className="cursor-pointer">Include Answers in Export</label>
                    </div>
                    <button onClick={handleShareOrDownload} className="flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors"><ShareIcon /> Share PDF</button>
                    <button onClick={handlePrint} className="flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"><PrintIcon /> Print / PDF</button>
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
                                    <div className={`printable-answer ${showAnswers ? '' : 'hidden'}`}>
                                        <div className="mt-3 ml-6 p-2 bg-green-50 border border-green-200 rounded-md">
                                            <p className="text-sm font-semibold text-green-800">
                                                Correct Answer: <span className="font-normal">{q.correct_answer}</span>
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>
                ))}
            </div>
        </div>
        
        {isReviewModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in-up" onClick={() => setReviewModalOpen(false)}>
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800">AI-Powered Review</h3>
                        <button onClick={() => setReviewModalOpen(false)} className="text-slate-500 hover:text-slate-800">&times;</button>
                    </div>
                    <div className="p-4 space-y-4 overflow-y-auto">
                        <div>
                            <label htmlFor="review-prompt" className="text-sm font-semibold text-slate-600 mb-2 block">What would you like to review?</label>
                            <textarea id="review-prompt" value={reviewPrompt} onChange={(e) => setReviewPrompt(e.target.value)} rows={3} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="e.g., Check for clarity and accuracy..."></textarea>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <button onClick={() => setReviewPrompt("Check all questions for clarity and suggest improvements.")} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md">Clarity</button>
                                <button onClick={() => setReviewPrompt("Verify the accuracy of the questions and answers based on the GSEB curriculum.")} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md">Accuracy</button>
                                <button onClick={() => setReviewPrompt("Are these questions relevant for the specified chapters? Are there any gaps?")} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md">Relevance</button>
                            </div>
                        </div>
                        {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
                        
                        {(isReviewing || reviewFeedback) && (
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-slate-700 mb-2">AI Feedback:</h4>
                                {isReviewing && <div className="text-center text-slate-500">Generating feedback...</div>}
                                {reviewFeedback && <div className="prose prose-sm max-w-none text-slate-800 bg-slate-50 p-3 rounded-md whitespace-pre-wrap">{reviewFeedback}</div>}
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t bg-slate-50 flex justify-end">
                        <button onClick={handleReviewSubmit} disabled={isReviewing} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                            {isReviewing ? "Reviewing..." : "Submit for Review"}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {toastMessage && (
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white py-2 px-6 rounded-full shadow-lg transition-opacity duration-300 animate-fade-in-up z-50 no-print" role="status" aria-live="polite">
                <p>{toastMessage}</p>
            </div>
        )}
    </>
  );
};
