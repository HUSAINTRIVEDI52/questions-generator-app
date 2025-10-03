// FIX: Consolidate QuestionType here to be the single source of truth.
export type QuestionType = 'MCQ' | 'Short Answer' | 'Long Answer' | 'True/False' | 'Fill in the Blanks' | 'One Word Answer' | 'Match the Following' | 'Map Question' | 'Point-wise Question' | 'Diagram Question';

export interface Question {
  id: string; // FIX: Add unique identifier for questions
  question_text: string;
  options?: string[];
  correct_answer: string;
  marks: number;
  chapter?: string; // FIX: Add source chapter for regeneration and tracking
  diagram_svg?: string; // FIX: Add property for SVG diagrams (Math)
  match_a?: string[]; // FIX: Add property for "Match the Following"
  match_b?: string[]; // FIX: Add property for "Match the Following"
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

// FIX: Define and export ChapterQuestionConfig for advanced generation mode.
export interface ChapterQuestionConfig {
    chapter: string;
    enabled: boolean;
    distribution: MarksDistribution[];
}

export interface FormState {
    institutionName: string;
    title: string; // FIX: Add title for the paper
    grade: string;
    medium: string;
    subject: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    totalMarks: number;
    generationMode: 'simple' | 'advanced'; // FIX: Add generation mode
    
    // Simple mode fields
    chapters: string[];
    simpleModeDistribution: MarksDistribution[];
    
    // Advanced mode fields
    chapterConfigs: ChapterQuestionConfig[]; // FIX: Add configs for advanced mode
}
