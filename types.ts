
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Fluency';

export interface Language {
  id: string;
  name: string;
  flag: string;
  description: string;
  nativeName: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: CEFRLevel;
  type: 'vocabulary' | 'grammar' | 'exercise' | 'fluency';
  xp: number;
}

export interface UserProgress {
  selectedLanguage: string | null;
  xp: number;
  level: number;
  streak: number;
  completedLessons: string[];
  skills: {
    reading: number;
    writing: number;
    speaking: number;
    listening: number;
  };
}

export interface ExerciseItem {
  question: string;
  options?: string[];
  answer: string;
  type: 'multiple-choice' | 'fill-in-blank' | 'translation' | 'speaking';
  context?: string;
  imagePrompt?: string;
}
