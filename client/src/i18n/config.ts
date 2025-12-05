import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: 'en', // default language
    fallbackLng: 'en',
    ns: ['common', 'auth'], // namespaces
    defaultNS: 'common',
    backend: {
      loadPath: '/src/i18n/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

export default i18n; 