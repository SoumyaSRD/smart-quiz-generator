import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Globe, 
  Download, 
  Sparkles, 
  Loader2, 
  LayoutDashboard,
  KeyRound,
  FileDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeOffcanvas } from '../components/ThemeOffcanvas';
import { useQuizStore } from '../store/useQuizStore';
import { useAuthStore } from '../store/useAuthStore';
import { quizService } from '../services/quizService';
import html2canvas from 'html2canvas';

const ResultPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'evaluation' | 'answerKey'>('evaluation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  const { questions, userAnswers, calculateResults, isSubmitted, resetQuiz } = useQuizStore();
  const { isAuthenticated, user, isDemoMode, logout } = useAuthStore();

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize high-performance PDF worker
    workerRef.current = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), { type: 'module' });
    return () => workerRef.current?.terminate();
  }, []);

  if (!isSubmitted) {
    navigate('/');
    return null;
  }

  const { score, correct, wrong, skipped, totalQuestions } = calculateResults();
  const displayName = isDemoMode ? "Demo User" : (user?.full_name || "Guest");

  // Synchronized Multi-Threaded PDF Generation
  const generatePDF = async (targetId: string, fileName: string) => {
    const rootElement = document.getElementById(targetId);
    if (!rootElement || !workerRef.current) return;

    setIsGenerating(true);
    
    // Preparation
    const originalScroll = window.scrollY;
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 400));

    const header = rootElement.querySelector('.pdf-header-section') as HTMLElement;
    const cards = Array.from(rootElement.querySelectorAll('.review-card-capture')) as HTMLElement[];
    const BATCH_SIZE = 5;
    const totalSteps = 1 + Math.ceil(cards.length / BATCH_SIZE);
    
    setProgress({ current: 0, total: totalSteps });

    // State for synchronization
    let resolveBatch: (() => void) | null = null;
    let resolveReady: (() => void) | null = null;
    let resolveFinished: ((blob: Blob) => void) | null = null;

    // Worker Orchestrator
    const onMessage = (e: MessageEvent) => {
      const { type, blob, error } = e.data;
      if (type === 'READY' && resolveReady) resolveReady();
      if (type === 'BATCH_PROCESSED' && resolveBatch) resolveBatch();
      if (type === 'FINISHED' && resolveFinished && blob) resolveFinished(blob);
      if (type === 'ERROR') {
        console.error("Worker Engine Error:", error);
        setIsGenerating(false);
      }
    };

    workerRef.current.onmessage = onMessage;

    try {
      // 1. Start Engine
      const readyPromise = new Promise<void>(res => { resolveReady = res; });
      workerRef.current.postMessage({ type: 'START' });
      await readyPromise;

      const captureAndStyle = async (el: HTMLElement) => {
        const canvas = await html2canvas(el, {
          scale: 1.2,
          useCORS: true,
          backgroundColor: '#000000',
          logging: false,
          onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.querySelector('.pdf-batch-capture-temp') as HTMLElement;
            if (clonedEl) {
               clonedEl.style.width = '1000px';
               clonedEl.classList.add('pdf-capture-area');
               if (fileName === 'AnswerKey') clonedEl.classList.add('answer-key-theme');
            }
          }
        });
        return canvas.toDataURL('image/jpeg', 0.8);
      };

      let step = 0;

      // 2. Process Header
      if (header) {
        header.classList.add('pdf-batch-capture-temp');
        const imgData = await captureAndStyle(header);
        header.classList.remove('pdf-batch-capture-temp');
        
        const batchWait = new Promise<void>(res => { resolveBatch = res; });
        workerRef.current.postMessage({ type: 'ADD_BATCH', payload: { imgData, format: 'JPEG' } });
        await batchWait;
        
        step++;
        setProgress(p => ({ ...p, current: step }));
      }

      // 3. Process Card Batches Sequentially
      for (let i = 0; i < cards.length; i += BATCH_SIZE) {
        const batchContainer = document.createElement('div');
        batchContainer.className = 'pdf-batch-capture-temp';
        batchContainer.style.width = '1000px';
        batchContainer.style.background = '#000000';
        
        cards.slice(i, i + BATCH_SIZE).forEach(c => {
          const clone = c.cloneNode(true) as HTMLElement;
          clone.style.marginBottom = '20px';
          batchContainer.appendChild(clone);
        });

        batchContainer.style.position = 'fixed';
        batchContainer.style.left = '-9999px';
        document.body.appendChild(batchContainer);

        const imgData = await captureAndStyle(batchContainer);
        document.body.removeChild(batchContainer);

        const batchWait = new Promise<void>(res => { resolveBatch = res; });
        workerRef.current.postMessage({ type: 'ADD_BATCH', payload: { imgData, format: 'JPEG' } });
        await batchWait;

        step++;
        setProgress(p => ({ ...p, current: step }));
        
        // Let the UI render
        await new Promise(r => setTimeout(r, 10));
      }

      // 4. Finalize & Download
      const finishedPromise = new Promise<Blob>(res => { resolveFinished = res; });
      workerRef.current.postMessage({ type: 'FINALIZE' });
      const finalBlob = await finishedPromise;

      const url = URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${displayName.replace(/\s+/g, '_')}_${fileName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF Pipeline Failure:", err);
    } finally {
      window.scrollTo(0, originalScroll);
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleRestart = () => {
    resetQuiz();
    if (!isAuthenticated) {
      logout();
      navigate('/login');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Top Header & Theme */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-2xl font-black text-main uppercase italic tracking-tighter flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-[var(--text-accent)] shadow-xl rotate-3">
             <LayoutDashboard size={20} />
          </div>
          Review Protocol
        </h1>
        <div className="flex items-center gap-4">
          <ThemeOffcanvas />
          <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl shadow-sm border border-theme">
            <Globe size={16} className="text-muted ml-1" />
            <select 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-transparent text-[10px] font-black text-main focus:outline-none p-1 cursor-pointer uppercase"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="or">OR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex justify-center mb-12">
        <div className="flex bg-main border border-theme p-1.5 rounded-2xl shadow-2xl relative z-10">
          <button 
            onClick={() => setActiveTab('evaluation')}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              activeTab === 'evaluation' 
                ? 'bg-accent text-[var(--text-accent)] shadow-[0_10px_25px_rgba(var(--accent-rgb),0.4)] scale-105' 
                : 'text-muted hover:text-main'
            }`}
          >
            <LayoutDashboard size={16} /> Result
          </button>
          <button 
            onClick={() => setActiveTab('answerKey')}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              activeTab === 'answerKey' 
                ? 'bg-accent text-[var(--text-accent)] shadow-[0_10px_25px_rgba(var(--accent-rgb),0.4)] scale-105' 
                : 'text-muted hover:text-main'
            }`}
          >
            <KeyRound size={16} /> Answer Key
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {activeTab === 'evaluation' ? (
          <div id="evaluation-content">
            {/* Evaluation Header */}
            <div className="pdf-header-section theme-card overflow-hidden mb-12 border border-theme shadow-2xl">
              <div className="bg-accent p-12 text-center text-[var(--text-accent)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
                <h2 className="text-3xl font-black mb-4 uppercase tracking-[0.3em] italic">Candidate Evaluation</h2>
                <div className="text-[120px] font-black leading-none drop-shadow-2xl">{score.toFixed(1)}</div>
                <div className="text-[var(--text-accent)]/70 uppercase tracking-[0.5em] text-[10px] mt-6 font-black italic">System Ref: {displayName}</div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-theme border-b border-theme bg-main/40">
                {[
                  { label: 'Correct', value: correct, icon: CheckCircle2, color: 'text-green-500' },
                  { label: 'Wrong', value: wrong, icon: XCircle, color: 'text-red-500' },
                  { label: 'Skipped', value: skipped, icon: AlertCircle, color: 'text-orange-500' },
                  { label: 'Questions', value: totalQuestions, icon: CheckCircle2, color: 'text-accent' }
                ].map((stat, i) => (
                  <div key={i} className="p-10 text-center">
                    <div className={`flex justify-center mb-3 ${stat.color}`}><stat.icon size={32} /></div>
                    <div className="text-4xl font-black mb-1 text-main">{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="p-8 flex justify-center bg-main/10">
                 <button 
                  onClick={() => generatePDF('evaluation-content', 'Evaluation')}
                  disabled={isGenerating}
                  className="theme-button-primary px-10 py-5 rounded-[2rem] flex items-center gap-4 group min-w-[280px]"
                 >
                   {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <FileDown size={20} className="group-hover:translate-y-1 transition-transform" />}
                   <span className="uppercase tracking-[0.2em] text-xs font-black">
                     {isGenerating ? `Processing Part ${progress.current}/${progress.total}` : 'Download Result PDF'}
                   </span>
                 </button>
              </div>
            </div>

            {/* Evaluation Questions */}
            <div className="space-y-10">
              {questions.map((q, idx) => (
                <div key={idx} className="review-card-capture">
                  <ReviewCard question={q} index={idx} userAnswer={userAnswers[idx]} mode="evaluation" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div id="answer-key-content">
            {/* Answer Key Header */}
            <div className="pdf-header-section theme-card p-12 mb-12 text-center bg-accent/5 border-dashed border-2 border-accent/20 rounded-[3rem]">
               <h2 className="text-4xl font-black text-main uppercase italic tracking-tighter mb-4 flex items-center justify-center gap-4">
                 <KeyRound size={36} className="text-accent" /> Official Answer Key
               </h2>
               <div className="flex justify-center mb-8">
                 <button 
                  onClick={() => generatePDF('answer-key-content', 'AnswerKey')}
                  disabled={isGenerating}
                  className="px-10 py-4 rounded-2xl bg-white/5 border border-theme text-main font-black uppercase tracking-widest text-[11px] hover:bg-theme transition-all duration-300 flex items-center gap-3 group min-w-[280px]"
                 >
                   {isGenerating ? <Loader2 size={18} className="animate-spin text-accent" /> : <Download size={18} className="text-accent group-hover:translate-y-1 transition-transform" />}
                   {isGenerating ? `Encoding ${progress.current}/${progress.total}` : 'Download Answer Key'}
                 </button>
               </div>
               <p className="text-accent font-black uppercase tracking-[0.5em] text-[9px] opacity-60 italic">Engineering Validation Protocol Active</p>
            </div>

            {/* Answer Key Questions */}
            <div className="space-y-10">
              {questions.map((q, idx) => (
                <div key={idx} className="review-card-capture">
                  <ReviewCard question={q} index={idx} userAnswer={undefined} mode="answerKey" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Global Restart Button */}
      <div className="mt-20 flex justify-center pb-20">
        <button 
          onClick={handleRestart} 
          className="px-12 py-5 rounded-[2rem] bg-main border border-theme text-main font-black uppercase tracking-widest text-[11px] hover:bg-theme transition-all duration-500 flex items-center gap-3 shadow-2xl group"
        >
          <RefreshCw size={20} className="text-accent group-hover:rotate-180 transition-transform duration-700" /> 
          Restart Session
        </button>
      </div>

    </div>
  );
};

const ReviewCard: React.FC<{
  question: any;
  index: number;
  userAnswer: string | undefined;
  mode: 'evaluation' | 'answerKey';
}> = ({ question, index, userAnswer, mode }) => {
  const { i18n } = useTranslation();
  const isCorrect = userAnswer === question.answer;
  const isSkipped = !userAnswer;
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExplain = async () => {
    if (explanation) {
      setExplanation(null);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await quizService.explainQuestion(question.question, question.options, question.answer);
      setExplanation(response.explanation);
    } catch (err) {
      console.error("AI Insight Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`theme-card p-10 border-l-[14px] transition-all duration-700 mb-2 shadow-xl ${
        mode === 'answerKey' ? 'border-l-blue-500' : (isSkipped ? 'border-l-orange-400' : isCorrect ? 'border-l-green-500' : 'border-l-red-500')
      }`}
    >
      <div className="flex justify-between items-center mb-8">
        <span className="text-[10px] font-black text-accent px-4 py-1.5 bg-accent/10 rounded-full uppercase tracking-[0.3em]">
          {question.category}
        </span>
        <div className="flex items-center gap-6">
          <button 
            onClick={handleExplain}
            disabled={isLoading}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-accent hover:opacity-70 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {explanation ? 'Hide Insights' : 'AI Analysis'}
          </button>
          {mode === 'evaluation' && (
            <span className={`font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 ${isSkipped ? 'text-orange-500' : isCorrect ? 'text-green-500' : 'text-red-500'}`}>
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isSkipped ? 'bg-orange-500' : isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
              {isSkipped ? 'Skipped' : isCorrect ? 'Perfect' : 'Fault'}
            </span>
          )}
        </div>
      </div>
      
      <h3 className="text-2xl font-black text-main mb-10 leading-relaxed italic tracking-tight">
        <span className="text-accent mr-3 not-italic opacity-40 font-black">Q{index + 1}.</span> {question.question}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(question.options).map(([key, value]) => {
          const isCorrectOpt = key === question.answer;
          const isUserOpt = key === userAnswer;
          const isWrongUserOpt = mode === 'evaluation' && isUserOpt && !isCorrectOpt;

          return (
            <div 
              key={key} 
              className={`flex items-center p-6 rounded-[1.5rem] border-2 transition-all duration-500 ${
                isCorrectOpt 
                  ? 'border-green-500/50 bg-green-500/10 shadow-[inset_0_0_25px_rgba(34,197,94,0.1)]' 
                  : isWrongUserOpt
                    ? 'border-red-500/50 bg-red-500/10 shadow-[inset_0_0_25px_rgba(239,68,68,0.1)]'
                    : 'border-theme bg-main/30'
              }`}
            >
              <span className={`w-12 h-12 flex items-center justify-center rounded-2xl mr-6 text-sm font-black border-2 ${
                isCorrectOpt 
                  ? 'bg-green-500 text-white border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' 
                  : isWrongUserOpt
                    ? 'bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : 'bg-card text-muted border-theme'
              }`}>
                {key}
              </span>
              <span className={`flex-grow font-bold text-base ${isCorrectOpt || isWrongUserOpt ? 'text-main' : 'text-muted'}`}>
                {(value as string)}
              </span>
            </div>
          );
        })}
      </div>

      {explanation && (
        <div className="mt-10 p-8 rounded-[2rem] bg-accent/5 border border-accent/20 animate-in fade-in zoom-in-95 duration-500">
           <div className="flex items-center gap-3 mb-4 text-accent">
              <Sparkles size={22} />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Cognitive Intelligence Insights</span>
           </div>
           <p className="text-sm text-main leading-relaxed font-medium italic opacity-90 border-l-2 border-accent/30 pl-6">
             {explanation}
           </p>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
