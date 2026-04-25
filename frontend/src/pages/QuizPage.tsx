import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import type { Question } from '../context/QuizContext';
import { ChevronLeft, ChevronRight, Send, Clock, Layout, List, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeOffcanvas } from '../components/ThemeOffcanvas';

const QuizPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { 
    questions, 
    userAnswers, 
    selectAnswer, 
    timeRemaining, 
    setTimeRemaining, 
    submitQuiz
  } = useQuiz();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewAll, setViewAll] = useState<boolean>(false);

  useEffect(() => {
    if (questions.length === 0) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions, navigate, setTimeRemaining]);

  const handleSubmit = () => {
    submitQuiz();
    navigate('/result');
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
      {/* Header Info */}
      <div className="flex flex-wrap justify-between items-center theme-card p-5 mb-8 sticky top-4 z-[50] shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black shadow-inner ${timeRemaining < 60 ? 'bg-red-500/20 text-red-500' : 'bg-[var(--accent)]/20 text-[var(--accent)]'}`}>
            <Clock size={20} /> {formatTime(timeRemaining)}
          </div>
          <div className="font-black uppercase tracking-widest text-sm theme-text-muted">
            {t('question_progress', { current: currentIndex + 1, total: questions.length, defaultValue: `Question ${currentIndex + 1} of ${questions.length}` })}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <ThemeOffcanvas />
          
          <div className="flex items-center gap-2 bg-[var(--bg-main)] border border-[var(--border)] p-1.5 rounded-xl transition-all">
            <Globe size={16} className="theme-text-muted ml-1" />
            <select 
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-transparent text-xs font-black text-[var(--text-main)] focus:outline-none p-1 cursor-pointer"
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
              className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] hover:border-[var(--accent)] transition-all theme-text-muted hover:text-[var(--accent)]"
              title={viewAll ? "Single View" : "View All"}
            >
              {viewAll ? <Layout size={20} /> : <List size={20} />}
            </button>
            <button 
              onClick={handleSubmit}
              className="theme-button-primary px-6 py-3 flex items-center gap-2 shadow-lg shadow-[var(--accent)]/30"
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
                  className="px-8 py-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border)] font-black uppercase tracking-widest text-sm disabled:opacity-30 hover:border-[var(--accent)] transition-all"
                >
                  <div className="flex items-center gap-2"><ChevronLeft size={20} /> {t('previous', { defaultValue: 'Prev' })}</div>
                </button>
                <button 
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="theme-button-primary px-10 py-4 shadow-xl shadow-[var(--accent)]/20 uppercase tracking-widest text-sm"
                >
                  <div className="flex items-center gap-2">{t('next', { defaultValue: 'Next' })} <ChevronRight size={20} /></div>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <div className="theme-card p-6 sticky top-32 shadow-xl">
            <h3 className="font-black uppercase tracking-widest text-sm theme-text-muted mb-6 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-[var(--accent)] rounded-full" /> {t('question_palette', { defaultValue: 'Palette' })}
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
                      ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/40 scale-110' 
                      : userAnswers[idx] 
                        ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                        : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--accent)]'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-8 space-y-3">
              {[
                { color: 'bg-[var(--accent)]', label: t('palette_current', { defaultValue: 'Current' }) },
                { color: 'bg-green-500/50', label: t('palette_answered', { defaultValue: 'Answered' }) },
                { color: 'bg-[var(--bg-main)] border border-[var(--border)]', label: t('palette_unanswered', { defaultValue: 'Open' }) }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tighter theme-text-muted">
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

interface QuestionCardProps {
  question: Question;
  index: number;
  selectedOption: string | undefined;
  onSelect: (option: string) => void;
  t: any;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, selectedOption, onSelect, t }) => {
  return (
    <div className="theme-card p-8 md:p-10 group hover:shadow-2xl hover:shadow-[var(--accent)]/5 transition-all">
      <div className="flex justify-between items-start mb-6">
        <span className="inline-block px-4 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm">
          {t(`categories.${question.category}`, { defaultValue: question.category })}
        </span>
      </div>
      <h2 className="text-xl md:text-2xl font-extrabold text-[var(--text-main)] mb-10 leading-relaxed tracking-tight">
        <span className="text-[var(--accent)] opacity-50 mr-3 font-black">#{index + 1}</span> {question.question}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(question.options).map(([key, value]) => (
          <label 
            key={key}
            className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${
              selectedOption === key 
                ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-inner' 
                : 'border-[var(--border)] bg-[var(--bg-main)]/30 hover:border-[var(--accent)]/30 hover:bg-[var(--bg-main)]/50'
            }`}
          >
            <input 
              type="radio"
              name={`q-${index}`}
              className="hidden"
              checked={selectedOption === key}
              onChange={() => onSelect(key)}
            />
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl mr-5 font-black text-sm border-2 transition-all ${
              selectedOption === key 
                ? 'bg-[var(--accent)] text-white border-[var(--accent)] rotate-12 scale-110' 
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)]'
            }`}>
              {key}
            </div>
            <span className={`text-base font-bold transition-colors ${selectedOption === key ? 'text-[var(--text-main)]' : 'theme-text-muted'}`}>
              {value}
            </span>
            {selectedOption === key && (
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <div className="w-12 h-12 rounded-full bg-[var(--accent)] blur-xl" />
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuizPage;
