import React, { createContext, useContext, useState, useEffect } from 'react';

const QuizContext = createContext();

export const useQuiz = () => useContext(QuizContext);

export const QuizProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [config, setConfig] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const startQuiz = (quizData) => {
    setQuestions(quizData.questions);
    setConfig(quizData.config);
    setUserAnswers({});
    setTimeRemaining(quizData.config.duration_minutes * 60);
    setIsSubmitted(false);
  };

  const selectAnswer = (questionIndex, option) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  const submitQuiz = () => {
    setIsSubmitted(true);
  };

  const calculateResults = () => {
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

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
