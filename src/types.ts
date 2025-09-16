export interface Question {
  id: string;
  question_text: string;
  options?: string[]; // For MCQ
  match_a?: string[]; // For Match the Following - Column A
  match_b?: string[]; // For Match the Following - Column B
  correct_answer: string;
  marks: number;
}

export interface QuestionSection {
  section_title: string;
  questions: Question[];
}

export interface QuestionPaper {
  institution_name: string;
  title: string;
  grade: string;
  medium: string;
  subject: string;
  difficulty: string;
  total_marks: number;
  duration_minutes: number;
  sections: QuestionSection[];
}

export type QuestionType = 'MCQ' | 'True/False' | 'Fill in the Blanks' | 'One Word Answer' | 'Short Answer' | 'Long Answer' | 'Match the Following' | 'Graph Question';

export interface MarksDistribution {
  id: string;
  marks: number;
  count: number;
  type: QuestionType;
}

export interface ChapterQuestionConfig {
  chapter: string;
  enabled: boolean;
  distribution: MarksDistribution[];
}

export interface FormState {
    institutionName: string;
    title: string;
    grade: string;
    medium: string;
    subject: string;
    chapterConfigs: ChapterQuestionConfig[];
    difficulty: 'Easy' | 'Medium' | 'Hard';
    totalMarks: number;
}