import type { APIRoute } from 'astro';
import { sanityClient } from 'sanity:client';
import { getLanguages, getLayout } from '../lib/data';
import { BASE_LANGUAGE } from '../lib/languages';
import { blogPath, homePath, pagePath, postPath } from '../lib/links';
import { SITEMAP_QUERY } from '../lib/queries';
import { absoluteUrl } from '../lib/seo';

interface Entry {
	_id: string;
	_type: 'page' | 'post';
	language: string;
	slug: string;
	_updatedAt: string;
	noIndex?: boolean;
	group?: string;
}

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Every published page in every language, each listing its translations (hreflang) so Google
// understands they are versions of the same page.
export const GET: APIRoute = async () => {
	const languages = await getLanguages();
	const entries = await sanityClient.fetch<Entry[]>(SITEMAP_QUERY, { languages });

	const homeIds = new Set<string>();
	const blogIds = new Set<string>();
	for (const lang of languages) {
		const { settings } = await getLayout(lang);
		if (settings?.homePageId) homeIds.add(settings.homePageId);
		if (settings?.blogPageId) blogIds.add(settings.blogPageId);
	}

	const pathOf = (entry: Entry) => {
		if (homeIds.has(entry._id)) return homePath(entry.language);
		if (blogIds.has(entry._id)) return blogPath(entry.language);
		return entry._type === 'post' ? postPath(entry.language, entry.slug) : pagePath(entry.language, entry.slug);
	};

	const indexable = entries.filter((entry) => !entry.noIndex);
	const groups = new Map<string, Entry[]>();
	for (const entry of indexable) {
		const key = entry.group ?? entry._id;
		groups.set(key, [...(groups.get(key) ?? []), entry]);
	}

	const urls = indexable.map((entry) => {
		const versions = groups.get(entry.group ?? entry._id) ?? [entry];
		const base = versions.find((v) => v.language === BASE_LANGUAGE);
		const alternates = [
			...versions.map((v) => `<xhtml:link rel="alternate" hreflang="${v.language}" href="${escape(absoluteUrl(pathOf(v)))}"/>`),
			...(base ? [`<xhtml:link rel="alternate" hreflang="x-default" href="${escape(absoluteUrl(pathOf(base)))}"/>`] : []),
		];
		return [
			'<url>',
			`<loc>${escape(absoluteUrl(pathOf(entry)))}</loc>`,
			`<lastmod>${entry._updatedAt}</lastmod>`,
			...(versions.length > 1 ? alternates : []),
			'</url>',
		].join('');
	});

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
