import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface QuizResults {
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  totalQuestions: number;
}

interface QuizContextType {
  questions: Question[];
  config: QuizConfig | null;
  userAnswers: Record<number, string>;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  isSubmitted: boolean;
  startQuiz: (quizData: { questions: Question[]; config: QuizConfig }) => void;
  selectAnswer: (questionIndex: number, option: string) => void;
  submitQuiz: () => void;
  calculateResults: () => QuizResults;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

interface QuizProviderProps {
  children: ReactNode;
}

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const startQuiz = (quizData: { questions: Question[]; config: QuizConfig }) => {
    setQuestions(quizData.questions);
    setConfig(quizData.config);
    setUserAnswers({});
    setTimeRemaining(quizData.config.duration_minutes * 60);
    setIsSubmitted(false);
  };

  const selectAnswer = (questionIndex: number, option: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  const submitQuiz = () => {
    setIsSubmitted(true);
  };

  const calculateResults = (): QuizResults => {
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    if (!config) return { score, correct, wrong, skipped, totalQuestions: 0 };

    questions.forEach((q, index) => {
      const userAnswer = userAnswers[index];
      if (!userAnswer) {
        skipped++;
      } else if (userAnswer === q.answer) {
        correct++;
        score += config.marks_per_question;
      } else {
        wrong++;
        score -= config.negative_marks;
      }
    });

    return { score, correct, wrong, skipped, totalQuestions: questions.length };
  };

  return (
    <QuizContext.Provider value={{
      questions,
      config,
      userAnswers,
      timeRemaining,
      setTimeRemaining,
      isSubmitted,
      startQuiz,
      selectAnswer,
      submitQuiz,
      calculateResults
    }}>
      {children}
    </QuizContext.Provider>
  );
};
