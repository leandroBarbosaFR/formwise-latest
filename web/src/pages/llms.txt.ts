import type { APIRoute } from 'astro';
import { toPlainText } from 'astro-portabletext';
import { getLanguages, getLayout } from '../lib/data';
import { BASE_LANGUAGE, languageName } from '../lib/languages';
import { blogPath, homePath, pagePath, postPath } from '../lib/links';
import { LLMS_QUERY } from '../lib/queries';
import { absoluteUrl, realEmail } from '../lib/seo';
import type { RichText } from '../lib/types';
import { sanityFetch } from '../lib/preview';

interface LlmsData {
	pages: { _id: string; title: string; slug: string; description?: string }[];
	posts: { title: string; slug: string; excerpt?: string; publishedAt: string }[];
	plans: { name: string; monthlyPrice?: string; monthlyPriceDetails?: string[]; price: string; priceDetails?: string[]; description?: string; features?: string[] }[];
	faqs: { question: string; answer?: RichText }[];
	highlights: { title?: string; text?: string }[] | null;
}

// llms.txt (https://llmstxt.org): a concise, plain-text guide to the site for AI assistants,
// so they describe Formwise accurately and link to the right pages.
export const GET: APIRoute = async () => {
	const lang = BASE_LANGUAGE;
	const [languages, { settings }] = await Promise.all([getLanguages(), getLayout(lang)]);
	const data = await sanityFetch<LlmsData>(LLMS_QUERY, { lang, homeId: settings?.homePageId ?? '' });
	const email = realEmail(settings?.email);
	const highlights = (data.highlights ?? []).filter((h) => h?.title);

	const pathOf = (page: LlmsData['pages'][number]) =>
		page._id === settings?.homePageId ? homePath(lang) : page._id === settings?.blogPageId ? blogPath(lang) : pagePath(lang, page.slug);
	const pages = [...data.pages].sort((a, b) => Number(b._id === settings?.homePageId) - Number(a._id === settings?.homePageId));

	const sections = [
		`# ${settings?.siteName ?? 'Formwise'}`,
		settings?.siteDescription && `> ${settings.siteDescription}`,
		[
			'Formwise est un logiciel de gestion d’association en ligne (SaaS), édité en France, pour les associations loi 1901, les clubs sportifs et culturels et leurs bénévoles.',
			'Il réunit dans une seule plateforme la gestion des membres et des adhésions, les cotisations et paiements en ligne (Stripe), les dons et reçus fiscaux, les événements et inscriptions, la trésorerie, le site internet de l’association, la boutique en ligne et la communication (e-mails, relances automatiques).',
			'Essai gratuit de 15 jours, sans carte bancaire et sans engagement. Données hébergées dans l’Union européenne, conformes au RGPD. Interface et traduction automatique des messages dans les 24 langues officielles de l’UE.',
			`Langue principale du site : français (${absoluteUrl(homePath(lang))}). Le site est aussi disponible en ${languages.length - 1} autres langues : ${languages.filter((l) => l !== lang).map((l) => `${languageName(l)} (${absoluteUrl(homePath(l))})`).join(', ')}.`,
		].join('\n\n'),
		highlights.length > 0 && '## Fonctionnalités',
		highlights.map((h) => `- **${h.title!.trim()}** : ${h.text?.trim() ?? ''}`).join('\n'),
		'## Pages',
		pages.map((page) => `- [${page.title}](${absoluteUrl(pathOf(page))})${page.description ? `: ${page.description}` : ''}`).join('\n'),
		data.posts.length > 0 && '## Blog',
		data.posts
			.map((post) => `- [${post.title}](${absoluteUrl(postPath(lang, post.slug))})${post.excerpt ? `: ${post.excerpt}` : ''}`)
			.join('\n'),
		data.plans.length > 0 && '## Tarifs (TTC)',
		data.plans
			.map((plan) =>
				[
					`### ${plan.name}`,
					plan.monthlyPrice && `Mensuel : ${plan.monthlyPrice} / mois`,
					...(plan.monthlyPriceDetails ?? []),
					`Annuel : ${plan.price} / an`,
					...(plan.priceDetails ?? []),
					plan.description,
					...(plan.features ?? []).map((feature) => `- ${feature}`),
				]
					.filter(Boolean)
					.join('\n'),
			)
			.join('\n\n'),
		data.faqs.length > 0 && '## Questions fréquentes',
		data.faqs.map((faq) => `### ${faq.question}\n${faq.answer ? toPlainText(faq.answer) : ''}`).join('\n\n'),
		'## Contact',
		[
			email && `- E-mail : ${email}`,
			settings?.phone && `- Téléphone : ${settings.phone}`,
			`- Formulaire de contact et demande de démo : ${absoluteUrl(pagePath(lang, 'contact'))}`,
			'- Connexion à l’application : https://app.formwise.fr/app/login',
		]
			.filter(Boolean)
			.join('\n'),
	];

	return new Response(sections.filter(Boolean).join('\n\n') + '\n', {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
