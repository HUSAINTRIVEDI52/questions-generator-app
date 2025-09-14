import React, { useState } from 'react';
import type { Question, QuestionPaper } from '../types';

declare var docx: any;
declare var jspdf: any;

// Icons
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18.24-5.48-5.48-1.5-1.5-2.25-2.25-1.5-1.5-5.48-5.48a.5.5 0 0 0-.71 0l-1.5 1.5a.5.5 0 0 0 0 .71l5.48 5.48 1.5 1.5 2.25 2.25 1.5 1.5 5.48 5.48a.5.5 0 0 0 .71 0l1.5-1.5a.5.5 0 0 0 0-.71z" /><path d="m2 22 5.5-5.5" /></svg>;
const DocxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="M12 12.5a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-5 0V15a2.5 2.5 0 0 0-5 0v5a2.5 2.5 0 0 0 5 0v-2.5"/></svg>;
const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 12v6"></path><path d="M10 15h2a2 2 0 1 0 0-4h-2v4Z"></path><path d="M16 12h-1a2 2 0 0 0-2 2v4"></path><path d="M16 18h-2"></path></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>;
const CreateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>;

interface QuestionPaperDisplayProps {
  paper: QuestionPaper;
  onNewPaper: () => void;
  isMobile: boolean;
}

const generatePlainText = (paper: QuestionPaper, includeAnswers: boolean): string => {
    let text = "";
    text += `${paper.institution_name}\n`;
    text += `${paper.title}\n`;
    text += `${paper.grade} - ${paper.subject}\n\n`;
    text += `Total Marks: ${paper.total_marks}\tDuration: ${paper.duration_minutes} minutes\n`;
    text += "--------------------------------------------------\n\n";

    paper.sections.forEach(section => {
        text += `${section.section_title}\n`;
        section.questions.forEach((q, qIndex) => {
            text += `${qIndex + 1}. ${q.question_text} [${q.marks} Marks]\n`;
            if (q.options) {
                q.options.forEach((option, optIndex) => {
                    text += `   ${String.fromCharCode(97 + optIndex)}) ${option}\n`;
                });
            }
            if (includeAnswers) {
                text += `   Answer: ${q.correct_answer}\n`;
            }
            text += "\n";
        });
    });
    return text;
};


class PdfWriter {
    doc: any;
    y: number;
    pageWidth: number;
    pageHeight: number;
    margin: number;
    pageNumber: number;
    lineHeightFactor: number;

    constructor() {
        this.doc = new jspdf.jsPDF();
        this.margin = 20;
        this.y = this.margin;
        this.pageWidth = this.doc.internal.pageSize.width;
        this.pageHeight = this.doc.internal.pageSize.height;
        this.pageNumber = 1;
        this.lineHeightFactor = 1.2; // Adjust for spacing between lines
    }

    checkPageBreak(spaceNeeded: number) {
        if (this.y + spaceNeeded > this.pageHeight - this.margin) {
            this.addPageNumber();
            this.doc.addPage();
            this.y = this.margin;
            this.pageNumber++;
        }
    }

    addPageNumber() {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'italic');
        this.doc.text(`Page ${this.pageNumber}`, this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' });
    }

    getLineHeight(fontSize: number): number {
        return fontSize / this.doc.internal.scaleFactor * this.lineHeightFactor;
    }

    writeHeader(paper: QuestionPaper) {
        this.doc.setFontSize(18).setFont('helvetica', 'bold');
        this.doc.text(paper.institution_name, this.pageWidth / 2, this.y, { align: 'center' });
        this.y += this.getLineHeight(18) * 1.2;

        this.doc.setFontSize(14).setFont('helvetica', 'normal');
        this.doc.text(paper.title, this.pageWidth / 2, this.y, { align: 'center' });
        this.y += this.getLineHeight(14);
        
        this.doc.setFontSize(12).setFont('helvetica', 'normal');
        this.doc.text(`${paper.grade} - ${paper.subject}`, this.pageWidth / 2, this.y, { align: 'center' });
        this.y += this.getLineHeight(12) * 2;
        
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
        this.y += this.getLineHeight(11) * 1.5;
        
        this.doc.setFontSize(11);
        this.doc.text(`Total Marks: ${paper.total_marks}`, this.margin, this.y);
        this.doc.text(`Duration: ${paper.duration_minutes} minutes`, this.pageWidth - this.margin, this.y, { align: 'right' });
        this.y += this.getLineHeight(11) * 0.8;
        this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
        this.y += this.getLineHeight(11) * 2;
    }

