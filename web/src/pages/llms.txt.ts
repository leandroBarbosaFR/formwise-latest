import type { APIRoute } from 'astro';
import { toPlainText } from 'astro-portabletext';
import { sanityClient } from 'sanity:client';
import { getLanguages, getLayout } from '../lib/data';
import { BASE_LANGUAGE, languageName } from '../lib/languages';
import { blogPath, homePath, pagePath, postPath } from '../lib/links';
import { LLMS_QUERY } from '../lib/queries';
import { absoluteUrl } from '../lib/seo';
import type { RichText } from '../lib/types';

interface LlmsData {
	pages: { _id: string; title: string; slug: string; description?: string }[];
	posts: { title: string; slug: string; excerpt?: string; publishedAt: string }[];
	plans: { name: string; monthlyPrice?: string; monthlyPriceDetails?: string[]; price: string; priceDetails?: string[]; description?: string; features?: string[] }[];
	faqs: { question: string; answer?: RichText }[];
}

// llms.txt (https://llmstxt.org): a concise, plain-text guide to the site for AI assistants,
// so they describe Formwise accurately and link to the right pages.
export const GET: APIRoute = async () => {
	const lang = BASE_LANGUAGE;
	const [languages, { settings }, data] = await Promise.all([
		getLanguages(),
		getLayout(lang),
		sanityClient.fetch<LlmsData>(LLMS_QUERY, { lang }),
	]);

	const pathOf = (page: LlmsData['pages'][number]) =>
		page._id === settings?.homePageId ? homePath(lang) : page._id === settings?.blogPageId ? blogPath(lang) : pagePath(lang, page.slug);
	const pages = [...data.pages].sort((a, b) => Number(b._id === settings?.homePageId) - Number(a._id === settings?.homePageId));

	const sections = [
		`# ${settings?.siteName ?? 'Formwise'}`,
		settings?.siteDescription && `> ${settings.siteDescription}`,
		`The website is available in ${languages.length} languages: ${languages.map((l) => `${languageName(l)} (${absoluteUrl(homePath(l))})`).join(', ')}.`,
		'## Pages',
		pages.map((page) => `- [${page.title}](${absoluteUrl(pathOf(page))})${page.description ? `: ${page.description}` : ''}`).join('\n'),
		data.posts.length > 0 && '## Blog',
		data.posts
			.map((post) => `- [${post.title}](${absoluteUrl(postPath(lang, post.slug))})${post.excerpt ? `: ${post.excerpt}` : ''}`)
			.join('\n'),
		data.plans.length > 0 && '## Pricing',
		data.plans
			.map((plan) =>
				[
					`### ${plan.name}`,
					plan.monthlyPrice && `Monthly: ${plan.monthlyPrice}`,
					...(plan.monthlyPriceDetails ?? []),
					`Yearly: ${plan.price}`,
					...(plan.priceDetails ?? []),
					plan.description,
					...(plan.features ?? []).map((feature) => `- ${feature}`),
				]
					.filter(Boolean)
					.join('\n'),
			)
			.join('\n\n'),
		data.faqs.length > 0 && '## Frequently asked questions',
		data.faqs.map((faq) => `### ${faq.question}\n${faq.answer ? toPlainText(faq.answer) : ''}`).join('\n\n'),
		(settings?.email || settings?.phone) && '## Contact',
		[settings?.email && `- Email: ${settings.email}`, settings?.phone && `- Phone: ${settings.phone}`].filter(Boolean).join('\n'),
	];

	return new Response(sections.filter(Boolean).join('\n\n') + '\n', {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
