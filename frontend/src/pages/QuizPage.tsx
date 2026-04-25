import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Send, Clock, Layout, List, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router-dom';
import { ThemeOffcanvas } from '../components/ThemeOffcanvas';
import { useQuizStore } from '../store/useQuizStore';
import { useAuthStore } from '../store/useAuthStore';
import WarningModal from '../components/WarningModal';

const QuizPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  
  // Use Zustand store for quiz state
  const { 
    questions, 
    userAnswers, 
    selectAnswer, 
    timeRemaining, 
    setTimeRemaining, 
    submitQuiz,
    resetQuiz,
    isSubmitted,
    quizSessionId
  } = useQuizStore();
  const { isAuthenticated, isDemoMode } = useAuthStore();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewAll, setViewAll] = useState<boolean>(false);

  // ACCESS GUARD: Strict session-based entry
  useEffect(() => {
    if (!quizSessionId || isSubmitted || questions.length === 0) {
      if (isAuthenticated || isDemoMode) {
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [quizSessionId, isSubmitted, questions.length, isAuthenticated, isDemoMode, navigate]);

  // 1. Handle Navigation Blocking (Internal Links, Back Button, Sidebar)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isSubmitted && questions.length > 0 && currentLocation.pathname !== nextLocation.pathname
  );

  // 2. Handle Before Unload (Reload / Close Tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmitted && questions.length > 0) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitted, questions.length]);

  useEffect(() => {
    if (questions.length === 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz();
          navigate('/result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions, isSubmitted, navigate, setTimeRemaining, submitQuiz]);

  const handleSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const confirmFinalSubmit = () => {
    setShowConfirmSubmit(false);
    submitQuiz();
    setTimeout(() => {
      navigate('/result');
    }, 0);
  };

  const handleForceExit = () => {
    resetQuiz();
    if (blocker.proceed) blocker.proceed();
  };

  const handleCancelExit = () => {
    if (blocker.reset) blocker.reset();
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* 1. Navigation Warning Modal (Triggers on back/exit) */}
      <WarningModal 
        isOpen={blocker.state === "blocked"}
        onClose={handleCancelExit}
        onConfirm={handleForceExit}
        title="Abandon Quiz?"
        message="Your progress will be lost. Are you sure you want to exit the quiz environment?"
      />

      {/* 2. Professional Submission Modal (Triggers on Submit click) */}
      <WarningModal 
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        onConfirm={confirmFinalSubmit}
        title="Finalize Session?"
        message="You are about to submit your answers for evaluation. Ensure you have reviewed all questions before proceeding."
        confirmText="Submit Anyway"
        cancelText="Stay & Review"
        type="warning"
      />

      {/* Header Info */}
      <div className="flex flex-wrap justify-between items-center theme-card p-5 mb-8 sticky top-4 z-[50] shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black shadow-inner ${timeRemaining < 60 ? 'bg-red-500/20 text-red-500' : 'bg-accent/20 text-accent'}`}>
            <Clock size={20} /> {formatTime(timeRemaining)}
          </div>
          <div className="font-black uppercase tracking-widest text-sm text-muted">
            {t('question_progress', { current: currentIndex + 1, total: questions.length, defaultValue: `Question ${currentIndex + 1} of ${questions.length}` })}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <ThemeOffcanvas />
          
          <div className="flex items-center gap-2 bg-main border border-theme p-1.5 rounded-xl transition-all">
            <Globe size={16} className="text-muted ml-1" />
            <select 
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-transparent text-xs font-black text-main focus:outline-none p-1 cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="or">OR</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setViewAll(!viewAll)}
              className="p-3 rounded-xl bg-main border border-theme hover:border-accent transition-all text-muted hover:text-accent"
              title={viewAll ? "Single View" : "View All"}
            >
              {viewAll ? <Layout size={20} /> : <List size={20} />}
            </button>
            <button 
              onClick={handleSubmit}
              className="theme-button-primary px-6 py-3 flex items-center gap-2 shadow-lg"
            >
              <Send size={18} /> <span className="hidden sm:inline uppercase tracking-widest text-xs font-black">{t('submit', { defaultValue: 'Submit' })}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {viewAll ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {questions.map((q, idx) => (
                <QuestionCard 
                  key={idx} 
                  question={q} 
                  index={idx} 
                  selectedOption={userAnswers[idx]} 
                  onSelect={(opt) => selectAnswer(idx, opt)}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <QuestionCard 
                question={currentQuestion} 
                index={currentIndex} 
                selectedOption={userAnswers[currentIndex]} 
                onSelect={(opt) => selectAnswer(currentIndex, opt)}
                t={t}
              />
              
              <div className="flex justify-between mt-10">
                <button 
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="px-8 py-4 rounded-2xl bg-card border-2 border-theme font-black uppercase tracking-widest text-sm disabled:opacity-30 hover:border-accent transition-all"
                >
                  <div className="flex items-center gap-2"><ChevronLeft size={20} /> {t('previous', { defaultValue: 'Prev' })}</div>
                </button>
                <button 
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="theme-button-primary px-10 py-4 shadow-xl uppercase tracking-widest text-sm"
                >
                  <div className="flex items-center gap-2">{t('next', { defaultValue: 'Next' })} <ChevronRight size={20} /></div>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <div className="theme-card p-6 sticky top-32 shadow-xl">
            <h3 className="font-black uppercase tracking-widest text-sm text-muted mb-6 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-accent rounded-full" /> {t('question_palette', { defaultValue: 'Palette' })}
            </h3>
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setViewAll(false);
                  }}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                    currentIndex === idx 
                      ? 'bg-accent text-white shadow-lg scale-110' 
                      : userAnswers[idx] 
                        ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                        : 'bg-main text-muted border border-theme hover:border-accent'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-8 space-y-3">
              {[
                { color: 'bg-accent', label: t('palette_current', { defaultValue: 'Current' }) },
                { color: 'bg-green-500/50', label: t('palette_answered', { defaultValue: 'Answered' }) },
                { color: 'bg-main border border-theme', label: t('palette_unanswered', { defaultValue: 'Open' }) }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter text-muted">
                  <div className={`w-3 h-3 rounded ${item.color}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionCard: React.FC<{
  question: any;
  index: number;
  selectedOption: string | undefined;
  onSelect: (option: string) => void;
  t: any;
}> = ({ question, index, selectedOption, onSelect, t }) => {
  return (
    <div className="theme-card p-8 md:p-10 group hover:shadow-2xl transition-all">
      <div className="flex justify-between items-start mb-6">
        <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm">
          {t(`categories.${question.category}`, { defaultValue: question.category })}
        </span>
      </div>
      <h2 className="text-xl md:text-2xl font-extrabold text-main mb-10 leading-relaxed tracking-tight">
        <span className="text-accent opacity-50 mr-3 font-black">#{index + 1}</span> {question.question}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(question.options).map(([key, value]) => (
          <label 
            key={key}
            className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${
              selectedOption === key 
                ? 'border-accent bg-accent/5 shadow-inner' 
                : 'border-theme bg-main/30 hover:border-accent/30 hover:bg-main/50'
            }`}
          >
            <input 
              type="radio"
              name={`q-${index}`}
              className="hidden"
              checked={selectedOption === key}
              onChange={() => onSelect(key as string)}
            />
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl mr-5 font-black text-sm border-2 transition-all ${
              selectedOption === key 
                ? 'bg-accent text-white border-accent rotate-12 scale-110' 
                : 'bg-card text-muted border-theme'
            }`}>
              {key}
            </div>
            <span className={`text-base font-bold transition-colors ${selectedOption === key ? 'text-main' : 'text-muted'}`}>
              {(value as string)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuizPage;
