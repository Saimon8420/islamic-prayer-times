import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { locales } from './index';
import type { Language, TranslationKeys } from './types';

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T & string]: T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K }[keyof T & string]
  : never;

type TranslationKey = NestedKeyOf<TranslationKeys>;

function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}

export function useTranslation() {
  const language = useStore((state) => state.language);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const value = getNestedValue(locales[language], key);
      if (value !== undefined) return interpolate(value, params);
      // Fallback to English
      if (language !== 'en') {
        const fallback = getNestedValue(locales.en, key);
        if (fallback !== undefined) return interpolate(fallback, params);
      }
      return key;
    },
    [language]
  );

  return { t, language: language as Language };
}
