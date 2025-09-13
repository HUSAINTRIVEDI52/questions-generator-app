import React, { useState, useRef, useEffect } from 'react';
import type { QuestionPaper } from '../types';
import { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


// Icons
const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4 22h16a2 2 0 0 0 2-2V8.5L15.5 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"/><path d="M8 18h1"/><path d="M12 18h4"/><path d="M8 14h8"/></svg>;
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18.24-5.48-5.48-1.5-1.5-2.25-2.25-1.5-1.5-5.48-5.48a.5.5 0 0 0-.71 0l-1.5 1.5a.5.5 0 0 0 0 .71l5.48 5.48 1.5 1.5 2.25 2.25 1.5 1.5 5.48 5.48a.5.5 0 0 0 .71 0l1.5-1.5a.5.5 0 0 0 0-.71z" /><path d="m2 22 5.5-5.5" /></svg>;
const DocxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="M12 12.5a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-5 0V15a2.5 2.5 0 0 0-5 0v5a2.5 2.5 0 0 0 5 0v-2.5"/></svg>;
const NewPaperIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.38 0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.24 8.24zm4.52-6.14c-.25-.12-1.47-.72-1.7-.82s-.39-.12-.55.12c-.17.25-.64.82-.79.98-.15.17-.29.18-.55.06s-1.02-.38-1.95-1.2c-.72-.64-1.2-1.43-1.34-1.68s-.03-.38.11-.51c.13-.13.29-.35.43-.51s.19-.25.29-.42.05-.31-.02-.43c-.08-.12-.55-1.32-.75-1.81s-.4-.41-.55-.42h-.48c-.17 0-.43.06-.66.31s-.86.85-.86 2.07c0 1.22.88 2.4 1 2.56.12.17 1.75 2.67 4.24 3.75 2.49 1.08 2.49.72 2.94.69.45-.03 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18s-.24-.18-.5-.3z" /></svg>;
const CopyContentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>;


interface QuestionPaperDisplayProps {
  paper: QuestionPaper;
  onNewPaper: () => void;
}

export const QuestionPaperDisplay: React.FC<QuestionPaperDisplayProps> = ({ paper, onNewPaper }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [exportWithAnswers, setExportWithAnswers] = useState(false);
  const [copyContentWithAnswers, setCopyContentWithAnswers] = useState(false);
  const [pdfWithAnswers, setPdfWithAnswers] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy Content');
  const printablePaperRef = useRef<HTMLDivElement>(null);
  const [isShareApiSupported, setIsShareApiSupported] = useState(false);

  useEffect(() => {
    if (navigator.share) {
      setIsShareApiSupported(true);
    }
  }, []);

  const handleToggleShowAnswers = () => {
    const newShowState = !showAnswers;
    setShowAnswers(newShowState);
    setExportWithAnswers(newShowState);
    setPdfWithAnswers(newShowState);
    setCopyContentWithAnswers(newShowState);
  };
  
  const handlePdfExport = async () => {
    const paperElement = printablePaperRef.current;
    if (!paperElement || isDownloadingPdf) return;

    setIsDownloadingPdf(true);

    if (pdfWithAnswers) {
        paperElement.classList.add('print-with-answers');
    }

    try {
        const canvas = await html2canvas(paperElement, { scale: 2, useCORS: true, logging: false });
        if (pdfWithAnswers) paperElement.classList.remove('print-with-answers');
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const imgHeight = pdfWidth / ratio;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position = -heightLeft;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        
        const fileName = pdfWithAnswers ? `${paper.subject}_${paper.grade}_Paper_with_Answers.pdf` : `${paper.subject}_${paper.grade}_Question_Paper.pdf`;
        pdf.save(fileName);

    } catch(error) {
        console.error("Error generating PDF:", error);
        alert("Sorry, there was an error creating the PDF. Please try again.");
    } finally {
        setIsDownloadingPdf(false);
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: 'AI Question Paper Generator',
      text: `I just created a custom question paper for ${paper.grade} ${paper.subject} using this awesome AI Generator!`,
      url: window.location.href
    };
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
      const url = window.location.href;
      const text = `I just created a custom question paper for ${paper.grade} ${paper.subject} using this awesome AI Generator! Check it out:`;
      const encodedUrl = encodeURIComponent(url);
      const encodedText = encodeURIComponent(text);
      let shareUrl = '';

      switch (platform) {
          case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`; break;
          case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`; break;
          case 'whatsapp': shareUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`; break;
      }
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyContent = () => {
    const header = `${paper.institution_name}\n${paper.title}\n${paper.grade} - ${paper.subject}\nTotal Marks: ${paper.total_marks}\tDuration: ${paper.duration_minutes} minutes\n\n`;
    const body = paper.sections.map(section => {
      const sectionTitle = `${section.section_title}\n`;
      const questions = section.questions.map((q, qIndex) => {
        let questionText = `${qIndex + 1}. ${q.question_text} [${q.marks} Marks]\n`;
        if (q.options) {
          questionText += q.options.map((opt, optIndex) => `   ${String.fromCharCode(97 + optIndex)}) ${opt}`).join('\n') + '\n';
        }
        if (copyContentWithAnswers) {
          questionText += `Answer: ${q.correct_answer}\n`;
        }
        return questionText;
      }).join('\n');
      return sectionTitle + questions;
    }).join('\n');

    navigator.clipboard.writeText(header + body).then(() => {
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy Content'), 2000);
    }, () => {
      setCopyStatus('Failed!');
      setTimeout(() => setCopyStatus('Copy Content'), 2000);
    });
  };
  
  const handleDocxExport = (includeAnswers: boolean) => {
    const docSections = paper.sections.flatMap((section) => {
        const questions = section.questions.map((q, qIndex) => {
            const questionParts = [ new Paragraph({ children: [ new TextRun({ text: `${qIndex + 1}. `, bold: true }), new TextRun(q.question_text), new TextRun({ text: ` [${q.marks} Marks]`, bold: true, italics: true }), ], spacing: { after: 100 }, }) ];
            if (q.options) { q.options.forEach((option, optIndex) => { questionParts.push(new Paragraph({ children: [new TextRun(`\t${String.fromCharCode(97 + optIndex)}) ${option}`)], spacing: { after: 50 }, })); }); }
            if (includeAnswers) { questionParts.push(new Paragraph({ children: [ new TextRun({ text: `Answer: ${q.correct_answer}`, bold: true, color: "4CAF50" }), ], spacing: { after: 200 }, })); }
            return questionParts;
        });
        return [ new Paragraph({ text: section.section_title, heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, style: "single", size: 6 } }, spacing: { after: 200 } }), ...questions.flat() ];
    });
    const doc = new Document({ sections: [{ children: [ new Paragraph({ text: paper.institution_name, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }), new Paragraph({ text: paper.title, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }), new Paragraph({ text: `${paper.grade} - ${paper.subject}`, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER }), new Paragraph({ children: [ new TextRun(`Total Marks: ${paper.total_marks}`), new TextRun({ text: `\tDuration: ${paper.duration_minutes} minutes` }), ], alignment: AlignmentType.CENTER, border: { top: { size: 4, style: "single" }, bottom: { size: 4, style: "single" } }, spacing: { before: 200, after: 400 }, }), ...docSections ], }], });
    Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const fileName = includeAnswers ? `${paper.subject}_${paper.grade}_Paper_with_Answers.docx` : `${paper.subject}_${paper.grade}_Question_Paper.docx`;
        a.download = fileName;
        document.body.appendChild(a); a.click();
        window.URL.revokeObjectURL(url); document.body.removeChild(a);
    });
  };
  
  const actionButtonClasses = "transform active:scale-95 transition-all duration-150";

  return (
    <div className="animate-fade-in-up" style={{ backgroundColor: 'var(--color-surface)', borderRadius: '0.75rem', border: '1px solid var(--color-border)', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' }}>
        <div className="p-4 md:p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
            <div className="flex items-center gap-4">
              <button onClick={onNewPaper} className={`flex lg:hidden items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 ${actionButtonClasses}`}>
                  <NewPaperIcon/> New Paper
              </button>
              <h2 className="text-xl font-bold text-slate-800 hidden lg:block">Generated Paper</h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
                <button
                    onClick={handleToggleShowAnswers}
                    className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${showAnswers ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} ${actionButtonClasses}`}
                    aria-pressed={showAnswers}
                    >
                    <KeyIcon />
                    {showAnswers ? 'Hide Answers' : 'Show Answers'}
                </button>
                <div className={`flex items-center border border-slate-200 rounded-md shadow-sm ${actionButtonClasses}`}>
                    <button onClick={handleCopyContent} className="flex items-center gap-2 py-2 px-4 rounded-l-md text-sm font-semibold bg-white text-slate-700 hover:bg-slate-50 transition-colors">
                        <CopyContentIcon />
                        {copyStatus}
                    </button>
                    <div className="flex items-center gap-1.5 px-3 border-l border-slate-200 bg-slate-50 h-full">
                        <input type="checkbox" id="copyAnswers" checked={copyContentWithAnswers} onChange={(e) => setCopyContentWithAnswers(e.target.checked)} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
                        <label htmlFor="copyAnswers" className="text-sm font-medium text-slate-600 select-none cursor-pointer">Answers</label>
                    </div>
                </div>

                <div className={`flex items-center border border-slate-200 rounded-md shadow-sm ${actionButtonClasses}`}>
                    <button onClick={() => handleDocxExport(exportWithAnswers)} className="flex items-center gap-2 py-2 px-4 rounded-l-md text-sm font-semibold bg-white text-slate-700 hover:bg-slate-50 transition-colors">
                        <DocxIcon />
                        Export DOCX
                    </button>
                    <div className="flex items-center gap-1.5 px-3 border-l border-slate-200 bg-slate-50 h-full">
                        <input type="checkbox" id="includeAnswersDocx" checked={exportWithAnswers} onChange={(e) => setExportWithAnswers(e.target.checked)} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
                        <label htmlFor="includeAnswersDocx" className="text-sm font-medium text-slate-600 select-none cursor-pointer">Answers</label>
                    </div>
                </div>

                <div className={`flex items-center border border-slate-200 rounded-md shadow-sm ${actionButtonClasses}`}>
                    <button onClick={handlePdfExport} disabled={isDownloadingPdf} className="flex items-center gap-2 py-2 px-4 rounded-l-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-300">
                        {isDownloadingPdf ? ( <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ) : <PdfIcon />}
                        {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
                    </button>
                     <div className="flex items-center gap-1.5 px-3 border-l border-slate-200 bg-slate-50 h-full">
                        <input type="checkbox" id="pdfAnswers" checked={pdfWithAnswers} onChange={(e) => setPdfWithAnswers(e.target.checked)} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
                        <label htmlFor="pdfAnswers" className="text-sm font-medium text-slate-600 select-none cursor-pointer">Answers</label>
                    </div>
                </div>
            </div>
        </div>
      
        <div className="p-6 md:p-10" id="printable-paper" ref={printablePaperRef}>
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
                                    <p className="font-semibold text-slate-800 pr-4">{q.question_text}</p>
                                    <span className="text-sm font-semibold text-slate-600 ml-4 whitespace-nowrap">[{q.marks} Marks]</span>
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
                                <div className={`mt-3 ml-6 p-2 bg-green-50 border border-green-200 rounded-md printable-answer ${showAnswers ? '' : 'hidden'}`}>
                                    <p className="text-sm font-semibold text-green-800">
                                        Correct Answer: <span className="font-normal text-slate-800">{q.correct_answer}</span>
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            ))}
      </div>
      <div className="p-6 border-t border-slate-200 no-print">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <h3 className="text-lg font-semibold text-slate-700">Share this App!</h3>
            <div className="flex items-center gap-2">
                {isShareApiSupported && (
                    <button onClick={handleNativeShare} aria-label="Share via your device" className={`flex items-center gap-2 py-2 px-4 rounded-md text-sm font-semibold bg-slate-800 text-white hover:bg-slate-600 ${actionButtonClasses}`}>
                        <ShareIcon />
                        Share
                    </button>
                )}
                <button onClick={() => handleSocialShare('twitter')} aria-label="Share on Twitter" className={`h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-600 ${actionButtonClasses}`}><TwitterIcon /></button>
                <button onClick={() => handleSocialShare('facebook')} aria-label="Share on Facebook" className={`h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500 ${actionButtonClasses}`}><FacebookIcon /></button>
                <button onClick={() => handleSocialShare('whatsapp')} aria-label="Share on WhatsApp" className={`h-10 w-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-400 ${actionButtonClasses}`}><WhatsAppIcon /></button>
            </div>
        </div>
      </div>
    </div>
  );
};