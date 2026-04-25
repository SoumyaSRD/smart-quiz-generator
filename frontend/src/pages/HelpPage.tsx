import React from 'react';
import { FileText, Upload, Sparkles, Download, Info, CheckCircle2 } from 'lucide-react';

const HelpPage: React.FC = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-block p-4 bg-accent/20 text-accent rounded-3xl mb-4">
          <Info size={40} />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic italic text-main">
          System <span className="text-accent">Protocol</span>
        </h1>
        <p className="text-muted font-bold tracking-widest text-xs uppercase">How to Engineer Perfect Quizzes</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Step 1 */}
        <div className="theme-card p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent text-[var(--text-accent)] flex items-center justify-center font-black text-xl shadow-lg">1</div>
            <h2 className="text-xl font-black uppercase tracking-tight">Prepare Source</h2>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            You can provide content via <strong>PDF Upload</strong> or <strong>Direct Paste</strong>. 
            The AI extractor works best when questions are clearly separated.
          </p>
          <div className="bg-main/50 p-4 rounded-2xl border border-theme border-dashed">
            <p className="text-[10px] font-black uppercase text-muted mb-2 tracking-widest">Recommended PDF Layout</p>
            <div className="flex items-center gap-3 text-accent">
               <FileText size={20} />
               <span className="text-xs font-bold uppercase italic tracking-tighter">Standard MCQ Document.pdf</span>
               <button className="ml-auto p-2 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors">
                 <Download size={14} />
               </button>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="theme-card p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent text-[var(--text-accent)] flex items-center justify-center font-black text-xl shadow-lg">2</div>
            <h2 className="text-xl font-black uppercase tracking-tight">Text Formatting</h2>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            When pasting text, use our <strong>Auto-Format</strong> engine. It automatically cleans messy inputs into organized MCQs.
          </p>
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 font-mono">
            <p className="text-[10px] text-zinc-500 mb-2 uppercase">Input Format</p>
            <code className="text-[11px] text-purple-400 block whitespace-pre">
              1. Your question here?{"\n"}
              A) Choice One{"\n"}
              B) Choice Two{"\n"}
              Answer: A
            </code>
          </div>
        </div>

        {/* Step 3 */}
        <div className="theme-card p-8 space-y-6 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent text-[var(--text-accent)] flex items-center justify-center font-black text-xl shadow-lg">3</div>
            <h2 className="text-xl font-black uppercase tracking-tight">Configuration & Generation</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent">
                <Upload size={16} />
                <span className="text-xs font-black uppercase tracking-tighter">Mixed Mode</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">Upload everything into one pool for a randomized variety.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles size={16} />
                <span className="text-xs font-black uppercase tracking-tighter">Subject Wise</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">Assign specific counts to categories like English or GK.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent">
                <CheckCircle2 size={16} />
                <span className="text-xs font-black uppercase tracking-tighter">Instant Results</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">Get detailed score analysis and review every single answer.</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="theme-card p-8 bg-accent text-[var(--text-accent)] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
        <h3 className="text-xl font-black uppercase italic italic mb-2 relative z-10">Ready to begin?</h3>
        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-6 relative z-10">Initialize your first quiz engine session</p>
        <button 
          onClick={() => window.history.back()}
          className="bg-[var(--text-accent)] text-accent px-10 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-105 transition-all relative z-10"
        >
          Return to Deck
        </button>
      </footer>
    </div>
  );
};

export default HelpPage;
