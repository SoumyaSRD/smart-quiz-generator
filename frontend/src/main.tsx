import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.scss'
import './i18n'
import App from './App.tsx'
import GlobalErrorBoundary from './components/GlobalErrorBoundary'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>,
)
