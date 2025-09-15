import React, { useState, useEffect } from 'react';
import type { Question, QuestionPaper } from '../types';

declare var docx: any;
declare var jspdf: any;

const FONT_URL = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosans/NotoSans-Regular.ttf';
let fontDataCache: string | null = null;

// Helper to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

/**
 * Retrieves the Base64 encoded font data for Noto Sans by fetching it from a CDN.
 * This is crucial for rendering non-Latin characters (like Gujarati) correctly in the PDF.
 * The result is cached to avoid repeated downloads in the same session.
 */
const getFontData = async (): Promise<string> => {
    if (fontDataCache) {
        return fontDataCache;
    }

    try {
        const response = await fetch(FONT_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch font: ${response.statusText}`);
        }
        const fontBuffer = await response.arrayBuffer();
        const base64String = arrayBufferToBase64(fontBuffer);
        fontDataCache = base64String;
        return base64String;
    } catch (error) {
        console.error("Font loading failed:", error);
        throw new Error("Could not download the required font for PDF export. Please check your internet connection and try again.");
    }
};


// Icons
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18.24-5.48-5.48-1.5-1.5-2.25-2.25-1.5-1.5-5.48-5.48a.5.5 0 0 0-.71 0l-1.5 1.5a.5.5 0 0 0 0 .71l5.48 5.48 1.5 1.5 2.25 2.25 1.5 1.5 5.48 5.48a.5.5 0 0 0 .71 0l1.5-1.5a.5.5 0 0 0 0-.71z" /><path d="m2 22 5.5-5.5" /></svg>;
const DocxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="M12 12.5a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-5 0V15a2.5 2.5 0 0 0-5 0v5a2.5 2.5 0 0 0 5 0v-2.5"/></svg>;
const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 12v6"></path><path d="M10 15h2a2 2 0 1 0 0-4h-2v4Z"></path><path d="M16 12h-1a2 2 0 0 0-2 2v4"></path><path d="M16 18h-2"></path></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>;
const CreateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>;
const SpinnerIcon = () => <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


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
    fontName: string = 'UnicodeFont';

    constructor(fontBase64: string) {
        this.doc = new jspdf.jsPDF({ unit: 'pt' });
        this.margin = 50;
        this.y = this.margin;
        this.pageWidth = this.doc.internal.pageSize.width;
        this.pageHeight = this.doc.internal.pageSize.height;
        this.pageNumber = 1;
        this.lineHeightFactor = 1.4;

        this.doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64);
        this.doc.addFont('NotoSans-Regular.ttf', this.fontName, 'normal');
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
        this.doc.setFont(this.fontName, 'normal');
        this.doc.text(`Page ${this.pageNumber}`, this.pageWidth / 2, this.pageHeight - 20, { align: 'center' });
    }

    getLineHeight(fontSize: number): number {
        return fontSize * this.lineHeightFactor;
    }

    writeHeader(paper: QuestionPaper) {
        this.doc.setFont(this.fontName, 'normal').setFontSize(20);
        this.doc.text(paper.institution_name, this.pageWidth / 2, this.y, { align: 'center' });
        this.y += this.getLineHeight(20);

        this.doc.setFont(this.fontName, 'normal').setFontSize(16);
        this.doc.text(paper.title, this.pageWidth / 2, this.y, { align: 'center' });
        this.y += this.getLineHeight(16);
        
        this.doc.setFontSize(14);
        this.doc.text(`${paper.grade} - ${paper.subject}`, this.pageWidth / 2, this.y, { align: 'center' });
        this.y += this.getLineHeight(14);
        
        this.doc.setLineWidth(1);
        this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
        this.y += this.getLineHeight(12) * 1.2;
        
        this.doc.setFont(this.fontName, 'normal').setFontSize(12);
        this.doc.text(`Total Marks: ${paper.total_marks}`, this.margin, this.y);
        this.doc.text(`Duration: ${paper.duration_minutes} minutes`, this.pageWidth - this.margin, this.y, { align: 'right' });
        this.y += this.getLineHeight(12) * 0.8;
        this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
        this.y += this.getLineHeight(12) * 2;
    }

    writeQuestion(q: Question, qIndex: number, includeAnswers: boolean) {
        const availableWidth = this.pageWidth - this.margin * 2;
        
        this.doc.setFont(this.fontName, 'normal').setFontSize(12);
        const marksText = `[${q.marks} Marks]`;
        const marksWidth = this.doc.getTextWidth(marksText);

        const questionMaxWidth = availableWidth - marksWidth - 15;

        const qNumText = `${qIndex}.`;
        const qNumWidth = this.doc.getTextWidth(qNumText);
        
        const questionLines = this.doc.splitTextToSize(q.question_text, questionMaxWidth - qNumWidth);
        const questionBlockHeight = this.getLineHeight(12) * questionLines.length;

        let neededSpace = questionBlockHeight + 10;
        if (q.options) neededSpace += (this.getLineHeight(12) * q.options.length) + 4;
        if (includeAnswers) neededSpace += this.getLineHeight(10) + 4;
        this.checkPageBreak(neededSpace);

        const startY = this.y;
        
        this.doc.text(marksText, this.pageWidth - this.margin, startY, { align: 'right' });
        
        this.doc.text(qNumText, this.margin, this.y, { align: 'left' });
        this.doc.text(questionLines, this.margin + qNumWidth + 4, this.y);

        this.y += questionBlockHeight;

        if (q.options) {
            this.y += 4;
            this.doc.setFont(this.fontName, 'normal').setFontSize(12);
            q.options.forEach((option: string, optIndex: number) => {
                const optionLine = `${String.fromCharCode(97 + optIndex)}) ${option}`;
                const splitOption = this.doc.splitTextToSize(optionLine, availableWidth - 25);
                const optionHeight = this.getLineHeight(12) * splitOption.length;
                this.checkPageBreak(optionHeight);
                this.doc.text(splitOption, this.margin + 15, this.y);
                this.y += optionHeight;
            });
        }

        if (includeAnswers) {
            this.y += 6;
            this.doc.setFont(this.fontName, 'normal').setFontSize(11);
            this.doc.setTextColor('#006400');
            const answerText = `Answer: ${q.correct_answer}`;
            const splitAnswer = this.doc.splitTextToSize(answerText, availableWidth - 25);
            const answerHeight = this.getLineHeight(11) * splitAnswer.length;
            this.checkPageBreak(answerHeight);
            this.doc.text(splitAnswer, this.margin + 15, this.y);
            this.y += answerHeight;
            this.doc.setTextColor('#000000');
        }
        
        this.y += 12;
    }

    getBlob(paper: QuestionPaper, includeAnswers: boolean): Blob {
        this.writeHeader(paper);
        paper.sections.forEach(section => {
            this.checkPageBreak(30);
            this.doc.setFont(this.fontName, 'normal').setFontSize(14);
            const sectionTitleWidth = this.doc.getTextWidth(section.section_title);
            this.doc.text(section.section_title, this.margin, this.y);
            this.y += this.getLineHeight(14) * 0.1;
            this.doc.setLineWidth(0.5);
            this.doc.line(this.margin, this.y, this.margin + sectionTitleWidth, this.y);
            this.y += this.getLineHeight(14) * 1.5;

            section.questions.forEach((q, qIndex) => {
                this.writeQuestion(q, qIndex + 1, includeAnswers);
            });
        });
        this.addPageNumber();
        return this.doc.output('blob');
    }
}

const createDocxBlob = (paper: QuestionPaper, includeAnswers: boolean): Promise<Blob> => {
    const { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TabStopType, TabStopPosition } = docx;

    const children = [
      new Paragraph({ text: paper.institution_name, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: paper.title, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: `${paper.grade} - ${paper.subject}`, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
      new Paragraph({
        children: [
          new TextRun(`Total Marks: ${paper.total_marks}`),
          new TextRun({ children: ["\t", `Duration: ${paper.duration_minutes} minutes`]}),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
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
            new TextRun(`${qIndex + 1}. ${q.question_text}`),
            new TextRun({ children: ["\t", `[${q.marks} Marks]`], bold: true }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          spacing: { after: 100 },
        }));

        if (q.options) {
          q.options.forEach((option, optIndex) => {
            children.push(new Paragraph({
              text: `${String.fromCharCode(97 + optIndex)}) ${option}`,
              spacing: { after: 50 },
              indent: { left: 720 },
            }));
          });
        }
        if (includeAnswers) {
          children.push(new Paragraph({
            children: [ new TextRun({ text: `Answer: ${q.correct_answer}`, bold: true, color: "008000" }) ],
            spacing: { after: 200 },
            indent: { left: 720 },
          }));
        }
      });
    });

    const doc = new Document({ sections: [{ children }] });
    return Packer.toBlob(doc);
};

export const QuestionPaperDisplay: React.FC<QuestionPaperDisplayProps> = ({ paper, onNewPaper, isMobile }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [includeAnswersInExport, setIncludeAnswersInExport] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if ('share' in navigator && 'canShare' in navigator && typeof navigator.canShare === 'function') {
        const testFile = new File(["test"], "test.txt", { type: "text/plain" });
        if (navigator.canShare({ files: [testFile] })) {
            setCanShareFiles(true);
        }
    }
  }, []);

  const handleCopy = () => {
    const textToCopy = generatePlainText(paper, includeAnswersInExport);
    navigator.clipboard.writeText(textToCopy).then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
    });
  }

  const handleFileShare = async (format: 'pdf' | 'docx') => {
    setIsExporting(true);
    try {
        let blob: Blob;
        let fileName: string;
        let fileType: string;

        if (format === 'pdf') {
            const fontBase64 = await getFontData();
            const writer = new PdfWriter(fontBase64);
            blob = writer.getBlob(paper, includeAnswersInExport);
            fileName = `${paper.subject}_${paper.grade}_Paper.pdf`;
            fileType = 'application/pdf';
        } else {
            blob = await createDocxBlob(paper, includeAnswersInExport);
            fileName = `${paper.subject}_${paper.grade}_Paper.docx`;
            fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        const fileToShare = new File([blob], fileName, { type: fileType });

        await navigator.share({
            title: `${paper.subject} Question Paper`,
            text: `Here is the question paper for ${paper.subject}. Create your own at this website.`,
            url: window.location.origin,
            files: [fileToShare],
        });
    } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
            console.error('Error sharing file:', error);
            alert(`An error occurred while trying to share the file: ${(error as Error).message}`);
        }
    } finally {
        setIsExporting(false);
    }
  };

  const handlePdfExport = async () => {
    setIsExporting(true);
    try {
        const fontBase64 = await getFontData();
        const writer = new PdfWriter(fontBase64);
        const blob = writer.getBlob(paper, includeAnswersInExport);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${paper.subject}_${paper.grade}_Paper.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        alert((error as Error).message);
    } finally {
        setIsExporting(false);
    }
  };
  
  const handleDocxExport = async () => {
    setIsExporting(true);
    try {
        const blob = await createDocxBlob(paper, includeAnswersInExport);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${paper.subject}_${paper.grade}_Paper.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        alert(`Failed to export DOCX: ${(error as Error).message}`);
    } finally {
        setIsExporting(false);
    }
  };

  const actionButtonStyles = "flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-colors transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60";
  const primaryButtonStyles = `${actionButtonStyles} bg-blue-600 text-white hover:bg-blue-700`;
  const secondaryButtonStyles = `${actionButtonStyles} bg-slate-100 text-slate-600 hover:bg-slate-200`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 animate-fade-in-up">
        <div className="p-4 md:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
            <div className="flex items-center gap-2 flex-wrap justify-center">
                {isMobile && (
                    <button onClick={onNewPaper} className={primaryButtonStyles}>
                        <CreateIcon /> New Paper
                    </button>
                )}
                <button onClick={() => setShowAnswers(s => !s)} className={`${secondaryButtonStyles} ${showAnswers ? '!bg-blue-100 !text-blue-700' : ''}`} aria-pressed={showAnswers}>
                    <KeyIcon /> {showAnswers ? 'Hide Answers' : 'Show Answers'}
                </button>
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button onClick={handlePdfExport} disabled={isExporting} className={secondaryButtonStyles}>
                        {isExporting ? <SpinnerIcon /> : <PdfIcon />} {isExporting ? 'Preparing...' : 'Export PDF'}
                    </button>
                    <button onClick={handleDocxExport} disabled={isExporting} className={secondaryButtonStyles}>
                        {isExporting ? <SpinnerIcon /> : <DocxIcon />}{isExporting ? 'Preparing...' : 'Export DOCX'}
                    </button>
                    {canShareFiles && (
                        <>
                            <button onClick={() => handleFileShare('pdf')} disabled={isExporting} className={secondaryButtonStyles}>
                                {isExporting ? <SpinnerIcon /> : <ShareIcon />}{isExporting ? 'Preparing...' : 'Share PDF'}
                            </button>
                            <button onClick={() => handleFileShare('docx')} disabled={isExporting} className={secondaryButtonStyles}>
                                {isExporting ? <SpinnerIcon /> : <ShareIcon />}{isExporting ? 'Preparing...' : 'Share DOCX'}
                            </button>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <div className="flex items-center pl-2 bg-slate-100 rounded-md h-full">
                        <input type="checkbox" id="include-answers" checked={includeAnswersInExport} onChange={(e) => setIncludeAnswersInExport(e.target.checked)} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                        <label htmlFor="include-answers" className="ml-2 text-sm text-slate-600 pr-3 py-2 select-none">Answers in Export/Share</label>
                    </div>
                    <button onClick={handleCopy} className={secondaryButtonStyles}>
                        <CopyIcon /> {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
                    </button>
                </div>
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
                                <div className="flex justify-between items-start gap-4">
                                    <p className="flex-1 font-semibold text-slate-800">{q.question_text}</p>
                                    <span className="text-sm font-bold text-slate-600 whitespace-nowrap">[{q.marks} Marks]</span>
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