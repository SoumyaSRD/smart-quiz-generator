import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enDashboard from './locales/dashboard/en.json';
import hiDashboard from './locales/dashboard/hi.json';
import frDashboard from './locales/dashboard/fr.json';
import esDashboard from './locales/dashboard/es.json';
import orDashboard from './locales/dashboard/or.json';

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        dashboard: enDashboard,
      },
      hi: {
        dashboard: hiDashboard,
      },
      fr: {
        dashboard: frDashboard,
      },
      es: {
        dashboard: esDashboard,
      },
      or: {
        dashboard: orDashboard,
      },
    },
    ns: ['dashboard'],
    defaultNS: 'dashboard',
  });

export default i18next;
