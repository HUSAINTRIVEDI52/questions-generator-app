import { GoogleGenAI, Type } from "@google/genai";
import type { FormState, QuestionPaper } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    institution_name: { type: Type.STRING, description: "The name of the institution, e.g., 'GSEB Academy'."},
    title: { type: Type.STRING, description: "A suitable title for the question paper, e.g., 'Annual Examination'."},
    grade: { type: Type.STRING, description: "The grade or class for which the paper is intended, e.g., 'Class 10'."},
    medium: { type: Type.STRING, description: "The medium of instruction, e.g., 'English Medium'."},
    subject: { type: Type.STRING, description: "The subject of the question paper."},
    difficulty: { type: Type.STRING, description: "The difficulty level of the paper, e.g., 'Medium'."},
    total_marks: { type: Type.INTEGER, description: "The total marks for the paper."},
    duration_minutes: { type: Type.INTEGER, description: "The recommended duration in minutes, e.g., 180 for 3 hours."},
    sections: {
      type: Type.ARRAY,
      description: "An array of question sections (e.g., MCQs, Short Answers, Long Answers).",
      items: {
        type: Type.OBJECT,
        properties: {
          section_title: { type: Type.STRING, description: "Title of the section, e.g., 'Section A: Multiple Choice Questions'."},
          questions: {
            type: Type.ARRAY,
            description: "An array of questions within this section.",
            items: {
              type: Type.OBJECT,
              properties: {
                question_text: { type: Type.STRING },
                options: { 
                    type: Type.ARRAY,
                    description: "Array of 4 option strings for MCQs. Omit for other question types.",
                    items: { type: Type.STRING } 
                },
                correct_answer: { type: Type.STRING, description: "The correct answer. For MCQs, it should match one of the options exactly." },
                marks: { type: Type.INTEGER }
              },
              required: ["question_text", "correct_answer", "marks"]
            }
          }
        },
        required: ["section_title", "questions"]
      }
    }
  },
  required: ["institution_name", "title", "grade", "medium", "subject", "difficulty", "total_marks", "duration_minutes", "sections"]
};


export const generateQuestionPaper = async (formData: FormState): Promise<QuestionPaper> => {
  const { institutionName, grade, medium, subject, chapters, difficulty, totalMarks, marksDistribution } = formData;

  const questionBreakdown = marksDistribution
    .filter(row => row.count > 0)
    .map(row => `- ${row.count} ${row.type} questions of ${row.marks} marks each.`)
    .join('\n');

  const prompt = `
    You are an expert academic content creator specializing in generating high-quality question papers for students under the Gujarat State Education Board (GSEB) curriculum.
    Your task is to create a complete and well-structured question paper based on the following specifications.
    The questions must be relevant to the latest and most current GSEB curriculum for the specified grade, medium, subject, and chapters.

    **Institution Name:** ${institutionName}
    **Grade:** ${grade}
    **Medium:** ${medium}
    **Subject:** ${subject}
    **Chapters to cover:** ${chapters.join(', ')}
    **Difficulty Level:** ${difficulty}
    **Total Marks:** ${totalMarks}

    **Required Question Breakdown:**
    ${questionBreakdown}

    **Instructions:**
    1.  Generate the exact number of questions for each category specified in the breakdown. You should group questions of the same type (e.g., 'Short Answer') into one section, even if they have different marks. For example, all 'Short Answer' questions should be under a 'Section B: Short Answer Questions' heading.
    2.  The sum of marks for all generated questions MUST equal the **Total Marks** (${totalMarks}). Adhere strictly to the marks-per-question specified in the breakdown.
    3.  For MCQs, provide exactly 4 distinct options and identify the correct one. For True/False, provide the correct answer as 'True' or 'False'. For Fill in the Blanks, provide the correct word/phrase.
    4.  For other question types (Short Answer, Long Answer, etc.), provide a model correct answer.
    5.  Ensure the questions are diverse, high-quality, and cover the specified chapters thoroughly.
    6.  The entire output must be in a single valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown formatting, or explanations before or after the JSON object.
    `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.7,
        }
    });
    
    const text = response.text;
    if (text === undefined) {
      throw new Error("The model returned an empty response. This could be due to safety filters or an internal error.");
    }
    const jsonText = text.trim();

    if (!jsonText.startsWith('{') || !jsonText.endsWith('}')) {
        console.error("Received non-JSON response:", jsonText);
        throw new Error("The model returned a non-JSON response. Please try again.");
    }
    const parsedPaper: QuestionPaper = JSON.parse(jsonText);
    return parsedPaper;

  } catch (error) {
    console.error("Error generating question paper:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("The generation was blocked due to safety policies. Please try a different prompt.");
    }
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the question paper from the model. The response was not valid JSON.");
    }
    throw new Error("Failed to generate question paper. The model may have returned an invalid format or an error occurred.");
  }
};