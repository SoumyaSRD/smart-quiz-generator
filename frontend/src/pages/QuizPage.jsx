import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { ChevronLeft, ChevronRight, Send, Clock, Layout, List } from 'lucide-react';

const QuizPage = () => {
  const navigate = useNavigate();
  const { 
    questions, 
    userAnswers, 
    selectAnswer, 
    timeRemaining, 
    setTimeRemaining, 
    submitQuiz,
    config
  } = useQuiz();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewAll, setViewAll] = useState(false);

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
  }, [questions, navigate]);

  const handleSubmit = () => {
    submitQuiz();
    navigate('/result');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header Info */}
      <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6 sticky top-4 z-10 border">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${timeRemaining < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <Clock className="w-5 h-5" /> {formatTime(timeRemaining)}
          </div>
          <div className="text-gray-600 font-medium">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>
        
        <div className="flex gap-2 mt-2 md:mt-0">
          <button 
            onClick={() => setViewAll(!viewAll)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {viewAll ? <Layout className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {viewAll ? "Single View" : "View All"}
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md font-bold hover:bg-green-700 shadow-md"
          >
            <Send className="w-4 h-4" /> Submit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {viewAll ? (
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <QuestionCard 
                  key={idx} 
                  question={q} 
                  index={idx} 
                  selectedOption={userAnswers[idx]} 
                  onSelect={(opt) => selectAnswer(idx, opt)} 
                />
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <QuestionCard 
                question={currentQuestion} 
                index={currentIndex} 
                selectedOption={userAnswers[currentIndex]} 
                onSelect={(opt) => selectAnswer(currentIndex, opt)} 
              />
              
              <div className="flex justify-between mt-8">
                <button 
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border rounded-lg shadow-sm disabled:opacity-30"
                >
                  <ChevronLeft /> Previous
                </button>
                <button 
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md disabled:opacity-30"
                >
                  Next <ChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Navigation Grid */}
        <div className="hidden lg:block">
          <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-28">
            <h3 className="font-bold mb-4 text-gray-700">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setViewAll(false);
                  }}
                  className={`w-10 h-10 rounded-md flex items-center justify-center font-medium transition-colors ${
                    currentIndex === idx 
                      ? 'bg-blue-600 text-white' 
                      : userAnswers[idx] 
                        ? 'bg-green-100 text-green-700 border-green-200 border' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div> <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div> <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-100 rounded"></div> <span>Not Answered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionCard = ({ question, index, selectedOption, onSelect }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full uppercase tracking-wider">
          {question.category}
        </span>
      </div>
      <h2 className="text-xl font-medium text-gray-800 mb-8">
        <span className="font-bold mr-2">{index + 1}.</span> {question.question}
      </h2>
      
      <div className="space-y-4">
        {Object.entries(question.options).map(([key, value]) => (
          <label 
            key={key}
            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedOption === key 
                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                : 'border-gray-100 hover:border-gray-300'
            }`}
          >
            <input 
              type="radio"
              name={`q-${index}`}
              className="hidden"
              checked={selectedOption === key}
              onChange={() => onSelect(key)}
            />
            <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 font-bold border ${
              selectedOption === key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500'
            }`}>
              {key}
            </span>
            <span className="text-gray-700 font-medium">{value}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuizPage;
