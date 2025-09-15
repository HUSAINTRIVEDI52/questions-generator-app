import type { QuestionPaper } from '../types';
import { jsPDF } from 'jspdf';
import * as docx from 'docx';

const saveFile = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

export const exportToDocx = async (paper: QuestionPaper): Promise<void> => {
    const { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

    const sections = paper.sections.flatMap(section => {
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
            
            // Add a paragraph for the answer, even if empty, to maintain spacing.
            // In a real scenario, you might conditionally add this based on an 'includeAnswers' flag.
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
                new Paragraph({ text: `${paper.grade} - ${paper.subject}`, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER }),
                new Paragraph({
                    children: [
                        new TextRun(`Total Marks: ${paper.total_marks}`),
                        new TextRun({ text: `\tDuration: ${paper.duration_minutes} minutes`, break: 1 }),
                    ],
                    alignment: AlignmentType.CENTER,
                    border: { top: { size: 4, style: "single" }, bottom: { size: 4, style: "single" } },
                    spacing: { before: 200, after: 400 },
                }),
                ...sections.flat()
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveFile(blob, `${paper.subject}_${paper.grade}_Question_Paper.docx`);
};

export const exportToPdf = () => {
    // A simplified alternative to window.print() for direct PDF generation.
    // This is less accurate for complex layouts than printing from HTML but is a direct export.
    const printableElement = document.getElementById('printable-paper');
    if (printableElement) {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        doc.html(printableElement, {
            callback: function (doc) {
                doc.save('question-paper.pdf');
            },
            x: 15,
            y: 15,
            width: 180, // Target width in mm
            windowWidth: printableElement.scrollWidth
        });
    }
};
