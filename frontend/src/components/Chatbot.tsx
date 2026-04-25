import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, FileDown } from 'lucide-react';
import { generateSampleQuizPDF } from '../utils/pdfGenerator';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

const KNOWLEDGE_BASE: Record<string, string> = {
  "hello": "Hello! I am BrainWave Assistant. How can I help you engineer your quiz today?",
  "hi": "Hi there! Ready to generate some questions?",
  "pdf": "PROTOCOL: 1. Navigate to 'Content Sources'. 2. Drag & Drop your PDF. 3. System will auto-detect questions.",
  "format": "TEXT SPEC: Use '1. Question?\\nA) Opt 1\\nB) Opt 2\\nAnswer: A'. My Auto-Format engine will clean the rest!",
  "theme": "VISUAL SYNC: Open 'UI Customs' in the sidebar to switch between 'Animated Dark', 'AMOLED', or 'Solo Leveling' spectrums.",
  "start": "INITIALIZATION: 1. Add your sources (PDF/Text). 2. Set 'Target Count' for each. 3. Adjust 'Time Horizon' in Parameters. 4. Hit 'START GENERATION'.",
  "result": "EVALUATION: After finishing, you'll see your score. Use the 'Answer Key' or 'Evaluation' buttons to download professional PDF reports.",
  "sample": "DATA SAMPLES: I've initiated a download for a sample PDF. For text input, use this format:\n\n1. Question?\nA) Option 1\nB) Option 2\nAnswer: A",
  "download": "SYSTEM: Request acknowledged. Generating sample protocol document...",
  "process": "SYSTEM FLOW:\n1. DATA ENTRY: Provide PDFs or Paste Text.\n2. CONFIG: Set questions per subject and time.\n3. EXECUTION: Take the quiz.\n4. REPORTING: Download your evaluation PDF.",
  "help": "I am indexed for: Start Quiz, PDF Format, Samples, Results, and System Process. What shall we analyze?",
};

const RECOMMENDATIONS = [
  { label: "🚀 Start Quiz", query: "start" },
  { label: "📥 Sample Data", query: "sample" },
  { label: "📊 Results", query: "result" },
  { label: "⚙️ Process", query: "process" }
];

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "BrainWave Core Online. I can guide you through the quiz engineering protocol. Select a recommendation below or query the system.", sender: 'bot', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const processQuery = (queryText: string) => {
    const userMsg: Message = { id: Date.now().toString(), text: queryText, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    // Handle special logic for samples
    if (queryText.toLowerCase().includes('sample') || queryText.toLowerCase().includes('download')) {
      generateSampleQuizPDF();
    }

    setTimeout(() => {
      const query = queryText.toLowerCase();
      let responseText = "Query out of range. Try asking about 'process', 'formatting', or 'starting a quiz'.";
      
      for (const key in KNOWLEDGE_BASE) {
        if (query.includes(key)) {
          responseText = KNOWLEDGE_BASE[key];
          break;
        }
      }

      const botMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processQuery(input);
    setInput('');
  };

  const handleRecommendation = (query: string) => {
    processQuery(query);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      {/* Chat Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-accent text-[var(--text-accent)] shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'rotate-90 opacity-0 scale-0' : ''}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div className={`absolute bottom-0 right-0 w-[380px] h-[600px] theme-card bg-card/80 backdrop-blur-2xl border border-accent/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col transition-all duration-500 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="p-4 border-b border-theme bg-accent/10 flex justify-between items-center rounded-t-[2rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-[var(--text-accent)] shadow-lg">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tighter italic">BrainWave AI</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Active Core</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-main rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-accent text-[var(--text-accent)] rounded-tr-none' 
                  : 'bg-main border border-theme text-main rounded-tl-none whitespace-pre-wrap'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-theme bg-main/20">
           {RECOMMENDATIONS.map((rec) => (
             <button
               key={rec.query}
               onClick={() => handleRecommendation(rec.query)}
               className="px-3 py-1.5 rounded-lg bg-card border border-theme text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all active:scale-95 shadow-sm"
             >
               {rec.label}
             </button>
           ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-theme">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Query system..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="theme-input w-full pr-12 text-sm"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent hover:scale-110 transition-transform"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
