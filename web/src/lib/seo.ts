import { toPlainText } from 'astro-portabletext';
import type { SiteContext } from './data';
import { blogPath, homePath } from './links';
import { urlFor } from './sanity';
import type { Page, Post, RichText, Section } from './types';

export const SITE_URL = 'https://formwise.fr';
export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;

// Open Graph locales (language_TERRITORY) for the 24 EU languages
const OG_LOCALES: Record<string, string> = {
	en: 'en_GB', bg: 'bg_BG', cs: 'cs_CZ', da: 'da_DK', de: 'de_DE', el: 'el_GR', es: 'es_ES', et: 'et_EE',
	fi: 'fi_FI', fr: 'fr_FR', ga: 'ga_IE', hr: 'hr_HR', hu: 'hu_HU', it: 'it_IT', lt: 'lt_LT', lv: 'lv_LV',
	mt: 'mt_MT', nl: 'nl_NL', pl: 'pl_PL', pt: 'pt_PT', ro: 'ro_RO', sk: 'sk_SK', sl: 'sl_SI', sv: 'sv_SE',
};
export const ogLocale = (lang: string) => OG_LOCALES[lang] ?? lang;

const text = (value?: RichText) => (value?.length ? toPlainText(value) : '');

type JsonLd = Record<string, unknown>;

const organizationId = `${SITE_URL}/#organization`;
const websiteId = (lang: string) => `${absoluteUrl(homePath(lang))}#website`;

// Organization and WebSite: on every page, referenced by the page-level graph
export function siteGraph(ctx: SiteContext): JsonLd[] {
	const { settings } = ctx.layout;
	const name = settings?.siteName ?? 'Formwise';
	return [
		{
			'@type': 'Organization',
			'@id': organizationId,
			name,
			url: SITE_URL,
			logo: { '@type': 'ImageObject', url: absoluteUrl('/favicon/web-app-manifest-512x512.png'), width: 512, height: 512 },
			description: settings?.siteDescription,
			email: settings?.email,
			telephone: settings?.phone,
			sameAs: settings?.socialLinks?.map((social) => social.url),
		},
		{
			'@type': 'WebSite',
			'@id': websiteId(ctx.lang),
			name,
			url: absoluteUrl(homePath(ctx.lang)),
			inLanguage: ctx.lang,
			description: settings?.siteDescription,
			publisher: { '@id': organizationId },
		},
	];
}

function breadcrumbs(ctx: SiteContext, trail: { name: string; path: string }[]): JsonLd {
	const home = { name: ctx.layout.settings?.siteName ?? 'Formwise', path: homePath(ctx.lang) };
	return {
		'@type': 'BreadcrumbList',
		itemListElement: [home, ...trail].map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: absoluteUrl(item.path),
		})),
	};
}

// "299 €" → { price: 299, priceCurrency: 'EUR' }
function parsePrice(value: string) {
	const amount = Number(value.replace(/[^\d,.]/g, '').replace(',', '.'));
	const currency = value.includes('€') ? 'EUR' : value.includes('£') ? 'GBP' : value.includes('$') ? 'USD' : undefined;
	return Number.isFinite(amount) && currency ? { price: amount, priceCurrency: currency } : undefined;
}

const sectionsOf = (page: Page, type: string) => (page.sections ?? []).filter((s) => s._type === type);

function faqPage(sections: Section[], url: string): JsonLd | undefined {
	const faqs = sections.flatMap((s) => (s.faqs ?? []).filter(Boolean));
	if (!faqs.length) return undefined;
	return {
		'@type': 'FAQPage',
		'@id': `${url}#faq`,
		mainEntity: faqs.map((faq: { question: string; answer?: RichText }) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: { '@type': 'Answer', text: text(faq.answer) },
		})),
	};
}

function softwareApplication(ctx: SiteContext, sections: Section[], url: string): JsonLd | undefined {
	const plans = sections.flatMap((s) => (s.plans ?? []).filter(Boolean));
	if (!plans.length) return undefined;
	const offers = plans
		.map((plan: { name: string; price: string; description?: string }) => {
			const price = parsePrice(plan.price);
			return price && { '@type': 'Offer', name: plan.name, description: plan.description, ...price, url: `${url}#pricing` };
		})
		.filter(Boolean);
	return {
		'@type': 'SoftwareApplication',
		name: ctx.layout.settings?.siteName ?? 'Formwise',
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Web',
		description: ctx.layout.settings?.siteDescription,
		url,
		inLanguage: ctx.lang,
		publisher: { '@id': organizationId },
		offers,
	};
}

// Structured data for a page built from sections
export function pageGraph(ctx: SiteContext, page: Page, path: string, kind: 'home' | 'blog' | 'page'): JsonLd[] {
	const url = absoluteUrl(path);
	const pageType =
		kind === 'blog' ? 'CollectionPage' : page.slug === 'about' ? 'AboutPage' : page.slug === 'contact' ? 'ContactPage' : 'WebPage';
	const graph: (JsonLd | undefined)[] = [
		{
			'@type': pageType,
			'@id': url,
			url,
			name: page.seo?.title ?? page.title,
			description: page.seo?.description ?? ctx.layout.settings?.siteDescription,
			inLanguage: ctx.lang,
			isPartOf: { '@id': websiteId(ctx.lang) },
			about: { '@id': organizationId },
		},
		kind === 'home' ? undefined : breadcrumbs(ctx, [{ name: page.title, path }]),
		faqPage(sectionsOf(page, 'faqSection'), url),
		softwareApplication(ctx, sectionsOf(page, 'pricingSection'), url),
	];
	return graph.filter((item): item is JsonLd => Boolean(item));
}

export function postGraph(ctx: SiteContext, post: Post, path: string, blogTitle?: string): JsonLd[] {
	const url = absoluteUrl(path);
	return [
		{
			'@type': 'BlogPosting',
			'@id': url,
			mainEntityOfPage: url,
			url,
			headline: post.title,
			description: post.seo?.description ?? post.excerpt,
			image: post.coverImage ? urlFor(post.coverImage).width(1200).height(630).fit('crop').url() : undefined,
			datePublished: post.publishedAt,
			dateModified: post._updatedAt ?? post.publishedAt,
			inLanguage: ctx.lang,
			articleSection: post.categories?.find(Boolean)?.title,
			wordCount: text(post.body).split(/\s+/).filter(Boolean).length || undefined,
			author: post.author ? { '@type': 'Person', name: post.author.name, jobTitle: post.author.role } : { '@id': organizationId },
			publisher: { '@id': organizationId },
			isPartOf: { '@id': websiteId(ctx.lang) },
		},
		breadcrumbs(ctx, [
			{ name: blogTitle ?? 'Blog', path: blogPath(ctx.lang) },
			{ name: post.title, path },
		]),
	];
}
