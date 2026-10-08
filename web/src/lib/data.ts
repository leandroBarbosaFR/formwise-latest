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

// Pages are rendered on the server whenever their cache expires, so shared data is only kept for
// a few seconds: enough to fetch it once per page render, short enough that it is never stale
const TTL_MS = 5000;
const cache = new Map<string, { at: number; value: Promise<unknown> }>();
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
	const hit = cache.get(key);
	if (hit && Date.now() - hit.at < TTL_MS) return hit.value as Promise<T>;
	const value = load();
	cache.set(key, { at: Date.now(), value });
	// A failed request is not kept
	value.catch(() => cache.delete(key));
	return value;
}

// Languages with general settings in Sanity, in the order of LANGUAGES
export function getLanguages(): Promise<string[]> {
	return cached('languages', () =>
		sanityClient.fetch<string[]>(LANGUAGES_QUERY).then((found) => {
			const available = new Set([BASE_LANGUAGE, ...(found ?? [])]);
			return LANGUAGES.map((l) => l.id).filter((id) => available.has(id));
		}),
	);
}

export function getLayout(lang: string): Promise<LayoutData> {
	return cached(`layout:${lang}`, () => sanityClient.fetch<LayoutData>(LAYOUT_QUERY, { lang }));
}

export async function getSiteContext(lang: string, alternates: Record<string, string>): Promise<SiteContext> {
	const [languages, layout] = await Promise.all([getLanguages(), getLayout(lang)]);
	return { lang, languages, layout, alternates };
}
