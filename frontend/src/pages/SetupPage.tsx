import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Settings, Play, FileText, X, Globe, Plus, Trash2, Edit3, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeOffcanvas } from '../components/ThemeOffcanvas';
import { useQuizStore } from '../store/useQuizStore';
import { formatMcqText } from '../utils/textFormatter';
import { quizService } from '../services/quizService';
import NotificationModal from '../components/NotificationModal';

interface Source {
  id: string;
  name: string;
}

const SetupPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const startQuiz = useQuizStore((state) => state.startQuiz);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: 'info' | 'error' | 'success' | 'warning' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Dynamic Sources Logic
  const [sources, setSources] = useState<Source[]>([{ id: 'default', name: 'Mixed' }]);
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [sourceConfigs, setSourceConfigs] = useState<Record<string, number>>({ 'default': 0 });
  const [sourceCapacities, setSourceCapacities] = useState<Record<string, number>>({ 'default': 100 });
  
  const [activeModalSourceId, setActiveModalSourceId] = useState<string | null>(null);
  const [tempText, setTempText] = useState<string>("");
  const [autoFormat, setAutoFormat] = useState<boolean>(true);

  // 1. Initialize Worker for background processing
  const workerRef = React.useRef<Worker | null>(null);
  
  React.useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/formatter.worker.ts', import.meta.url), { type: 'module' });
    return () => workerRef.current?.terminate();
  }, []);

  const [generalConfig, setGeneralConfig] = useState({
    marks_per_question: 1,
    negative_marks: 0,
    duration_minutes: 10
  });

  // Global Aggregate Calculations
  const totalQuestionsSum = sources.reduce((sum, s) => sum + (sourceConfigs[s.id] || 0), 0);

  const showAlert = (title: string, message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
    setNotification({ isOpen: true, title, message, type });
  };

  const addSource = () => {
    const newId = `src_${Date.now()}`;
    setSources(prev => [...prev, { id: newId, name: `New Subject ${prev.length + 1}` }]);
    setSourceConfigs(prev => ({ ...prev, [newId]: 0 }));
    setSourceCapacities(prev => ({ ...prev, [newId]: 100 }));
  };

  const removeSource = (id: string) => {
    if (id === 'default') {
      showAlert("System Protocol", "The primary source cannot be removed.", "info");
      return;
    }
    setSources(prev => prev.filter(s => s.id !== id));
    // Data Cleanup
    const newFiles = { ...files }; delete newFiles[id]; setFiles(newFiles);
    const newTexts = { ...texts }; delete newTexts[id]; setTexts(newTexts);
  };

  const handleSourceNameChange = (id: string, newName: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const handleSourceCountChange = (id: string, value: string) => {
    const val = parseInt(value) || 0;
    const capacity = sourceCapacities[id] || 100;
    
    if (val > capacity) {
      showAlert("Source Limit", `This content only provides ${capacity} questions.`, "warning");
      setSourceConfigs(prev => ({ ...prev, [id]: capacity }));
    } else {
      setSourceConfigs(prev => ({ ...prev, [id]: val }));
    }
  };

  const handleTempTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTempText(e.target.value);
  };

  const handleFileChange = (sourceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => ({ ...prev, [sourceId]: selectedFiles }));
    setSourceCapacities(prev => ({ ...prev, [sourceId]: 100 })); // Placeholder for PDFs
  };

  const openTextModal = (sourceId: string) => {
    setActiveModalSourceId(sourceId);
    setTempText(texts[sourceId] || "");
  };

  const saveText = () => {
    if (activeModalSourceId && workerRef.current) {
      workerRef.current.onmessage = (event) => {
        const { formatted, count } = event.data;
        setTexts(prev => ({ ...prev, [activeModalSourceId]: formatted }));
        setSourceConfigs(prev => ({ ...prev, [activeModalSourceId]: count }));
        setSourceCapacities(prev => ({ ...prev, [activeModalSourceId]: count }));
        setActiveModalSourceId(null);
        setTempText("");
      };
      workerRef.current.postMessage({ text: tempText });
    } else if (activeModalSourceId) {
      const { formatted, count } = formatMcqText(tempText);
      setTexts(prev => ({ ...prev, [activeModalSourceId]: formatted }));
      setSourceConfigs(prev => ({ ...prev, [activeModalSourceId]: count }));
      setSourceCapacities(prev => ({ ...prev, [activeModalSourceId]: count }));
      setActiveModalSourceId(null);
      setTempText("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasConfiguredSource = sources.some(s => 
      sourceConfigs[s.id] > 0 && ((files[s.id] && files[s.id].length > 0) || (texts[s.id] && texts[s.id].trim() !== ""))
    );
    
    if (!hasConfiguredSource) {
      showAlert("Incomplete Setup", "Please provide content for at least one source and set its question count.", "warning");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    sources.forEach(source => {
      const safeName = source.name.replace(/\s+/g, '');
      const sourceFiles = files[source.id] || [];
      const sourceText = texts[source.id] || "";
      const sourceCount = sourceConfigs[source.id] || 0;

      sourceFiles.forEach(file => formData.append(`files_${safeName}`, file));
      if (sourceText) formData.append(`text_${safeName}`, sourceText);
      formData.append(`config_${safeName}`, sourceCount.toString());
    });
    
    formData.append('total_questions', totalQuestionsSum.toString());
    Object.entries(generalConfig).forEach(([name, value]) => formData.append(name, value.toString()));

    try {
      const data = await quizService.generateQuiz(formData);
      if (data.questions.length === 0) {
        showAlert("Extraction Failed", "No questions could be extracted. Check your source formatting.", "warning");
      } else {
        startQuiz(data);
        navigate('/quiz');
      }
    } catch (error) {
      showAlert("System Error", "The quiz engineering protocol failed to initialize.", "error");
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  return (
    <div className="py-10 px-4">
      <NotificationModal 
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
      <div className="max-w-5xl mx-auto p-8 theme-card">

        {/* Branding & Switchers */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h1 className="text-4xl font-black text-accent flex items-center gap-4">
            <div className="p-3 bg-accent text-[var(--text-accent)] rounded-[1.5rem] shadow-2xl rotate-3">
              <Upload size={32} />
            </div>
            <div className="flex flex-col">
               <span className="uppercase tracking-tighter italic">BrainWave</span>
               <span className="text-[10px] font-bold text-muted uppercase tracking-[0.4em] ml-1">Generator Core</span>
            </div>
          </h1>
          
          <div className="flex items-center gap-4">
            <ThemeOffcanvas />
            <div className="flex items-center gap-2 bg-main border border-theme p-2 rounded-2xl shadow-inner">
              <Globe size={18} className="theme-text-muted ml-2" />
              <select 
                onChange={(e) => changeLanguage(e.target.value)}
                value={i18n.language}
                className="bg-transparent text-xs font-black text-main focus:outline-none p-1 cursor-pointer uppercase"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="or">ଓଡ଼ିଆ</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left: Dynamic Sources */}
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  <div className="w-2 h-8 bg-accent rounded-full" /> Content Sources
                </h2>
                <button 
                  type="button"
                  onClick={addSource}
                  className="p-2.5 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all border border-accent/20 flex items-center gap-2 group"
                >
                  <Plus size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Add Source</span>
                </button>
              </div>

              <div className="space-y-6">
                {sources.map((source, index) => (
                  <div key={source.id} className="p-6 border border-theme rounded-[2.5rem] bg-main/30 hover:border-accent/40 transition-all relative group shadow-sm">
                    {source.id !== 'default' && (
                      <button 
                        type="button"
                        onClick={() => removeSource(source.id)}
                        className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                      <Edit3 size={14} className="text-accent" />
                      <input 
                        type="text"
                        value={source.name}
                        onChange={(e) => handleSourceNameChange(source.id, e.target.value)}
                        placeholder="Subject Name"
                        className="bg-transparent border-b border-theme border-dashed focus:border-accent outline-none text-sm font-black uppercase tracking-widest text-main w-full py-1"
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <input 
                            type="file" 
                            multiple 
                            accept=".pdf"
                            onChange={(e) => handleFileChange(source.id, e)}
                            className="theme-input w-full text-[10px] py-3 file:hidden cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                          />
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none theme-text-muted">
                            <Upload size={14} />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openTextModal(source.id)}
                          className={`px-5 rounded-2xl transition-all shadow-sm border border-theme ${texts[source.id] ? 'bg-green-600 text-white border-green-600' : 'bg-card text-main hover:bg-main'}`}
                        >
                          <FileText size={20} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-theme">
                        <span className="text-[10px] font-black theme-text-muted uppercase tracking-widest">Target Count</span>
                        <div className="flex items-center gap-3">
                           <input 
                            type="number"
                            value={sourceConfigs[source.id]}
                            onChange={(e) => handleSourceCountChange(source.id, e.target.value)}
                            className="bg-transparent text-right font-black text-xl w-16 outline-none text-accent"
                          />
                          <span className="text-[10px] font-bold opacity-30">/ {sourceCapacities[source.id] || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Parameters */}
            <div className="space-y-8">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-8 bg-accent rounded-full" /> Parameters
              </h2>
              
              <div className="p-8 border-2 border-theme rounded-[3rem] bg-card/40 backdrop-blur-xl space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <div className="space-y-2">
                    <label className="block text-[10px] font-black theme-text-muted uppercase tracking-[0.2em] ml-1">Total System Output</label>
                    <div className="theme-input w-full font-black text-4xl py-6 flex items-center justify-center gap-4 bg-accent/5 border-accent/20">
                      <Zap size={28} className="text-accent" />
                      {totalQuestionsSum}
                    </div>
                    <p className="text-[9px] text-center text-muted font-bold uppercase tracking-tighter opacity-40 italic">Read-only (Sum of all source capacities)</p>
                </div>

                {[
                  { label: 'Marks Per Query', key: 'marks_per_question', type: 'number', step: '0.1' },
                  { label: 'Penalty Factor', key: 'negative_marks', type: 'number', step: '0.1' },
                  { label: 'Time Horizon (Mins)', key: 'duration_minutes', type: 'number' }
                ].map((input) => (
                  <div key={input.key}>
                    <label className="block text-[10px] font-black theme-text-muted uppercase tracking-widest mb-3 ml-1">{input.label}</label>
                    <input 
                      type={input.type}
                      step={input.step}
                      value={(generalConfig as any)[input.key]}
                      onChange={(e) => setGeneralConfig(p => ({ ...p, [input.key]: parseFloat(e.target.value) || 0 }))}
                      className="theme-input w-full font-black text-lg py-4 shadow-inner"
                    />
                  </div>
                ))}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="theme-button-primary w-full py-6 text-xl shadow-2xl flex items-center justify-center gap-4 disabled:opacity-30 mt-4 group"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Play size={26} className="fill-current group-hover:scale-110 transition-transform" /> START GENERATION</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Text Paste Modal */}
        {activeModalSourceId && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] p-4 backdrop-blur-2xl transition-all">
            <div className="bg-card rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-3xl overflow-hidden border border-white/10 transform animate-in zoom-in-95">
              <div className="p-8 border-b border-theme flex justify-between items-center bg-accent text-[var(--text-accent)]">
                <h3 className="font-black text-2xl flex items-center gap-4 tracking-tighter uppercase italic">
                  <FileText size={28} /> {sources.find(s => s.id === activeModalSourceId)?.name}
                </h3>
                <button onClick={() => setActiveModalSourceId(null)} className="hover:bg-black/10 p-2 rounded-full transition-all">
                  <X size={28} />
                </button>
              </div>
              <div className="p-10">
                <div className="bg-main/50 p-6 rounded-[2rem] border border-theme mb-8 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em]">Formatting Engine</p>
                    <p className="text-xs text-accent font-bold italic">Standard MCQ Detection Active</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black theme-text-muted uppercase">Auto-Clean</span>
                    <button 
                      onClick={() => setAutoFormat(!autoFormat)}
                      className={`w-12 h-6 rounded-full p-1 transition-all ${autoFormat ? 'bg-accent' : 'bg-zinc-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${autoFormat ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
                <textarea
                  value={tempText}
                  onChange={(e) => handleTempTextChange(e)}
                  placeholder="Paste questions here. We will automatically organize and count them..."
                  className="theme-input w-full h-[350px] p-8 font-mono text-sm leading-relaxed scrollbar-hide focus:ring-8 focus:ring-accent/5"
                />
                <div className="mt-10 flex justify-end gap-6">
                  <button
                    onClick={() => setActiveModalSourceId(null)}
                    className="px-10 py-4 text-muted font-black uppercase tracking-widest hover:text-main transition-colors text-xs"
                  >
                    Discard
                  </button>
                  <button
                    onClick={saveText}
                    className="theme-button-primary px-12 py-4 uppercase tracking-widest text-xs"
                  >
                    Sync Content
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupPage;
