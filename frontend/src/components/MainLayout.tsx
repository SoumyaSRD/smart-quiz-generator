import React from 'react';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isQuizPage = location.pathname === '/quiz';

  return (
    <div className="flex min-h-screen">
      {!isQuizPage && <Sidebar />}
      <main className={`flex-grow transition-all duration-500 ${isQuizPage ? 'pl-0' : 'pl-20 lg:pl-72'}`}>
        {children}
      </main>
      {!isQuizPage && <Chatbot />}
    </div>
  );
};

export default MainLayout;
