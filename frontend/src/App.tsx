import React from 'react';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import SetupPage from './pages/SetupPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import LoginPage from './pages/LoginPage';
import HelpPage from './pages/HelpPage';
import PreferencesPage from './pages/PreferencesPage';
import AuthGuard from './components/AuthGuard';
import MainLayout from './components/MainLayout';

const App: React.FC = () => {
  // Use basename from environment (Standard for Vite/GitHub Pages)
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

  const router = createHashRouter([
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/",
      element: <AuthGuard><MainLayout><SetupPage /></MainLayout></AuthGuard>,
    },
    {
      path: "/quiz",
      element: <AuthGuard><MainLayout><QuizPage /></MainLayout></AuthGuard>,
    },
    {
      path: "/result",
      element: <AuthGuard><MainLayout><ResultPage /></MainLayout></AuthGuard>,
    },
    {
      path: "/help",
      element: <AuthGuard><MainLayout><HelpPage /></MainLayout></AuthGuard>,
    },
    {
      path: "/settings",
      element: <AuthGuard><MainLayout><PreferencesPage /></MainLayout></AuthGuard>,
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    }
  ], {
    basename: basename
  });

  return (
    <div className="min-h-screen transition-colors duration-300">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
