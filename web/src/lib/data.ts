import { sanityClient } from 'sanity:client';
import { BASE_LANGUAGE, LANGUAGES } from './languages';
import { LANGUAGES_QUERY, LAYOUT_QUERY } from './queries';
import type { LayoutData } from './types';

export interface SiteContext {
	lang: string;
	// Languages the website is built in
	languages: string[];
	layout: LayoutData;
	// URL of the current page in each available language
	alternates: Record<string, string>;
}

// Cached for the duration of a production build, where every page needs the same data.
// The dev server always fetches fresh content.
const cache = import.meta.env.PROD;
let languagesPromise: Promise<string[]> | undefined;
const layoutCache = new Map<string, Promise<LayoutData>>();

// Languages with general settings in Sanity, in the order of LANGUAGES
export function getLanguages(): Promise<string[]> {
	if (!cache) languagesPromise = undefined;
	languagesPromise ??= sanityClient.fetch<string[]>(LANGUAGES_QUERY).then((found) => {
		const available = new Set([BASE_LANGUAGE, ...(found ?? [])]);
		return LANGUAGES.map((l) => l.id).filter((id) => available.has(id));
	});
	return languagesPromise;
}

export function getLayout(lang: string): Promise<LayoutData> {
	if (!cache || !layoutCache.has(lang)) layoutCache.set(lang, sanityClient.fetch<LayoutData>(LAYOUT_QUERY, { lang }));
	return layoutCache.get(lang)!;
}

export async function getSiteContext(lang: string, alternates: Record<string, string>): Promise<SiteContext> {
	const [languages, layout] = await Promise.all([getLanguages(), getLayout(lang)]);
	return { lang, languages, layout, alternates };
}
