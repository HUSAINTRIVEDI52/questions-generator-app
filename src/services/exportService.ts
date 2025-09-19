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

const svgToPngBlob = (svgString: string, desiredWidth: number = 400): Promise<{ buffer: ArrayBuffer, width: number, height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();

        // Add a white background for the export by wrapping the original SVG content
        const doc = new DOMParser().parseFromString(svgString, "image/svg+xml");
        const svgElement = doc.documentElement;
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        const originalContent = svgElement.innerHTML;
        svgElement.innerHTML = `<rect x="0" y="0" width="100%" height="100%" fill="white"></rect>${originalContent}`;
        const finalSvgString = new XMLSerializer().serializeToString(svgElement);

        const svgBlob = new Blob([finalSvgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const aspectRatio = (img.height > 0 && img.width > 0) ? img.height / img.width : 1;
            const canvas = document.createElement('canvas');
            canvas.width = desiredWidth;
            canvas.height = desiredWidth * aspectRatio;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
                URL.revokeObjectURL(url);
                if (blob) {
                    try {
                        const buffer = await blob.arrayBuffer();
                        resolve({ buffer, width: canvas.width, height: canvas.height });
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('Canvas to Blob conversion failed'));
                }
            }, 'image/png');
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };

        img.src = url;
    });
};


export const exportToDocx = async (paper: QuestionPaper): Promise<void> => {
    const { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, WidthType, ImageRun } = docx;

    // FIX: Use `docx.Paragraph` and `docx.Table` to correctly reference the types from the imported module, as `Paragraph` and `Table` in this scope are values (classes).
    const docChildren: (docx.Paragraph | docx.Table)[] = [];

    // Header information
    docChildren.push(new Paragraph({ text: paper.institution_name, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }));
    docChildren.push(new Paragraph({ text: paper.title, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }));
    docChildren.push(new Paragraph({ text: `${paper.grade} - ${paper.subject}`, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.CENTER }));
    docChildren.push(new Paragraph({
        children: [
            new TextRun(`Total Marks: ${paper.total_marks}`),
            new TextRun({ text: `\tDuration: ${paper.duration_minutes} minutes`, break: 1 }),
        ],
        alignment: AlignmentType.CENTER,
        border: { top: { size: 4, style: "single" }, bottom: { size: 4, style: "single" } },
        spacing: { before: 200, after: 400 },
    }));

    // Process sections and questions asynchronously
    for (const section of paper.sections) {
        docChildren.push(new Paragraph({
            text: section.section_title,
            heading: HeadingLevel.HEADING_2,
            style: "wellSpaced",
            border: { bottom: { color: "auto", space: 1, style: "single", size: 6 } },
            spacing: { after: 200 }
        }));

        for (const [qIndex, q] of section.questions.entries()) {
            docChildren.push(new Paragraph({
                children: [
                    new TextRun({ text: `${qIndex + 1}. `, bold: true }),
                    new TextRun(q.question_text),
                ],
                spacing: { after: 100 },
            }));

            // Diagram handling
            if (q.diagram_svg) {
                try {
                    const { buffer, width, height } = await svgToPngBlob(q.diagram_svg);
                    // FIX: The 'type' property for ImageRun must be a valid image format. Since the buffer contains PNG data, "png" is the correct value. For docx v9+, this property may not be required when using a buffer, but providing it ensures compatibility.
                    const image = new ImageRun({
                        type: "png",
                        data: buffer,
                        transformation: { width, height },
                    });
                    docChildren.push(new Paragraph({ children: [image], alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 } }));
                } catch (error) {
                    console.error("Failed to convert SVG to PNG for DOCX:", error);
                    docChildren.push(new Paragraph({ children: [new TextRun({ text: "[Diagram could not be rendered]", italics: true, color: "FF0000" })] }));
                }
            }
            
            // Options for MCQs
            if (q.options) {
                q.options.forEach((option, optIndex) => {
                    docChildren.push(new Paragraph({
                        children: [new TextRun(`\t${String.fromCharCode(97 + optIndex)}) ${option}`)],
                        spacing: { after: 50 },
                    }));
                });
            }

            // Table for Match the Following
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
                docChildren.push(table);
            }

            // Answer
            docChildren.push(new Paragraph({
                 children: [
                     new TextRun({ text: `Answer: ${q.correct_answer}`, bold: true, color: "4CAF50" }),
                 ],
                 spacing: { before: 100, after: 200 },
            }));
        }
    }
    
    const doc = new Document({ sections: [{ children: docChildren }] });

    const blob = await Packer.toBlob(doc);
    saveFile(blob, `${paper.subject}_${paper.grade}_Question_Paper.docx`);
};
