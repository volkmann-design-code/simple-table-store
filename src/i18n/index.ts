import en from './en.lang';
import de from './de.lang';
import type { Context } from 'hono';
import type { TranslationKeys } from './types';

type Language = 'en' | 'de';

// English is the complete reference, other languages are partial
const translations: Record<Language, TranslationKeys> = {
  en,
  // Merge partial German translations with English fallbacks
  de: mergeTranslations(en, de),
};

/**
 * Merge partial translations with English fallbacks
 */
function mergeTranslations(
  base: TranslationKeys,
  partial: Partial<TranslationKeys>
): TranslationKeys {
  return {
    common: { ...base.common, ...partial.common },
    auth: { ...base.auth, ...partial.auth },
    errors: { ...base.errors, ...partial.errors },
    dashboard: { ...base.dashboard, ...partial.dashboard },
    datastore: { ...base.datastore, ...partial.datastore },
    org: { ...base.org, ...partial.org },
  };
}

/**
 * Get the detected language from Hono context, falling back to 'en'
 */
export function getLanguage(c: Context): Language {
  const lang = c.get('language') as string | undefined;
  return (lang === 'de' ? 'de' : 'en') as Language;
}

/**
 * Translate a key with optional parameter substitution
 * @param lang - Language code ('en' or 'de')
 * @param key - Translation key in dot notation (e.g., 'auth.login')
 * @param params - Optional parameters for placeholder substitution (e.g., {name: 'File.pdf'})
 * @returns Translated string with parameters substituted
 */
export function t(lang: Language, key: string, params?: Record<string, string | number>): string {
  const translation = translations[lang] || translations.en;
  
  // Navigate nested object using dot notation
  const keys = key.split('.');
  let value: any = translation;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      value = translations.en;
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2];
        } else {
          return key; // Return key if even English doesn't have it
        }
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    return key; // Return key if value is not a string
  }
  
  // Substitute parameters
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? String(params[paramKey]) : match;
    });
  }
  
  return value;
}

/**
 * Helper to translate using context language
 */
export function tFromContext(c: Context, key: string, params?: Record<string, string | number>): string {
  return t(getLanguage(c), key, params);
}
