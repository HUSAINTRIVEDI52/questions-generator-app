import { GoogleGenAI, Type } from "@google/genai";
import type { FormState, QuestionPaper, Question } from '../types';
import { createGenerationPrompt, createRegenerationPrompt } from "../utils/promptFactory";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const baseQuestionProperties = {
  chapter: { 
    type: Type.STRING,
    description: "The name of the chapter this question is sourced from. This MUST match one of the chapters provided in the prompt's context."
  },
  question_text: { type: Type.STRING },
  diagram_svg: { 
    type: Type.STRING,
    description: "For Diagram-based questions in Mathematics, this MUST contain a valid, self-contained SVG string representing the geometric diagram. The SVG should be responsive by setting a viewBox and not fixing width and height attributes. It should have a transparent background and use 'currentColor' for strokes and fills to adapt to theming. Omit this property for all other question types." 
  },
  options: { 
      type: Type.ARRAY,
      description: "Array of 4 option strings for MCQs. Omit for other question types.",
      items: { type: Type.STRING } 
  },
  match_a: {
      type: Type.ARRAY,
      description: "For 'Match the Following' questions, this is Column A. Omit for other types.",
      items: { type: Type.STRING }
  },
  match_b: {
      type: Type.ARRAY,
      description: "For 'Match the Following' questions, this is Column B. Omit for other types.",
      items: { type: Type.STRING }
  },
  correct_answer: { type: Type.STRING, description: "The correct answer. For MCQs, it should match one of the options exactly. For 'Match the Following', use format '1-c, 2-a, ...'." },
  marks: { type: Type.INTEGER }
};

const paperSchema = {
  type: Type.OBJECT,
  properties: {
    institution_name: { type: Type.STRING },
    title: { type: Type.STRING },
    grade: { type: Type.STRING },
    medium: { type: Type.STRING },
    subject: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    total_marks: { type: Type.INTEGER },
    duration_minutes: { type: Type.INTEGER },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          section_title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: baseQuestionProperties,
              required: ["chapter", "question_text", "correct_answer", "marks"]
            }
          }
        },
        required: ["section_title", "questions"]
      }
    }
  },
  required: ["institution_name", "title", "grade", "medium", "subject", "difficulty", "total_marks", "duration_minutes", "sections"]
};

const singleQuestionSchema = {
  type: Type.OBJECT,
  properties: baseQuestionProperties,
  required: ["chapter", "question_text", "correct_answer", "marks"]
};


export const generateQuestionPaper = async (formData: FormState): Promise<QuestionPaper> => {
  const prompt = createGenerationPrompt(formData);

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: paperSchema,
            temperature: 0.7,
        }
    });
    
    const jsonText = (response.text ?? '').trim();
    if (!jsonText) {
       throw new Error("The model returned an empty response. It might be overloaded. Please try again in a moment.");
    }
    const parsedPaper: QuestionPaper = JSON.parse(jsonText);
    
    // Add unique IDs to each question for state management (e.g., regeneration)
    parsedPaper.sections.forEach(section => {
      section.questions.forEach(question => {
        question.id = crypto.randomUUID();
      });
    });

    return parsedPaper;

  } catch (error) {
    console.error("Error generating question paper:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("The generation was blocked due to safety policies. Please try a different prompt.");
    }
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the question paper from the model. The response was not valid JSON.");
    }
    throw new Error("Failed to generate question paper. The AI model might be overloaded. Please try again in a moment.");
  }
};

export const regenerateQuestion = async (
  questionToReplace: Question,
  paperContext: Pick<QuestionPaper, 'grade' | 'medium' | 'subject' | 'difficulty'>,
  chapters: string[]
): Promise<Omit<Question, 'id'>> => {
  const prompt = createRegenerationPrompt(questionToReplace, paperContext, chapters);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: singleQuestionSchema,
        temperature: 0.85, // Higher temp for more creative/different regeneration
      }
    });

    const jsonText = (response.text ?? '').trim();
    if (!jsonText) {
      throw new Error("The model returned an empty response for regeneration.");
    }
    
    const newQuestionData: Omit<Question, 'id'> = JSON.parse(jsonText);
    
    // Ensure the marks of the new question match the original
    newQuestionData.marks = questionToReplace.marks;

    return newQuestionData;
  } catch (error) {
     console.error("Error regenerating question:", error);
     if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("The regeneration was blocked due to safety policies. Please try a different prompt.");
    }
    throw new Error("Failed to regenerate the question. The AI model might be unavailable.");
  }
};