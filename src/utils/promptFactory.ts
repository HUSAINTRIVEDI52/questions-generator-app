import type { FormState, Question, QuestionPaper } from '../types';

const createSimpleGenerationPrompt = (formData: FormState): string => {
  const { 
    institutionName, title, grade, medium, subject, chapters, difficulty, totalMarks, 
    mcqCount, mcqMarks, shortAnswerCount, shortAnswerMarks, longAnswerCount, longAnswerMarks, 
    trueFalseCount, trueFalseMarks, fillInTheBlanksCount, fillInTheBlanksMarks, 
    oneWordAnswerCount, oneWordAnswerMarks, matchTheFollowingCount, matchTheFollowingMarks, 
    graphQuestionCount, graphQuestionMarks, diagramQuestionCount, diagramQuestionMarks
  } = formData;

  const questionBreakdown = [
    { name: 'Multiple Choice Questions (MCQs)', count: mcqCount, marks: mcqMarks },
    { name: 'True/False Questions', count: trueFalseCount, marks: trueFalseMarks },
    { name: 'Fill in the Blanks Questions', count: fillInTheBlanksCount, marks: fillInTheBlanksMarks },
    { name: 'One Word Answer Questions', count: oneWordAnswerCount, marks: oneWordAnswerMarks },
    { name: 'Short Answer Questions (2-3 sentences)', count: shortAnswerCount, marks: shortAnswerMarks },
    { name: 'Long Answer Questions (1-2 paragraphs)', count: longAnswerCount, marks: longAnswerMarks },
    { name: 'Match the Following Questions', count: matchTheFollowingCount, marks: matchTheFollowingMarks },
    { name: 'Graph-based Questions (Social Science only)', count: graphQuestionCount, marks: graphQuestionMarks },
    { name: 'Diagram-based Questions (Mathematics only)', count: diagramQuestionCount, marks: diagramQuestionMarks }
  ]
  .filter(q => q.count > 0)
  .map(q => `- ${q.name}: ${q.count} questions, each worth ${q.marks} marks.`)
  .join('\n');


  return `
    You are an expert academic content creator specializing in generating high-quality question papers for students under the Gujarat State Education Board (GSEB) curriculum.
    **Crucial Instruction on Curriculum:** All questions MUST be strictly based on the **latest updated GSEB/NCERT curriculum** for the specified grade and subject. Do not use outdated concepts or questions from previous syllabus versions. Adherence to the current, official curriculum is mandatory.
    Your task is to create a complete and well-structured question paper based on the following specifications.

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
    ${questionBreakdown}

    **Core Instructions:**
    1.  **Section Titles with Marks:** The \`section_title\` MUST be descriptive and include the total marks for that section. If all questions in a section have the same marks, also specify the marks per question. Examples: 'Section A: Multiple Choice Questions (Total Marks: 10 | 1 Mark Each)' or 'Section B: Short Answer Questions (Total Marks: 15)'.
    2.  **Generate Exact Counts & Marks:** Create the exact number of questions requested for each type with the specified marks. Group them into distinct sections.
    3.  **Strict Total Marks Adherence:** The sum of marks for all questions MUST equal the **Total Marks**.
    4.  **Content Source:** Questions should be drawn from the list of chapters provided.
    5.  **Source Chapter Attribution:** For EACH question generated, you MUST include the 'chapter' property in the JSON, specifying which of the source chapters it was derived from. The chapter name must be an exact match from the input.
    6.  **Question Type Formatting:**
        - **MCQs:** Provide exactly 4 distinct options.
        - **True/False:** The answer must be 'True' or 'False'.
        - **Fill in the Blanks:** Provide the missing word(s) as the answer.
        - **One Word Answer:** Provide a concise one or two-word answer.
        - **Match the Following:** Provide two arrays of strings in 'match_a' and 'match_b' properties. The 'correct_answer' should be a string mapping items, e.g., '1-c, 2-a, 3-d'.
        - **Statistics Questions (Mathematics):** When generating questions for the 'Statistics' chapter, if the question asks to calculate mean, median, or mode, you MUST present the data in a clear text-based table within the \`question_text\`.
        - **Graph Questions (Social Science):** Describe a data set or scenario in 'question_text' and ask an analytical question. You do not need to generate a visual graph.
        - **Diagram Questions (Mathematics):** For topics like Geometry, Mensuration, or Data Handling (e.g., pie charts), you MUST generate a valid SVG string for the 'diagram_svg' property. The SVG must be clear, well-formatted, and accurately represent the problem. For pie charts, ensure all sectors are clearly labeled. **Crucially, ensure that all text labels (like angle measures, side lengths, or percentages) are placed clearly and do not overlap with lines, arcs, or other labels.** The SVG should be responsive by setting a viewBox and not fixing width and height attributes. It should not have a fixed background color (transparent is best) and should use 'currentColor' for strokes and fills to ensure it adapts to the UI's theme.
        - **Short/Long Answers:** Provide a model correct answer.
    7.  **Output Format:** The entire output must be in a single valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown, or explanations before or after the JSON object.
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
    **Crucial Instruction on Curriculum:** All questions MUST be strictly based on the **latest updated GSEB/NCERT curriculum** for the specified grade and subject. Do not use outdated concepts or questions from previous syllabus versions. Adherence to the current, official curriculum is mandatory.
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
    1.  **Section Titles with Marks:** The \`section_title\` MUST be descriptive and include the total marks for that section. If all questions in a section have the same marks, also specify the marks per question. Examples: 'Section A: Multiple Choice Questions (Total Marks: 10 | 1 Mark Each)' or 'Section B: Short Answer Questions (Total Marks: 15)'.
    2.  **Strict Chapter Adherence:** For each chapter listed above, you MUST generate the specified number and type of questions using content ONLY from that specific chapter. Do not mix content from different chapters.
    3.  **Source Chapter Attribution:** For EACH question generated, you MUST include the 'chapter' property in the JSON, specifying which of the source chapters it was derived from. The chapter name must be an exact match from the input.
    4.  **Accurate Marks:** The marks for each question must be exactly as specified. The sum of marks for all questions must equal the **Total Marks**.
    5.  **Logical Sectioning:** Group the generated questions into logical sections (e.g., 'Section A: MCQs'). You can group questions of the same type from different chapters into the same section.
    6.  **Question Type Formatting:**
        - **MCQs:** Provide exactly 4 distinct options.
        - **True/False:** The answer must be 'True' or 'False'.
        - **Fill in the Blanks:** Provide the missing word(s) as the answer.
        - **One Word Answer:** Provide a concise one or two-word answer.
        - **Match the Following:** Provide two arrays of strings in 'match_a' and 'match_b' properties. The 'correct_answer' should be a string mapping items, e.g., '1-c, 2-a, 3-d'.
        - **Statistics Questions (Mathematics):** When generating questions for the 'Statistics' chapter, if the question asks to calculate mean, median, or mode, you MUST present the data in a clear text-based table within the \`question_text\`.
        - **Graph Questions (Social Science):** Describe a data set or scenario in 'question_text' and ask an analytical question. You do not need to generate a visual graph.
        - **Diagram Questions (Mathematics):** For topics like Geometry, Mensuration, or Data Handling (e.g., pie charts), you MUST generate a valid SVG string for the 'diagram_svg' property. The SVG must be clear, well-formatted, and accurately represent the problem. For pie charts, ensure all sectors are clearly labeled. **Crucially, ensure that all text labels (like angle measures, side lengths, or percentages) are placed clearly and do not overlap with lines, arcs, or other labels.** The SVG should be responsive by setting a viewBox and not fixing width and height attributes. It should not have a fixed background color (transparent is best) and should use 'currentColor' for strokes and fills to ensure it adapts to the UI's theme.
        - **Short/Long Answers:** Provide a model correct answer.
    7.  **Output Format:** The entire output must be in a single valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown, or explanations before or after the JSON object.
    `;
};

