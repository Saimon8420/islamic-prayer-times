import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useLanguageEffect() {
  const language = useStore((state) => state.language);

  useEffect(() => {
    const html = document.documentElement;

    // Clean up any previously set attributes/classes
    html.removeAttribute('dir');
    html.removeAttribute('lang');
    document.body.classList.remove('lang-bn', 'lang-ar');

    if (language === 'ar') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
      document.body.classList.add('lang-ar');
    } else if (language === 'bn') {
      html.setAttribute('lang', 'bn');
      document.body.classList.add('lang-bn');
    }
    // English: no attributes set — restore <html> to its original state
  }, [language]);
}
