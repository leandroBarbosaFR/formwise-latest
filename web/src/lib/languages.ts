// The languages the website is published in. Keep in sync with studio/languages.ts and
// functions/translate/index.ts. Pages of removed languages are redirected in vercel.json.
export const BASE_LANGUAGE = 'fr';

export const LANGUAGES = [
	{ id: 'fr', title: 'French', native: 'Français' },
	{ id: 'en', title: 'English', native: 'English' },
	{ id: 'es', title: 'Spanish', native: 'Español' },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]['id'];

export const languageName = (id: string) => LANGUAGES.find((l) => l.id === id)?.native ?? id;
