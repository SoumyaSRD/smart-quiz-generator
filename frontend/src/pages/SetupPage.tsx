import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Settings, Play, FileText, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeOffcanvas } from '../components/ThemeOffcanvas';
import { useQuizStore } from '../store/useQuizStore';
import { formatMcqText } from '../utils/textFormatter';
import { quizService } from '../services/quizService';

const CATEGORIES = [
  "English", "Aptitude", "Reasoning", "Odia", 
  "Current Affairs", "Computer", "General Knowledge"
];

const SetupPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const startQuiz = useQuizStore((state) => state.startQuiz);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [activeModalCategory, setActiveModalCategory] = useState<string | null>(null);
  const [tempText, setTempText] = useState<string>("");
  const [autoFormat, setAutoFormat] = useState<boolean>(true);
  const [quizMode, setQuizMode] = useState<string>("multiple");

  const handleTempTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (autoFormat) {
      setTempText(formatMcqText(val));
    } else {
      setTempText(val);
    }
  };

  const [categoryConfigs, setCategoryConfigs] = useState<Record<string, number>>(
    [...CATEGORIES, "Mixed"].reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {})
  );
  
  const [generalConfig, setGeneralConfig] = useState({
    total_questions: 10,
    marks_per_question: 1,
    negative_marks: 0,
    duration_minutes: 10
  });

  const displayCategories = quizMode === "multiple" ? CATEGORIES : ["Mixed"];

  const handleFileChange = (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => ({ ...prev, [category]: selectedFiles }));
  };

  const openTextModal = (category: string) => {
    setActiveModalCategory(category);
    setTempText(texts[category] || "");
  };

  const saveText = () => {
    if (activeModalCategory) {
      // Apply the enterprise-level text formatter
      const formatted = formatMcqText(tempText);
      setTexts(prev => ({ ...prev, [activeModalCategory]: formatted }));
    }
    setActiveModalCategory(null);
    setTempText("");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleCategoryConfigChange = (category: string, value: string) => {
    setCategoryConfigs(prev => ({ ...prev, [category]: parseInt(value) || 0 }));
  };

  const handleGeneralConfigChange = (name: string, value: string) => {
    setGeneralConfig(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.entries(files).forEach(([category, fileList]) => {
      fileList.forEach(file => formData.append(`files_${category.replace(' ', '')}`, file));
    });
    Object.entries(texts).forEach(([category, text]) => {
      if (text) formData.append(`text_${category.replace(' ', '')}`, text);
    });
    Object.entries(categoryConfigs).forEach(([category, value]) => {
      formData.append(`config_${category.replace(' ', '')}`, value.toString());
    });
    Object.entries(generalConfig).forEach(([name, value]) => {
      formData.append(name, value.toString());
    });

    try {
      const data = await quizService.generateQuiz(formData);
      
      if (data.questions.length === 0) {
        alert("No questions could be extracted.");
      } else {
        startQuiz(data);
        navigate('/quiz');
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto p-8 theme-card">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-accent flex items-center gap-3">
            <div className="p-3 bg-accent text-white rounded-2xl">
              <Upload size={28} />
            </div>
            {t('title')}
          </h1>
          
          <div className="flex items-center gap-4">
            <ThemeOffcanvas />
            <div className="flex items-center gap-2 bg-main border border-theme p-1.5 rounded-xl">
              <Globe size={18} className="theme-text-muted ml-2" />
              <select 
                onChange={(e) => changeLanguage(e.target.value)}
                value={i18n.language}
                className="bg-transparent text-sm font-bold text-main focus:outline-none p-1 cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="or">ଓଡ଼ିଆ</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-10 p-6 bg-main border border-theme rounded-2xl flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-shrink-0">
            <label className="block text-xs font-black theme-text-muted mb-2 uppercase tracking-widest">{t('quiz_upload_mode')}</label>
            <select 
              value={quizMode}
              onChange={(e) => setQuizMode(e.target.value)}
              className="theme-input min-w-[280px] font-bold"
            >
              <option value="multiple">{t('subject_wise')}</option>
              <option value="mixed">{t('all_in_one')}</option>
            </select>
          </div>
          <div className="flex-grow">
            <p className="theme-text-muted text-sm font-medium leading-relaxed">
              {quizMode === "multiple" ? t('subject_wise_desc') : t('all_in_one_desc')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <div className="w-2 h-6 bg-accent rounded-full" /> {t('content_sources')}
              </h2>
              <div className="space-y-4">
                {displayCategories.map(category => (
                  <div key={category} className="p-6 border border-theme rounded-2xl bg-main/30 hover:border-accent/50 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-extrabold tracking-wide uppercase">
                        {t(`categories.${category}`, { defaultValue: category })}
                      </label>
                      {texts[category] && (
                        <span className="text-[10px] bg-green-500/20 text-green-500 px-2.5 py-1 rounded-full font-black uppercase tracking-tighter">{t('text_added')}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <input 
                            type="file" 
                            multiple 
                            accept=".pdf"
                            onChange={(e) => handleFileChange(category, e)}
                            className="theme-input w-full text-xs py-2.5 file:hidden cursor-pointer"
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none theme-text-muted">
                            <Upload size={14} />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openTextModal(category)}
                          className={`p-3 rounded-xl transition-all shadow-sm border border-theme ${texts[category] ? 'bg-green-600 text-white border-green-600' : 'bg-card text-main hover:bg-main'}`}
                        >
                          <FileText size={20} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black theme-text-muted uppercase flex-shrink-0">{t('pick_questions')}</span>
                        <input 
                          type="number"
                          placeholder="0"
                          value={categoryConfigs[category]}
                          onChange={(e) => handleCategoryConfigChange(category, e.target.value)}
                          className="theme-input w-full font-black text-center"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <div className="w-2 h-6 bg-accent rounded-full" /> {t('quiz_parameters')}
              </h2>
              <div className="p-8 border-2 border-theme rounded-3xl bg-main/20 space-y-6 shadow-inner">
                {[
                  { label: t('total_questions'), key: 'total_questions', type: 'number' },
                  { label: t('marks_per_question'), key: 'marks_per_question', type: 'number', step: '0.1' },
                  { label: t('negative_marks'), key: 'negative_marks', type: 'number', step: '0.1' },
                  { label: t('time_limit'), key: 'duration_minutes', type: 'number' }
                ].map((input) => (
                  <div key={input.key}>
                    <label className="block text-xs font-black theme-text-muted uppercase tracking-widest mb-2">{input.label}</label>
                    <input 
                      type={input.type}
                      step={input.step}
                      value={(generalConfig as any)[input.key]}
                      onChange={(e) => handleGeneralConfigChange(input.key, e.target.value)}
                      className="theme-input w-full font-black text-lg py-3"
                    />
                  </div>
                ))}
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="theme-button-primary w-full py-5 text-xl shadow-xl flex items-center justify-center gap-3"
              >
                {loading ? t('processing') : <><Play size={24} className="fill-current" /> {t('generate_btn')}</>}
              </button>
            </div>
          </div>
        </form>

        {activeModalCategory && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4 backdrop-blur-md">
            <div className="bg-card rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-theme">
              <div className="p-6 border-b border-theme flex justify-between items-center bg-accent text-white">
                <h3 className="font-black text-xl flex items-center gap-3 tracking-tight uppercase">
                  <FileText size={24} /> {t('paste_text_title', { category: t(`categories.${activeModalCategory}`, { defaultValue: activeModalCategory }) })}
                </h3>
                <button onClick={() => setActiveModalCategory(null)} className="hover:bg-black/10 p-2 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8">
                <div className="bg-main p-5 rounded-2xl border border-theme mb-6 shadow-inner flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black theme-text-muted mb-3 uppercase tracking-widest">{t('format_required')}</p>
                    <code className="text-[11px] text-accent font-mono block whitespace-pre leading-relaxed font-bold">
                      1. Question Text?{"\n"}
                      A) Option 1{"\n"}
                      B) Option 2{"\n"}
                      C) Option 3{"\n"}
                      D) Option 4{"\n"}
                      Answer: A
                    </code>
                  </div>
                  <div className="flex flex-col items-end">
                    <label className="text-[10px] font-black theme-text-muted uppercase mb-2 tracking-widest">Auto Format</label>
                    <button 
                      onClick={() => setAutoFormat(!autoFormat)}
                      className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${autoFormat ? 'bg-accent' : 'bg-gray-400'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${autoFormat ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
                <textarea
                  value={tempText}
                  onChange={handleTempTextChange}
                  placeholder={t('placeholder_text')}
                  className="theme-input w-full h-80 p-5 font-mono text-sm leading-relaxed"
                />
                <div className="mt-8 flex justify-end gap-4">
                  <button
                    onClick={() => setActiveModalCategory(null)}
                    className="px-8 py-3 text-muted font-black uppercase tracking-widest hover:bg-main rounded-2xl transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={saveText}
                    className="theme-button-primary px-10 py-3 uppercase tracking-widest"
                  >
                    {t('save_questions')}
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
