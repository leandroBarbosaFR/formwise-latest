import type { Link, Settings, Translation } from './types';

export interface LinkContext {
	lang: string;
	settings: Settings | null;
}

export const homePath = (lang: string) => `/${lang}/`;
export const blogPath = (lang: string) => `/${lang}/blog/`;
export const postPath = (lang: string, slug: string) => `/${lang}/blog/${slug}/`;
export const pagePath = (lang: string, slug: string) => `/${lang}/${slug}/`;

// Turns a Sanity link object into an href in the current language
export function resolveHref(link: Link | undefined | null, { lang, settings }: LinkContext): string | undefined {
	if (!link) return undefined;
	const hash = link.anchor ? `#${link.anchor}` : '';

	if (link.linkType === 'external') return link.url;
	if (link.linkType === 'anchor' && !link.target) return hash || undefined;

	const target = link.target;
	if (!target) return hash || undefined;

	let path: string | undefined;
	if (target._id === settings?.homePageId) path = homePath(lang);
	else if (target._id === settings?.blogPageId) path = blogPath(lang);
	else if (target._type === 'post' && target.slug) path = postPath(lang, target.slug);
	else if (target.slug) path = pagePath(lang, target.slug);

	return path ? path + hash : hash || undefined;
}

export const linkAttributes = (link: Link | undefined | null) =>
	link?.linkType === 'external' && link.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};

// URL of the same document in every language it exists in, for the language switcher and hreflang
export function alternatesFor(
	translations: (Translation | null)[] | undefined,
	available: string[],
	kind: 'home' | 'blog' | 'page' | 'post',
): Record<string, string> {
	const result: Record<string, string> = {};
	for (const lang of available) {
		if (kind === 'home') result[lang] = homePath(lang);
		else if (kind === 'blog') result[lang] = blogPath(lang);
	}
	for (const t of translations ?? []) {
		if (!t?.slug || !available.includes(t.language)) continue;
		if (kind === 'post') result[t.language] = postPath(t.language, t.slug);
		if (kind === 'page') result[t.language] = pagePath(t.language, t.slug);
	}
	return result;
}

export const fillTemplate = (template: string | undefined, values: Record<string, string | number>) =>
	(template ?? '').replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
