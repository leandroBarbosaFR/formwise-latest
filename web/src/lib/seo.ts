import { toPlainText } from 'astro-portabletext';
import type { SiteContext } from './data';
import { blogPath, homePath } from './links';
import { urlFor } from './sanity';
import type { Page, Post, RichText, Section } from './types';

// The host that serves the pages (formwise.fr redirects here). Keep in sync with `site` in astro.config.mjs.
export const SITE_URL = 'https://www.formwise.fr';
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
// Placeholder contact details from the starter content (hello@example.com) must never reach
// search engines or AI assistants
export const realEmail = (email?: string) => (email && !/@example\.(com|org|net)$/i.test(email) ? email : undefined);

// Organization and WebSite: on every page, referenced by the page-level graph
export function siteGraph(ctx: SiteContext): JsonLd[] {
	const { settings } = ctx.layout;
	const name = settings?.siteName ?? 'Formwise';
	const email = realEmail(settings?.email);
	const sameAs = settings?.socialLinks?.map((social) => social.url).filter(Boolean);
	return [
		{
			'@type': 'Organization',
			'@id': organizationId,
			name,
			url: SITE_URL,
			logo: { '@type': 'ImageObject', url: absoluteUrl('/favicon/web-app-manifest-512x512.png'), width: 512, height: 512 },
			description: settings?.siteDescription,
			email,
			telephone: settings?.phone,
			address: settings?.address ? { '@type': 'PostalAddress', streetAddress: settings.address, addressCountry: 'FR' } : undefined,
			areaServed: [{ '@type': 'Country', name: 'France' }, { '@type': 'Place', name: 'European Union' }],
			knowsLanguage: ctx.languages,
			contactPoint:
				email || settings?.phone
					? {
							'@type': 'ContactPoint',
							contactType: 'customer support',
							email,
							telephone: settings?.phone,
							availableLanguage: ['fr', 'en'],
						}
					: undefined,
			sameAs: sameAs?.length ? sameAs : undefined,
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

interface PlanData {
	name: string;
	price: string;
	monthlyPrice?: string;
	description?: string;
	features?: string[];
}

function softwareApplication(ctx: SiteContext, sections: Section[], url: string): JsonLd | undefined {
	const plans: PlanData[] = sections.flatMap((s) => (s.plans ?? []).filter(Boolean));
	if (!plans.length) return undefined;
	const offer = (plan: PlanData, value: string | undefined, unit: 'MON' | 'ANN') => {
		const price = value ? parsePrice(value) : undefined;
		if (!price) return undefined;
		return {
			'@type': 'Offer',
			name: `${plan.name} (${unit === 'MON' ? 'mensuel' : 'annuel'})`,
			description: plan.description ?? plan.features?.[0]?.trim(),
			...price,
			priceSpecification: {
				'@type': 'UnitPriceSpecification',
				...price,
				valueAddedTaxIncluded: true,
				referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: unit },
			},
			availability: 'https://schema.org/InStock',
			eligibleRegion: { '@type': 'Place', name: 'European Union' },
			url: `${url}#pricing`,
		};
	};
	const offers = plans.flatMap((plan) => [offer(plan, plan.monthlyPrice, 'MON'), offer(plan, plan.price, 'ANN')]).filter(Boolean);
	// Every plan has the same features, so the first plan's list describes the product
	const featureList = plans[0]?.features?.map((f) => f.trim()).filter((f) => !/\d/.test(f));
	return {
		'@type': 'SoftwareApplication',
		'@id': `${SITE_URL}/#software`,
		name: ctx.layout.settings?.siteName ?? 'Formwise',
		applicationCategory: 'BusinessApplication',
		applicationSubCategory: 'Association management software',
		operatingSystem: 'Web',
		description: ctx.layout.settings?.siteDescription,
		url,
		inLanguage: ctx.lang,
		availableLanguage: ctx.languages,
		audience: { '@type': 'Audience', audienceType: 'Associations loi 1901, clubs sportifs, bénévoles' },
		featureList: featureList?.length ? featureList : undefined,
		publisher: { '@id': organizationId },
		offers: offers.length ? offers : undefined,
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
