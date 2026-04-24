import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { CheckCircle2, XCircle, AlertCircle, RefreshCcw, Check, X } from 'lucide-react';

const ResultPage = () => {
  const navigate = useNavigate();
  const { questions, userAnswers, calculateResults, isSubmitted } = useQuiz();

  if (!isSubmitted) {
    navigate('/');
    return null;
  }

  const { score, correct, wrong, skipped, totalQuestions } = calculateResults();
  const percentage = ((score / (totalQuestions * (questions[0]?.marks_per_question || 1))) * 100).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="bg-blue-600 p-8 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
          <div className="text-6xl font-black mt-4">{score.toFixed(1)}</div>
          <div className="text-blue-100 uppercase tracking-widest text-sm mt-1">Total Marks Obtained</div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-b">
          <div className="p-6 text-center">
            <div className="flex justify-center mb-2 text-green-500"><CheckCircle2 /></div>
            <div className="text-2xl font-bold">{correct}</div>
            <div className="text-gray-500 text-xs uppercase">Correct</div>
          </div>
          <div className="p-6 text-center">
            <div className="flex justify-center mb-2 text-red-500"><XCircle /></div>
            <div className="text-2xl font-bold">{wrong}</div>
            <div className="text-gray-500 text-xs uppercase">Wrong</div>
          </div>
          <div className="p-6 text-center">
            <div className="flex justify-center mb-2 text-orange-500"><AlertCircle /></div>
            <div className="text-2xl font-bold">{skipped}</div>
            <div className="text-gray-500 text-xs uppercase">Skipped</div>
          </div>
          <div className="p-6 text-center">
            <div className="flex justify-center mb-2 text-blue-500"><CheckCircle2 /></div>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <div className="text-gray-500 text-xs uppercase">Total Items</div>
          </div>
        </div>

        <div className="p-6 flex justify-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg"
          >
            <RefreshCcw className="w-5 h-5" /> Take Another Quiz
          </button>
        </div>
      </div>

      {/* Review Section */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Question Review</h2>
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <ReviewCard 
            key={idx} 
            question={q} 
            index={idx} 
            userAnswer={userAnswers[idx]} 
          />
        ))}
      </div>
    </div>
  );
};

const ReviewCard = ({ question, index, userAnswer }) => {
  const isCorrect = userAnswer === question.answer;
  const isSkipped = !userAnswer;

  return (
    <div className={`bg-white p-6 rounded-xl border-l-8 shadow-sm ${
      isSkipped ? 'border-l-orange-400' : isCorrect ? 'border-l-green-500' : 'border-l-red-500'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{question.category}</span>
        {isSkipped ? (
          <span className="text-orange-600 font-bold text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Skipped</span>
        ) : isCorrect ? (
          <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Correct</span>
        ) : (
          <span className="text-red-600 font-bold text-sm flex items-center gap-1"><XCircle className="w-4 h-4" /> Incorrect</span>
        )}
      </div>
      
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        <span className="font-bold mr-2">{index + 1}.</span> {question.question}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(question.options).map(([key, value]) => {
          let bgColor = 'bg-gray-50';
          let textColor = 'text-gray-700';
          let borderColor = 'border-gray-100';
          let Icon = null;

          if (key === question.answer) {
            bgColor = 'bg-green-50';
            textColor = 'text-green-800';
            borderColor = 'border-green-200';
            Icon = Check;
          } else if (key === userAnswer && !isCorrect) {
            bgColor = 'bg-red-50';
            textColor = 'text-red-800';
            borderColor = 'border-red-200';
            Icon = X;
          }

          return (
            <div key={key} className={`flex items-center p-3 rounded-lg border ${bgColor} ${textColor} ${borderColor}`}>
              <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 text-xs font-bold ${
                key === question.answer ? 'bg-green-500 text-white' : key === userAnswer ? 'bg-red-500 text-white' : 'bg-white border text-gray-400'
              }`}>
                {key}
              </span>
              <span className="flex-grow">{value}</span>
              {Icon && <Icon className="w-4 h-4 ml-2" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultPage;
