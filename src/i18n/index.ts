import type { Language, TranslationKeys } from './types';
import { en } from './en';
import { bn } from './bn';
import { ar } from './ar';

export type { Language, TranslationKeys };

export const locales: Record<Language, TranslationKeys> = { en, bn, ar };

export const LANGUAGE_OPTIONS: { id: Language; label: string; nativeLabel: string }[] = [
  { id: 'en', label: 'English', nativeLabel: 'English' },
  { id: 'bn', label: 'Bangla', nativeLabel: 'বাংলা' },
  { id: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
];
