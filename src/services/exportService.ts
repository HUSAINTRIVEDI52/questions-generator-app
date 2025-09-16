import type { QuestionPaper } from '../types';
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
    const { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, WidthType } = docx;

    const sections = paper.sections.flatMap(section => {
        const questions = section.questions.map((q, qIndex) => {
            const questionChildren = [];

            // Question Text and Marks
            questionChildren.push(new Paragraph({
                children: [
                    new TextRun({ text: `${qIndex + 1}. `, bold: true }),
                    new TextRun(q.question_text),
                    new TextRun({ text: ` [${q.marks} Marks]`, bold: true, italics: true }),
                ],
                spacing: { after: 100 },
            }));

            // MCQ Options
            if (q.options) {
                q.options.forEach((option, optIndex) => {
                    questionChildren.push(new Paragraph({
                        children: [new TextRun(`\t${String.fromCharCode(97 + optIndex)}) ${option}`)],
                        spacing: { after: 50 },
                    }));
                });
            }
            
            // Match the Following Table
            if (q.match_a && q.match_b) {
                const tableRows = q.match_a.map((itemA, index) => {
                    const itemB = q.match_b?.[index] || '';
                    return new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ text: `${index + 1}. ${itemA}` })], width: { size: 50, type: WidthType.PERCENTAGE } }),
                            new TableCell({ children: [new Paragraph({ text: `${String.fromCharCode(97 + index)}. ${itemB}` })], width: { size: 50, type: WidthType.PERCENTAGE } }),
                        ],
                    });
                });

                const table = new Table({
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Column A", bold: true })]})] }),
                                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Column B", bold: true })]})] }),
                            ],
                        }),
                        ...tableRows
                    ],
                });
                questionChildren.push(table);
            }

            // Answer
            questionChildren.push(new Paragraph({
                 children: [
                     new TextRun({ text: `Answer: ${q.correct_answer}`, bold: true, color: "4CAF50" }),
                 ],
                 spacing: { before: 100, after: 200 },
            }));

            return questionChildren;
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