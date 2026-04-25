import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, RefreshCcw, Check, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeOffcanvas } from '../components/ThemeOffcanvas';
import { useQuizStore } from '../store/useQuizStore';

const ResultPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // Use Zustand store for quiz results
  const { questions, userAnswers, calculateResults, isSubmitted, resetQuiz } = useQuizStore();

  if (!isSubmitted) {
    navigate('/smart-quiz-generator');
    return null;
  }

  const { score, correct, wrong, skipped, totalQuestions } = calculateResults();

  const handleRestart = () => {
    resetQuiz();
    navigate('/smart-quiz-generator');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Header with Switchers */}
      <div className="flex justify-end gap-4 mb-8">
        <ThemeOffcanvas />
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl shadow-sm border border-theme transition-all">
          <Globe size={16} className="text-muted ml-1" />
          <select 
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language}
            className="bg-transparent text-xs font-black text-main focus:outline-none p-1 cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="or">ଓଡ଼ିଆ</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      {/* Summary Card */}
      <div className="theme-card overflow-hidden mb-12 shadow-2xl">
        <div className="bg-accent p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
          <h1 className="text-3xl font-black mb-4 uppercase tracking-[0.2em] relative z-10">{t('results_title', { defaultValue: 'Quiz Results' })}</h1>
          <div className="text-8xl font-black mt-2 relative z-10 drop-shadow-lg">{score.toFixed(1)}</div>
          <div className="text-white/70 uppercase tracking-widest text-xs mt-4 font-black relative z-10">{t('total_marks_obtained', { defaultValue: 'Total Marks Obtained' })}</div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-theme border-b border-theme bg-main/20">
          {[
            { label: t('correct', { defaultValue: 'Correct' }), value: correct, icon: CheckCircle2, color: 'text-green-500' },
            { label: t('wrong', { defaultValue: 'Wrong' }), value: wrong, icon: XCircle, color: 'text-red-500' },
            { label: t('skipped', { defaultValue: 'Skipped' }), value: skipped, icon: AlertCircle, color: 'text-orange-500' },
            { label: t('total_items', { defaultValue: 'Total' }), value: totalQuestions, icon: CheckCircle2, color: 'text-accent' }
          ].map((stat, i) => (
            <div key={i} className="p-8 text-center transition-all hover:bg-main/50">
              <div className={`flex justify-center mb-3 ${stat.color}`}><stat.icon size={28} /></div>
              <div className="text-3xl font-black mb-1">{stat.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="p-10 flex justify-center bg-main/10">
          <button 
            onClick={handleRestart}
            className="theme-button-primary px-12 py-4 flex items-center gap-3 shadow-xl group"
          >
            <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" /> 
            <span className="uppercase tracking-[0.2em] text-sm">{t('take_another_quiz', { defaultValue: 'Restart' })}</span>
          </button>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-black mb-8 text-main flex items-center gap-4">
          <div className="w-10 h-1 bg-accent rounded-full" />
          <span className="uppercase tracking-tighter italic">{t('question_review', { defaultValue: 'Deep Review' })}</span>
        </h2>
        {questions.map((q, idx) => (
          <ReviewCard 
            key={idx} 
            question={q} 
            index={idx} 
            userAnswer={userAnswers[idx]} 
            t={t}
          />
        ))}
      </div>
    </div>
  );
};

const ReviewCard: React.FC<{
  question: any;
  index: number;
  userAnswer: string | undefined;
  t: any;
}> = ({ question, index, userAnswer, t }) => {
  const isCorrect = userAnswer === question.answer;
  const isSkipped = !userAnswer;

  return (
    <div className={`theme-card p-8 md:p-10 border-l-[12px] transition-all duration-500 ${
      isSkipped ? 'border-l-orange-400' : isCorrect ? 'border-l-green-500' : 'border-l-red-500'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-black text-accent px-3 py-1 bg-accent/10 rounded-full uppercase tracking-widest">
          {t(`categories.${question.category}`, { defaultValue: question.category })}
        </span>
        {isSkipped ? (
          <span className="text-orange-500 font-black text-xs uppercase tracking-tighter flex items-center gap-2">
            <AlertCircle size={16} /> {t('skipped', { defaultValue: 'Skipped' })}
          </span>
        ) : isCorrect ? (
          <span className="text-green-500 font-black text-xs uppercase tracking-tighter flex items-center gap-2">
            <CheckCircle2 size={16} /> {t('perfect', { defaultValue: 'Perfect' })}
          </span>
        ) : (
          <span className="text-red-500 font-black text-xs uppercase tracking-tighter flex items-center gap-2">
            <XCircle size={16} /> {t('fault', { defaultValue: 'Fault' })}
          </span>
        )}
      </div>
      
      <h3 className="text-xl font-extrabold text-main mb-8 leading-relaxed italic">
        <span className="text-accent mr-2 not-italic opacity-40 font-black">Q{index + 1}.</span> {question.question}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(question.options).map(([key, value]) => {
          let stateStyles = 'border-theme bg-main/30';
          let indicatorStyles = 'bg-card text-muted';
          let Icon = null;

          if (key === question.answer) {
            stateStyles = 'border-green-500/50 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
            indicatorStyles = 'bg-green-500 text-white border-green-500';
            Icon = Check;
          } else if (key === userAnswer && !isCorrect) {
            stateStyles = 'border-red-500/50 bg-red-500/10';
            indicatorStyles = 'bg-red-500 text-white border-red-500';
            Icon = X;
          }

          return (
            <div key={key} className={`flex items-center p-5 rounded-2xl border-2 ${stateStyles} transition-all duration-300 relative overflow-hidden`}>
              <span className={`w-10 h-10 flex items-center justify-center rounded-xl mr-5 text-sm font-black border-2 ${indicatorStyles} transition-all`}>
                {key}
              </span>
              <span className={`flex-grow font-bold ${key === question.answer ? 'text-main' : 'text-muted'}`}>{(value as string)}</span>
              {Icon && (
                <div className="ml-2 p-1 rounded-full bg-white/20">
                  <Icon size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultPage;
