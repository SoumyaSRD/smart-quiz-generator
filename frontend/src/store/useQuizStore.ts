import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Question {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
  category: string;
}

export interface QuizConfig {
  total_questions: number;
  marks_per_question: number;
  negative_marks: number;
  duration_minutes: number;
}

interface QuizState {
  questions: Question[];
  config: QuizConfig | null;
  userAnswers: Record<number, string>;
  timeRemaining: number;
  isSubmitted: boolean;
  
  startQuiz: (quizData: { questions: Question[]; config: QuizConfig }) => void;
  selectAnswer: (questionIndex: number, option: string) => void;
  setTimeRemaining: (time: number | ((prev: number) => number)) => void;
  submitQuiz: () => void;
  calculateResults: () => { score: number; correct: number; wrong: number; skipped: number; totalQuestions: number };
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      questions: [],
      config: null,
      userAnswers: {},
      timeRemaining: 0,
      isSubmitted: false,

      startQuiz: (quizData) => set({
        questions: quizData.questions,
        config: quizData.config,
        userAnswers: {},
        timeRemaining: quizData.config.duration_minutes * 60,
        isSubmitted: false,
      }),

      selectAnswer: (index, option) => set((state) => ({
        userAnswers: { ...state.userAnswers, [index]: option }
      })),

      setTimeRemaining: (time) => set((state) => ({
        timeRemaining: typeof time === 'function' ? time(state.timeRemaining) : time
      })),

      submitQuiz: () => set({ isSubmitted: true }),

      resetQuiz: () => set({
        questions: [],
        config: null,
        userAnswers: {},
        timeRemaining: 0,
        isSubmitted: false
      }),

      calculateResults: () => {
        const { questions, userAnswers, config } = get();
        let score = 0, correct = 0, wrong = 0, skipped = 0;

        if (!config) return { score, correct, wrong, skipped, totalQuestions: 0 };

        questions.forEach((q, index) => {
          const ans = userAnswers[index];
          if (!ans) skipped++;
          else if (ans === q.answer) {
            correct++;
            score += config.marks_per_question;
          } else {
            wrong++;
            score -= config.negative_marks;
          }
        });

        return { score, correct, wrong, skipped, totalQuestions: questions.length };
      }
    }),
    {
      name: 'quiz-storage',
    }
  )
);
