import type { FormState } from '../types';

export const createGenerationPrompt = (formData: FormState): string => {
  const { institutionName, title, grade, medium, subject, chapters, difficulty, totalMarks, marksDistribution } = formData;

  const distributionText = marksDistribution
    .filter(dist => dist.count > 0)
    .map(dist => `- ${dist.count} ${dist.type} question(s), each worth ${dist.marks} marks.`)
    .join('\n');

  return `
    You are an expert academic content creator specializing in generating high-quality question papers for students under the Gujarat State Education Board (GSEB) curriculum.
    Your task is to create a complete and well-structured question paper based on the following specifications.
    The questions must be relevant to the latest and most current GSEB curriculum for the specified grade, medium, subject, and chapters.

    **Institution Name:** ${institutionName}
    **Paper Title:** ${title}
    **Grade:** ${grade}
    **Medium:** ${medium}
    **Subject:** ${subject}
    **Chapters to cover:** ${chapters.join(', ')}
    **Difficulty Level:** ${difficulty}
    **Total Marks:** ${totalMarks}

    **Required Question Breakdown:**
    ${distributionText}

    **Instructions:**
    1.  Generate the exact number of questions for each type as specified in the breakdown. Create distinct sections for each question type or group them logically (e.g., 'Section A: MCQs', 'Section B: Short Answers').
    2.  The marks for each question must be exactly as specified in the breakdown. The sum of marks for all questions must equal the **Total Marks**.
    3.  For MCQs, provide exactly 4 distinct options and identify the correct one. For 'True/False', the answer should be 'True' or 'False'. For 'Fill in the Blanks', provide the missing word(s).
    4.  For Short and Long Answer questions, provide a model correct answer.
    5.  Ensure the questions are diverse, high-quality, and cover the specified chapters thoroughly.
    6.  The entire output must be in a single valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown formatting, or explanations before or after the JSON object.
    `;
};
