import type { FormState, Question, QuestionPaper } from '../types';

const createSimpleGenerationPrompt = (formData: FormState): string => {
  const { 
    institutionName, title, grade, medium, subject, chapters, difficulty, totalMarks, 
    mcqCount, mcqMarks, shortAnswerCount, shortAnswerMarks, longAnswerCount, longAnswerMarks, 
    trueFalseCount, trueFalseMarks, fillInTheBlanksCount, fillInTheBlanksMarks, 
    oneWordAnswerCount, oneWordAnswerMarks, matchTheFollowingCount, matchTheFollowingMarks, 
    mapQuestionCount, mapQuestionMarks, pointwiseQuestionCount, pointwiseQuestionMarks,
    diagramQuestionCount, diagramQuestionMarks
  } = formData;

  // UPDATE: Replaced graph with map and pointwise questions.
  const questionBreakdown = [
    { name: 'Multiple Choice Questions (MCQs)', count: mcqCount, marks: mcqMarks },
    { name: 'True/False Questions', count: trueFalseCount, marks: trueFalseMarks },
    { name: 'Fill in the Blanks Questions', count: fillInTheBlanksCount, marks: fillInTheBlanksMarks },
    { name: 'One Word Answer Questions', count: oneWordAnswerCount, marks: oneWordAnswerMarks },
    { name: 'Short Answer Questions (2-3 sentences)', count: shortAnswerCount, marks: shortAnswerMarks },
    { name: 'Long Answer Questions (1-2 paragraphs)', count: longAnswerCount, marks: longAnswerMarks },
    { name: 'Match the Following Questions', count: matchTheFollowingCount, marks: matchTheFollowingMarks },
    { name: 'Map-based Questions (Social Science only)', count: mapQuestionCount, marks: mapQuestionMarks },
    { name: 'Point-wise Questions', count: pointwiseQuestionCount, marks: pointwiseQuestionMarks },
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
    1.  **Question Depth and Complexity:** The complexity of the question and the expected length/detail of the answer MUST be proportional to the marks allocated. A 5-mark question should require a more detailed and comprehensive answer than a 3-mark question. For 'Point-wise' questions, the number of points expected in the answer should align with the marks (e.g., a 3-mark question might ask for 3 points).
    2.  **Section Titles with Marks:** The \`section_title\` MUST be descriptive and include the total marks for that section. If all questions in a section have the same marks, also specify the marks per question. Examples: 'Section A: Multiple Choice Questions (Total Marks: 10 | 1 Mark Each)' or 'Section B: Short Answer Questions (Total Marks: 15)'.
    3.  **Generate Exact Counts & Marks:** Create the exact number of questions requested for each type with the specified marks. Group them into distinct sections.
    4.  **Strict Total Marks Adherence:** The sum of marks for all questions MUST equal the **Total Marks**.
    5.  **Content Source:** Questions should be drawn from the list of chapters provided.
    6.  **Source Chapter Attribution:** For EACH question generated, you MUST include the 'chapter' property in the JSON, specifying which of the source chapters it was derived from. The chapter name must be an exact match from the input.
    7.  **Question Type Formatting:**
        - **MCQs:** Provide exactly 4 distinct options.
        - **True/False:** The answer must be 'True' or 'False'.
        - **Fill in the Blanks:** Provide the missing word(s) as the answer.
        - **One Word Answer:** Provide a concise one or two-word answer.
        - **Match the Following:** Provide two arrays of strings in 'match_a' and 'match_b' properties. The 'correct_answer' should be a string mapping items, e.g., '1-c, 2-a, 3-d'.
        - **Statistics Questions (Mathematics):** For questions from the 'Statistics' chapter involving data sets (e.g., calculating mean, median, mode), you MUST present the data in a clear, multi-line, text-based table within the \`question_text\`. Do not use comma-separated lists for tabular data. Example format:
          "Calculate the mean for the following data:
          Class Interval | Frequency
          ----------------|-----------
          0-10            | 7
          10-20           | 10
          20-30           | 15"
        - **Map-based Questions (Social Science only):** Generate a question that asks the student to locate and label a set of items on an outline map (e.g., "India" or "World", as relevant). The \`question_text\` MUST start with a directive like "Locate and label the following on an outline map of India:" followed by a numbered or bulleted list of items. The number of items in the list MUST be equal to the marks allocated for this question. The \`correct_answer\` should provide the correct location for each item in the list, formatted clearly (e.g., "1. Black Soil - Deccan Plateau region, 2. Periyar Sanctuary - Kerala, ..."). You do not need to generate a visual map.
        - **Point-wise Questions:** Frame questions that require an answer in distinct points. These should be modeled after typical textbook questions asking for reasons, effects, characteristics, types, advantages, disadvantages, or to state/list specific items. For example: "State the technical reforms in the Indian agricultural sector," "Explain the main forms of unemployment," or "List the rights of children given in the constitution." The model answer must be structured as a numbered or bulleted list. The number of points in the answer should directly correspond to the marks allocated (e.g., a 4-mark question must have at least 4 distinct points in the answer).
        - **Diagram Questions (Mathematics):** For topics like Geometry, Mensuration, or Data Handling (e.g., pie charts), you MUST generate a valid SVG string for the 'diagram_svg' property. The SVG must be clear, well-formatted, and accurately represent the problem. For pie charts, ensure all sectors are clearly labeled. **Crucially, ensure that all text labels (like angle measures, side lengths, or percentages) are placed clearly and do not overlap with lines, arcs, or other labels.** The SVG should be responsive by setting a viewBox and not fixing width and height attributes. It should not have a fixed background color (transparent is best) and should use 'currentColor' for strokes and fills to ensure it adapts to the UI's theme.
        - **Short/Long Answers:** Provide a model correct answer that reflects the depth required by the allocated marks.
    8.  **Output Format:** The entire output must be in a single valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown, or explanations before or after the JSON object.
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
    1.  **Question Depth and Complexity:** The complexity of the question and the expected length/detail of the answer MUST be proportional to the marks allocated. A 5-mark question should require a more detailed and comprehensive answer than a 3-mark question. For 'Point-wise' questions, the number of points expected in the answer should align with the marks (e.g., a 3-mark question might ask for 3 points).
    2.  **Section Titles with Marks:** The \`section_title\` MUST be descriptive and include the total marks for that section. If all questions in a section have the same marks, also specify the marks per question. Examples: 'Section A: Multiple Choice Questions (Total Marks: 10 | 1 Mark Each)' or 'Section B: Short Answer Questions (Total Marks: 15)'.
    3.  **Strict Chapter Adherence:** For each chapter listed above, you MUST generate the specified number and type of questions using content ONLY from that specific chapter. Do not mix content from different chapters.
    4.  **Source Chapter Attribution:** For EACH question generated, you MUST include the 'chapter' property in the JSON, specifying which of the source chapters it was derived from. The chapter name must be an exact match from the input.
    5.  **Accurate Marks:** The marks for each question must be exactly as specified. The sum of marks for all questions must equal the **Total Marks**.
    6.  **Logical Sectioning:** Group the generated questions into logical sections (e.g., 'Section A: MCQs'). You can group questions of the same type from different chapters into the same section.
    7.  **Question Type Formatting:**
        - **MCQs:** Provide exactly 4 distinct options.
        - **True/False:** The answer must be 'True' or 'False'.
        - **Fill in the Blanks:** Provide the missing word(s) as the answer.
        - **One Word Answer:** Provide a concise one or two-word answer.
        - **Match the Following:** Provide two arrays of strings in 'match_a' and 'match_b' properties. The 'correct_answer' should be a string mapping items, e.g., '1-c, 2-a, 3-d'.
        - **Statistics Questions (Mathematics):** For questions from the 'Statistics' chapter involving data sets (e.g., calculating mean, median, mode), you MUST present the data in a clear, multi-line, text-based table within the \`question_text\`. Do not use comma-separated lists for tabular data. Example format:
          "Calculate the mean for the following data:
          Class Interval | Frequency
          ----------------|-----------
          0-10            | 7
          10-20           | 10
          20-30           | 15"
        - **Map-based Questions (Social Science only):** Generate a question that asks the student to locate and label a set of items on an outline map (e.g., "India" or "World", as relevant). The \`question_text\` MUST start with a directive like "Locate and label the following on an outline map of India:" followed by a numbered or bulleted list of items. The number of items in the list MUST be equal to the marks allocated for this question. The \`correct_answer\` should provide the correct location for each item in the list, formatted clearly (e.g., "1. Black Soil - Deccan Plateau region, 2. Periyar Sanctuary - Kerala, ..."). You do not need to generate a visual map.
        - **Point-wise Questions:** Frame questions that require an answer in distinct points. These should be modeled after typical textbook questions asking for reasons, effects, characteristics, types, advantages, disadvantages, or to state/list specific items. For example: "State the technical reforms in the Indian agricultural sector," "Explain the main forms of unemployment," or "List the rights of children given in the constitution." The model answer must be structured as a numbered or bulleted list. The number of points in the answer should directly correspond to the marks allocated (e.g., a 4-mark question must have at least 4 distinct points in the answer).
        - **Diagram Questions (Mathematics):** For topics like Geometry, Mensuration, or Data Handling (e.g., pie charts), you MUST generate a valid SVG string for the 'diagram_svg' property. The SVG must be clear, well-formatted, and accurately represent the problem. For pie charts, ensure all sectors are clearly labeled. **Crucially, ensure that all text labels (like angle measures, side lengths, or percentages) are placed clearly and do not overlap with lines, arcs, or other labels.** The SVG should be responsive by setting a viewBox and not fixing width and height attributes. It should not have a fixed background color (transparent is best) and should use 'currentColor' for strokes and fills to ensure it adapts to the UI's theme.
        - **Short/Long Answers:** Provide a model correct answer that reflects the depth required by the allocated marks.
    8.  **Output Format:** The entire output must be in a single valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown, or explanations before or after the JSON object.
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
    - **Depth:** The complexity and expected answer detail MUST match the allocated marks.

    **Instructions:**
    1.  Generate ONE new question that meets all the above specifications, ensuring it is sourced from the specified chapter.
    2.  The new question's topic or focus must be different from the original. Do not just rephrase the old question.
    3.  In the JSON response, you MUST set the 'chapter' field to "${sourceChapter}".
    4.  If it is a diagram-based question, ensure labels do not overlap with diagram lines.
    5.  The response must be a single, valid JSON object that adheres to the provided schema for a single question. Do not include any extra text or markdown.
    `;
};