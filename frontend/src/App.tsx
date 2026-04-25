import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SetupPage from './pages/SetupPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';

const App: React.FC = () => {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "");
  
  return (
    <Router basename={basename}>
      <div className="min-h-screen transition-colors duration-300">
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
