export interface Question {
  question_text: string;
  options?: string[];
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

export interface FormState {
    institutionName: string;
    grade: string;
    medium: string;
    subject: string;
    chapters: string[];
    difficulty: 'Easy' | 'Medium' | 'Hard';
    totalMarks: number;
    mcqCount: number;
    trueFalseCount: number;
    fillInTheBlanksCount: number;
    shortAnswerCount: number;
    longAnswerCount: number;
}