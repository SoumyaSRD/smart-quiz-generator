import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import { ThemeProvider } from './context/ThemeContext';
import SetupPage from './pages/SetupPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';

const App: React.FC = () => {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "");
  
  return (
    <ThemeProvider>
      <QuizProvider>
        <Router basename={basename}>
          {/* Main container with standard dark mode utilities */}
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<SetupPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/result" element={<ResultPage />} />
            </Routes>
          </div>
        </Router>
      </QuizProvider>
    </ThemeProvider>
  );
}

export default App;
