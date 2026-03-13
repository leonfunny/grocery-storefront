export const locales = ['pl', 'en', 'de', 'uk', 'vi', 'ru', 'zh', 'tr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pl';
