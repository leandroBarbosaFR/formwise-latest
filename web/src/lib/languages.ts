// The 24 official EU languages. Keep in sync with studio/languages.ts.
export const BASE_LANGUAGE = 'en';

export const LANGUAGES = [
	{ id: 'en', title: 'English', native: 'English' },
	{ id: 'bg', title: 'Bulgarian', native: 'Български' },
	{ id: 'cs', title: 'Czech', native: 'Čeština' },
	{ id: 'da', title: 'Danish', native: 'Dansk' },
	{ id: 'de', title: 'German', native: 'Deutsch' },
	{ id: 'el', title: 'Greek', native: 'Ελληνικά' },
	{ id: 'es', title: 'Spanish', native: 'Español' },
	{ id: 'et', title: 'Estonian', native: 'Eesti' },
	{ id: 'fi', title: 'Finnish', native: 'Suomi' },
	{ id: 'fr', title: 'French', native: 'Français' },
	{ id: 'ga', title: 'Irish', native: 'Gaeilge' },
	{ id: 'hr', title: 'Croatian', native: 'Hrvatski' },
	{ id: 'hu', title: 'Hungarian', native: 'Magyar' },
	{ id: 'it', title: 'Italian', native: 'Italiano' },
	{ id: 'lt', title: 'Lithuanian', native: 'Lietuvių' },
	{ id: 'lv', title: 'Latvian', native: 'Latviešu' },
	{ id: 'mt', title: 'Maltese', native: 'Malti' },
	{ id: 'nl', title: 'Dutch', native: 'Nederlands' },
	{ id: 'pl', title: 'Polish', native: 'Polski' },
	{ id: 'pt', title: 'Portuguese', native: 'Português' },
	{ id: 'ro', title: 'Romanian', native: 'Română' },
	{ id: 'sk', title: 'Slovak', native: 'Slovenčina' },
	{ id: 'sl', title: 'Slovenian', native: 'Slovenščina' },
	{ id: 'sv', title: 'Swedish', native: 'Svenska' },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]['id'];

export const languageName = (id: string) => LANGUAGES.find((l) => l.id === id)?.native ?? id;
