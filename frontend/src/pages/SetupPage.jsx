import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { Upload, Settings, Play, FileText, X } from 'lucide-react';

const CATEGORIES = [
  "English", "Aptitude", "Reasoning", "Odia", 
  "Current Affairs", "Computer", "General Knowledge"
];

const SetupPage = () => {
  const navigate = useNavigate();
  const { startQuiz } = useQuiz();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({});
  const [texts, setTexts] = useState({});
  const [activeModalCategory, setActiveModalCategory] = useState(null);
  const [tempText, setTempText] = useState("");
  const [quizMode, setQuizMode] = useState("multiple");

  const [categoryConfigs, setCategoryConfigs] = useState(
    [...CATEGORIES, "Mixed"].reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {})
  );
  const [generalConfig, setGeneralConfig] = useState({
    total_questions: 10,
    marks_per_question: 1,
    negative_marks: 0,
    duration_minutes: 10
  });

  const displayCategories = quizMode === "multiple" ? CATEGORIES : ["Mixed"];

  const handleFileChange = (category, e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => ({ ...prev, [category]: selectedFiles }));
  };

  const openTextModal = (category) => {
    setActiveModalCategory(category);
    setTempText(texts[category] || "");
  };

  const saveText = () => {
    setTexts(prev => ({ ...prev, [activeModalCategory]: tempText }));
    setActiveModalCategory(null);
    setTempText("");
  };

  const handleCategoryConfigChange = (category, value) => {
    setCategoryConfigs(prev => ({ ...prev, [category]: parseInt(value) || 0 }));
  };

  const handleGeneralConfigChange = (name, value) => {
    setGeneralConfig(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    
    // Add files
    Object.entries(files).forEach(([category, fileList]) => {
      fileList.forEach(file => {
        formData.append(`files_${category.replace(' ', '')}`, file);
      });
    });

    // Add texts
    Object.entries(texts).forEach(([category, text]) => {
      if (text) {
        formData.append(`text_${category.replace(' ', '')}`, text);
      }
    });

    // Add category configs
    Object.entries(categoryConfigs).forEach(([category, value]) => {
      formData.append(`config_${category.replace(' ', '')}`, value);
    });

    // Add general config
    Object.entries(generalConfig).forEach(([name, value]) => {
      formData.append(name, value);
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/upload-and-generate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.questions.length === 0) {
        alert("No questions could be extracted. Please check your PDF/Text format.");
      } else {
        startQuiz(response.data);
        navigate('/quiz');
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-8 flex items-center gap-2">
        <Upload /> Quiz Generator Setup
      </h1>

      <div className="mb-8 p-6 bg-gray-50 border rounded-xl flex flex-col md:flex-row md:items-center gap-6 shadow-sm">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Quiz Upload Mode</label>
          <select 
            value={quizMode}
            onChange={(e) => setQuizMode(e.target.value)}
            className="p-3 border-2 border-blue-100 rounded-lg bg-white w-full md:w-80 font-medium text-gray-700 focus:border-blue-500 focus:ring-0 transition-all cursor-pointer"
          >
            <option value="multiple">Subject Wise (English, Aptitude, etc.)</option>
            <option value="mixed">All-in-One (Mixed/Global)</option>
          </select>
        </div>
        <div className="flex-grow">
          <p className="text-sm text-gray-600 leading-relaxed">
            {quizMode === "multiple" 
              ? "Best for segmented quizzes. Upload separate PDFs for different subjects to maintain a balanced ratio." 
              : "Best for quick quizzes. Use a single source for all questions (Mixed PDF or Text Paste)."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Upload Sections */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Content Sources</h2>
            {displayCategories.map(category => (
              <div key={category} className="p-4 border rounded-md bg-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">{category}</label>
                  {texts[category] && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Text Added</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      multiple 
                      accept=".pdf"
                      onChange={(e) => handleFileChange(category, e)}
                      className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 flex-grow"
                    />
                    <button
                      type="button"
                      onClick={() => openTextModal(category)}
                      className={`p-2 rounded-md transition-colors ${texts[category] ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      title="Paste Text Content"
                    >
                      <FileText size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Questions to pick:</span>
                    <input 
                      type="number"
                      placeholder="Count"
                      value={categoryConfigs[category]}
                      onChange={(e) => handleCategoryConfigChange(category, e.target.value)}
                      className="w-full p-1.5 border rounded-md text-sm"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Configuration Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Quiz Parameters
            </h2>
            <div className="p-6 border rounded-md bg-blue-50 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Quiz Questions</label>
                <input 
                  type="number"
                  value={generalConfig.total_questions}
                  onChange={(e) => handleGeneralConfigChange('total_questions', e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Marks per Question</label>
                <input 
                  type="number"
                  step="0.1"
                  value={generalConfig.marks_per_question}
                  onChange={(e) => handleGeneralConfigChange('marks_per_question', e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Negative Marks (e.g., 0.25)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={generalConfig.negative_marks}
                  onChange={(e) => handleGeneralConfigChange('negative_marks', e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Limit (Minutes)</label>
                <input 
                  type="number"
                  value={generalConfig.duration_minutes}
                  onChange={(e) => handleGeneralConfigChange('duration_minutes', e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-lg text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-95 transition-all'}`}
            >
              {loading ? "Processing Content..." : <><Play /> Generate & Start Quiz</>}
            </button>
          </div>
        </div>
      </form>

      {/* Text Paste Modal */}
      {activeModalCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
              <h3 className="font-bold flex items-center gap-2">
                <FileText size={20} /> Paste Text Content: {activeModalCategory}
              </h3>
              <button onClick={() => setActiveModalCategory(null)} className="hover:bg-blue-700 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <p className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">Standard Format Required:</p>
                <code className="text-[11px] text-blue-700 font-mono block whitespace-pre">
                  1. Question Text?{"\n"}
                  A) Option 1{"\n"}
                  B) Option 2{"\n"}
                  C) Option 3{"\n"}
                  D) Option 4{"\n"}
                  Answer: A
                </code>
              </div>
              <textarea
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                placeholder="Paste your questions here..."
                className="w-full h-80 p-4 border-2 rounded-xl focus:border-blue-500 focus:outline-none font-mono text-sm shadow-inner"
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setActiveModalCategory(null)}
                  className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveText}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md active:scale-95 transition-all"
                >
                  Save Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupPage;
