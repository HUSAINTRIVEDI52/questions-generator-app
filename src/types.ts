import type { QuestionType } from './constants';

// Re-export QuestionType so it can be imported from this module by other components.
export type { QuestionType } from './constants';

export interface Question {
  id: string;
  chapter: string; // The source chapter of the question
  question_text: string;
  diagram_svg?: string; // An SVG string for geometric diagrams
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
    // Common fields
    institutionName: string;
    title: string;
    grade: string;
    medium: string;
    subject: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    totalMarks: number;

    // Mode specific fields
    generationMode: 'simple' | 'advanced';
    
    // For Simple Mode
    chapters: string[];
    simpleModeDistribution: MarksDistribution[];

    // For Advanced Mode
    chapterConfigs: ChapterQuestionConfig[];
}