export const createGenerationPrompt = (formData: FormState): string => {
    if (formData.generationMode === 'simple') {
        return createSimpleGenerationPrompt(formData);
    }
    return createAdvancedGenerationPrompt(formData);
};


const getQuestionStructurePrompt = (question: Question): string => {
    if (question.diagram_svg) return 'It must be a "Diagram-based Question" requiring a geometric figure.';
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
    const sourceChapter = chapters[0]; // The new question must come from the same chapter as the original.

    return `
    You are an expert academic content creator for the GSEB curriculum.
    Your task is to generate a SINGLE new question to replace an existing one.
    The new question MUST be different from the original one provided below.

    **Original Question Text to Replace:** "${questionToReplace.question_text}"
    **Original Question's Chapter:** "${questionToReplace.chapter}"

    **Specifications for the NEW question:**
    - Grade: ${paperContext.grade}
    - Medium: ${paperContext.medium}
    - Subject: ${paperContext.subject}
    - **Content Source:** The new question MUST be from the following chapter: "${sourceChapter}"
    - Curriculum: The question must be strictly based on the latest updated GSEB/NCERT curriculum.
    - Difficulty Level: ${paperContext.difficulty}
    - Marks: ${questionToReplace.marks}
    - Structure: ${getQuestionStructurePrompt(questionToReplace)}

    **Instructions:**
    1.  Generate ONE new question that meets all the above specifications, ensuring it is sourced from the specified chapter.
    2.  The new question's topic or focus must be different from the original. Do not just rephrase the old question.
    3.  In the JSON response, you MUST set the 'chapter' field to "${sourceChapter}".
    4.  If it is a diagram-based question, ensure labels do not overlap with diagram lines.
    5.  The response must be a single, valid JSON object that adheres to the provided schema for a single question. Do not include any extra text or markdown.
    `;
};