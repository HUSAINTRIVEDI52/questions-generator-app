import type { FormState, Question, QuestionPaper } from '../types';

const createSimpleGenerationPrompt = (formData: FormState): string => {
  const { institutionName, title, grade, medium, subject, chapters, difficulty, totalMarks, mcqCount, shortAnswerCount, longAnswerCount } = formData;
  return `
    You are an expert academic content creator specializing in generating high-quality question papers for students under the Gujarat State Education Board (GSEB) curriculum.
    Your task is to create a complete and well-structured question paper based on the following specifications.
    The questions must be relevant to the latest and most current GSEB curriculum for the specified grade, medium, subject, and chapters.

    **Paper Details:**
    - **Institution Name:** ${institutionName}
    - **Paper Title:** ${title}
    - **Grade:** ${grade}
    - **Medium:** ${medium}
    - **Subject:** ${subject}
    - **Chapters to cover:** ${chapters.join(', ')}
    - **Difficulty Level:** ${difficulty}
    - **Total Marks:** ${totalMarks}

    **Required Question Breakdown:**
    - Multiple Choice Questions (MCQs): ${mcqCount}
    - Short Answer Questions (2-3 sentences): ${shortAnswerCount}
    - Long Answer Questions (1-2 paragraphs): ${longAnswerCount}

    **Core Instructions:**
    1.  **Generate Exact Counts:** Create the exact number of questions requested for each type. Group them into distinct sections (e.g., 'Section A: MCQs').
    2.  **Distribute Marks:** Distribute the ${totalMarks} marks logically across all generated questions. The sum of marks for all questions MUST equal the **Total Marks**.
    3.  **Content Source:** The questions should be drawn from the list of chapters provided.
    4.  **Question Type Formatting:**
        - **MCQs:** Provide exactly 4 distinct options.
        - **Short/Long Answers:** Provide a model correct answer.
    5.  **Output Format:** The entire output must be in a single valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown, or explanations before or after the JSON object.
  `;
};


const createAdvancedGenerationPrompt = (formData: FormState): string => {
  const { institutionName, title, grade, medium, subject, chapterConfigs, difficulty, totalMarks } = formData;

  const chapterDistributionText = chapterConfigs
    .filter(config => config.enabled && config.distribution.some(d => d.count > 0))
    .map(config => {
      const distributionList = config.distribution
        .filter(dist => dist.count > 0)
        .map(dist => `- ${dist.count} ${dist.type} question(s), each worth ${dist.marks} marks.`)
        .join('\n');
      return `For Chapter "${config.chapter}":\n${distributionList}`;
    })
    .join('\n\n');

  return `
    You are an expert academic content creator specializing in generating high-quality question papers for students under the Gujarat State Education Board (GSEB) curriculum.
    Your task is to create a complete and well-structured question paper based on the following chapter-specific instructions.

    **Paper Details:**
    - **Institution Name:** ${institutionName}
    - **Paper Title:** ${title}
    - **Grade:** ${grade}
    - **Medium:** ${medium}
    - **Subject:** ${subject}
    - **Difficulty Level:** ${difficulty}
    - **Total Marks:** ${totalMarks}

    **Required Question Breakdown (Chapter-wise):**
    ${chapterDistributionText}

    **Core Instructions:**
    1.  **Strict Chapter Adherence:** For each chapter listed above, you MUST generate the specified number and type of questions using content ONLY from that specific chapter. Do not mix content from different chapters.
    2.  **Accurate Marks:** The marks for each question must be exactly as specified in the breakdown. The sum of marks for all questions must equal the **Total Marks**.
    3.  **Logical Sectioning:** Group the generated questions into logical sections (e.g., 'Section A: Multiple Choice Questions', 'Section B: Short Answers'). You can group questions of the same type from different chapters into the same section.
    4.  **Question Type Formatting:**
        - **MCQs:** Provide exactly 4 distinct options.
        - **True/False:** The answer must be 'True' or 'False'.
        - **Fill in the Blanks:** Provide the missing word(s) as the answer.
        - **One Word Answer:** Provide a concise one or two-word answer.
        - **Match the Following:** Provide two arrays of strings in 'match_a' and 'match_b' properties. The 'correct_answer' should be a string mapping items, e.g., '1-c, 2-a, 3-d'.
        - **Graph Questions (Social Science):** Describe a data set or scenario in 'question_text' and ask an analytical question. You do not need to generate a visual graph.
        - **Short/Long Answers:** Provide a model correct answer.
    5.  **Output Format:** The entire output must be in a single valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown, or explanations before or after the JSON object.
    `;
};

export const createGenerationPrompt = (formData: FormState): string => {
    if (formData.generationMode === 'simple') {
        return createSimpleGenerationPrompt(formData);
    }
    return createAdvancedGenerationPrompt(formData);
};


const getQuestionStructurePrompt = (question: Question): string => {
    if (question.options) return 'It must be a Multiple Choice Question with exactly 4 options.';
    if (question.match_a) return 'It must be a "Match the Following" question with two corresponding lists.';
    if (question.marks <= 1) return 'It must be a "One Word Answer", "True/False", or "Fill in the Blanks" type question.';
    if (question.marks <= 3) return 'It must be a "Short Answer" question requiring a 2-3 sentence answer.';
    return 'It must be a "Long Answer" question requiring a 1-2 paragraph answer.';
}

export const createRegenerationPrompt = (
    questionToReplace: Question,
    paperContext: Pick<QuestionPaper, 'grade' | 'medium' | 'subject' | 'difficulty'>,
    chapters: string[]
): string => {
    // This prompt now specifies that the new question can come from ANY of the originally selected chapters.
    return `
    You are an expert academic content creator for the GSEB curriculum.
    Your task is to generate a SINGLE new question to replace an existing one.
    The new question MUST be different from the original one provided below.

    **Original Question Text to Replace:** "${questionToReplace.question_text}"

    **Specifications for the NEW question:**
    - Grade: ${paperContext.grade}
    - Medium: ${paperContext.medium}
    - Subject: ${paperContext.subject}
    - Content Source: The new question can be from ANY of the following chapters: ${chapters.join(', ')}
    - Difficulty Level: ${paperContext.difficulty}
    - Marks: ${questionToReplace.marks}
    - Structure: ${getQuestionStructurePrompt(questionToReplace)}

    **Instructions:**
    1.  Generate ONE new question that meets all the above specifications.
    2.  Critically, the new question's topic or focus must be different from the original question text provided. Do not just rephrase the old question.
    3.  The response must be a single, valid JSON object that adheres to the provided schema for a single question. Do not include any extra text or markdown.
    `;
};