    writeQuestion(q: Question, qIndex: number, includeAnswers: boolean) {
        const availableWidth = this.pageWidth - this.margin * 2;
        
        this.doc.setFontSize(11).setFont('helvetica', 'bold');
        const questionText = `${qIndex + 1}. ${q.question_text}`;
        const marksText = `[${q.marks} Marks]`;
        const marksWidth = this.doc.getTextWidth(marksText);
        const questionWidth = availableWidth - marksWidth - 5;
        const splitQuestion = this.doc.splitTextToSize(questionText, questionWidth);
        const questionHeight = this.getLineHeight(11) * splitQuestion.length;

        // Smart page break: Check if question + at least one option/answer line fits
        let neededSpace = questionHeight + 10;
        if (q.options) neededSpace += this.getLineHeight(11);
        if (includeAnswers) neededSpace += this.getLineHeight(11);
        this.checkPageBreak(neededSpace);

        this.doc.text(splitQuestion, this.margin, this.y);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(marksText, this.pageWidth - this.margin, this.y, { align: 'right' });
        this.y += questionHeight;

        if (q.options) {
            this.y += 4;
            this.doc.setFontSize(11).setFont('helvetica', 'normal');
            q.options.forEach((option: string, optIndex: number) => {
                const optionLine = `${String.fromCharCode(97 + optIndex)}) ${option}`;
                const splitOption = this.doc.splitTextToSize(optionLine, availableWidth - 10);
                const optionHeight = this.getLineHeight(11) * splitOption.length;
                this.checkPageBreak(optionHeight);
                this.doc.text(splitOption, this.margin + 5, this.y);
                this.y += optionHeight;
            });
        }

        if (includeAnswers) {
            this.y += 4;
            this.doc.setFontSize(10).setFont('helvetica', 'bold');
            this.doc.setTextColor('#006400'); // Dark Green
            const answerText = `Answer: ${q.correct_answer}`;
            const splitAnswer = this.doc.splitTextToSize(answerText, availableWidth - 10);
            const answerHeight = this.getLineHeight(10) * splitAnswer.length;
            this.checkPageBreak(answerHeight);
            this.doc.text(splitAnswer, this.margin + 5, this.y);
            this.y += answerHeight;
            this.doc.setTextColor('#000000'); // Reset color
        }
        
        this.y += 8; // Space between questions
    }

    generate(paper: QuestionPaper, includeAnswers: boolean) {
        this.writeHeader(paper);
        paper.sections.forEach(section => {
            this.checkPageBreak(25); // Space for section header
            this.doc.setFontSize(13).setFont('helvetica', 'bold');
            this.doc.text(section.section_title, this.margin, this.y);
            this.y += this.getLineHeight(13) * 0.8;
            this.doc.setLineWidth(0.2);
            this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
            this.y += this.getLineHeight(13) * 1.5;

            section.questions.forEach((q, qIndex) => {
                this.writeQuestion(q, qIndex, includeAnswers);
            });
        });
        this.addPageNumber();
        this.doc.save(`${paper.subject}_${paper.grade}_Paper.pdf`);
    }
}


export const QuestionPaperDisplay: React.FC<QuestionPaperDisplayProps> = ({ paper, onNewPaper, isMobile }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [includeAnswersInExport, setIncludeAnswersInExport] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleToggleAnswers = () => {
    setShowAnswers(prevShowState => !prevShowState);
  };

  const handleCopy = () => {
    const textToCopy = generatePlainText(paper, includeAnswersInExport);
    navigator.clipboard.writeText(textToCopy).then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    });
  }

  const handleShare = () => {
      if ('share' in navigator) {
          navigator.share({
              title: 'AI Question Paper Generator',
              text: `Check out this question paper generator I used!`,
              url: window.location.href
          }).catch((error) => console.error('Error sharing:', error));
      }
  }

  const handlePdfExport = () => {
    const writer = new PdfWriter();
    writer.generate(paper, includeAnswersInExport);
  };
  
  const handleDocxExport = () => {
    const { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;

    const children = [
      new Paragraph({ text: paper.institution_name, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: paper.title, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: `${paper.grade} - ${paper.subject}`, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
      new Paragraph({
        children: [ new TextRun(`Total Marks: ${paper.total_marks}\tDuration: ${paper.duration_minutes} minutes`) ],
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 } },
        spacing: { before: 200, after: 400 },
      }),
    ];

    paper.sections.forEach(section => {
      children.push(new Paragraph({
        text: section.section_title,
        heading: HeadingLevel.HEADING_2,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "auto", space: 1 } },
        spacing: { after: 200 }
      }));

      section.questions.forEach((q, qIndex) => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${qIndex + 1}. `, bold: true }),
            new TextRun(q.question_text),
            new TextRun({ text: `\t[${q.marks} Marks]`, bold: true, italics: true }),
          ],
          spacing: { after: 100 },
        }));
        if (q.options) {
          q.options.forEach((option, optIndex) => {
            children.push(new Paragraph({
              children: [new TextRun(`\t${String.fromCharCode(97 + optIndex)}) ${option}`)],
              spacing: { after: 50 },
              indent: { left: 720 },
            }));
          });
        }
        if (includeAnswersInExport) {
          children.push(new Paragraph({
            children: [ new TextRun({ text: `Answer: ${q.correct_answer}`, bold: true, color: "008000" }) ],
            spacing: { after: 200 },
            indent: { left: 720 },
          }));
        }
      });
    });

    const doc = new Document({ sections: [{ children }] });

    Packer.toBlob(doc).then((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${paper.subject}_${paper.grade}_Paper.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 animate-fade-in-up">
        <div className="p-4 md:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
            <div className="flex items-center gap-4 flex-wrap justify-center">
                {isMobile && (
                    <button onClick={onNewPaper} className="flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors transform active:scale-95">
                        <CreateIcon /> New Paper
                    </button>
                )}
                <button onClick={handleToggleAnswers} className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-colors transform active:scale-95 ${showAnswers ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} aria-pressed={showAnswers}>
                    <KeyIcon /> {showAnswers ? 'Hide Answers' : 'Show Answers'}
                </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center bg-slate-100 p-2 rounded-lg">
                <div className="flex items-center">
                    <button onClick={handlePdfExport} className="flex items-center gap-2 py-2 pl-4 pr-2 rounded-l-md text-sm font-semibold bg-white text-slate-600 hover:bg-slate-50 transition-colors transform active:scale-95 border border-slate-200"><PdfIcon /> PDF</button>
                    <button onClick={handleDocxExport} className="flex items-center gap-2 py-2 pl-4 pr-2 rounded-none text-sm font-semibold bg-white text-slate-600 hover:bg-slate-50 transition-colors transform active:scale-95 border-y border-r border-slate-200"><DocxIcon /> DOCX</button>
                    <div className="flex items-center pl-2 bg-white rounded-r-md border-y border-r border-slate-200 h-full">
                        <input type="checkbox" id="include-answers" checked={includeAnswersInExport} onChange={(e) => setIncludeAnswersInExport(e.target.checked)} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                        <label htmlFor="include-answers" className="ml-2 text-sm text-slate-600 pr-3 select-none">Answers</label>
                    </div>
                </div>
            </div>
             <div className="flex items-center gap-2 flex-wrap justify-center">
                <button onClick={handleCopy} className="flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors transform active:scale-95">
                    <CopyIcon /> {copyStatus === 'copied' ? 'Copied!' : 'Copy Content'}
                </button>
                 {'share' in navigator && (
                    <button onClick={handleShare} className="flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors transform active:scale-95">
                        <ShareIcon /> Share
                    </button>
                 )}
            </div>
        </div>
      
        <div className="p-6 md:p-10" id="printable-paper">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold" style={{color: 'var(--color-text-main)'}}>{paper.institution_name}</h1>
                <h2 className="text-xl font-semibold mt-1" style={{color: 'var(--color-text-main)'}}>{paper.title}</h2>
                <h3 className="text-lg font-medium" style={{color: 'var(--color-text-muted)'}}>{paper.grade} - {paper.subject}</h3>
                <div className="flex justify-between items-center mt-4 text-sm max-w-lg mx-auto border-t border-b py-2" style={{borderColor: 'var(--color-border)'}}>
                    <span><strong>Total Marks:</strong> {paper.total_marks}</span>
                    <span><strong>Duration:</strong> {paper.duration_minutes} minutes</span>
                </div>
            </header>

            {paper.sections.map((section, sectionIndex) => (
                <section key={sectionIndex} className="mb-8">
                    <h3 className="text-lg font-bold border-b-2 pb-2 mb-4" style={{borderColor: '#94a3b8'}}>{section.section_title}</h3>
                    <ol className="list-decimal list-inside space-y-6">
                        {section.questions.map((q, qIndex) => (
                            <li key={qIndex} className="break-words">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-slate-800 pr-4">{q.question_text}</p>
                                    <span className="text-sm font-bold text-slate-600 ml-4 whitespace-nowrap">[{q.marks} Marks]</span>
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