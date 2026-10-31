import type { APIRoute } from 'astro';
import { channelOf } from '../../lib/channel';

// Contact form submissions, sent to the team's inbox with Resend (https://resend.com/docs/api-reference/emails/send-email).
// Needs these environment variables on Vercel:
// - RESEND_API_KEY: API key from resend.com
// - CONTACT_EMAIL_TO: inbox that receives the messages
// - CONTACT_EMAIL_FROM: sender on a domain verified in Resend, e.g. "Formwise <contact@formwise.fr>"

const LIMITS = { name: 200, email: 320, organization: 200, message: 5000, lang: 5 };
// Lead attribution sent by the form script (see lib/tracking.ts), copied into the leads sheet
const SOURCE_FIELDS = [
	['page', 'Page du formulaire'],
	['landing_page', "Page d'arrivée"],
	['referrer', 'Site référent'],
	['utm_source', 'utm_source'],
	['utm_medium', 'utm_medium'],
	['utm_campaign', 'utm_campaign'],
	['utm_term', 'utm_term (mot-clé)'],
	['utm_content', 'utm_content'],
	['gclid', 'gclid (clic Google Ads)'],
	['gbraid', 'gbraid'],
	['wbraid', 'wbraid'],
] as const;

const reply = (status: number, body: Record<string, unknown>) =>
	new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
	const apiKey = import.meta.env.RESEND_API_KEY;
	const to = import.meta.env.CONTACT_EMAIL_TO;
	const from = import.meta.env.CONTACT_EMAIL_FROM;
	if (!apiKey || !to || !from) {
		console.error('Contact form: RESEND_API_KEY, CONTACT_EMAIL_TO or CONTACT_EMAIL_FROM is missing');
		return reply(500, { error: 'not-configured' });
	}

	const form = await request.formData().catch(() => null);
	if (!form) return reply(400, { error: 'invalid' });
	const field = (name: keyof typeof LIMITS) => String(form.get(name) ?? '').trim().slice(0, LIMITS[name]);

	// Bots fill in every field, including this one, which people never see
	if (String(form.get('website') ?? '').trim()) return reply(200, { ok: true });

	const name = field('name');
	const email = field('email');
	const organization = field('organization');
	const message = field('message');
	const lang = field('lang');
	if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, { error: 'invalid' });

	const source: Record<string, string> = {};
	for (const [key] of SOURCE_FIELDS) {
		const value = String(form.get(key) ?? '').trim().slice(0, 300);
		if (value) source[key] = value;
	}
	const channel = channelOf(source);

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			from,
			to: [to],
			reply_to: email,
			subject: `[Lead · ${channel}] ${name}${organization ? ` (${organization})` : ''}`,
			text: [
				`Nom : ${name}`,
				`E-mail : ${email}`,
				...(organization ? [`Association : ${organization}`] : []),
				...(lang ? [`Langue du site : ${lang}`] : []),
				'',
				message,
				'',
				'— Origine du contact —',
				`Source : ${channel}`,
				...SOURCE_FIELDS.filter(([key]) => source[key]).map(([key, label]) => `${label} : ${source[key]}`),
				'',
				// Tab-separated line: paste it into the "Leads" tab of the leads spreadsheet
				'Ligne pour le fichier des leads (à coller dans l’onglet Leads) :',
				[
					new Date().toISOString().slice(0, 10),
					name,
					email,
					organization,
					channel,
					source.utm_campaign ?? '',
					source.utm_term ?? '',
					source.landing_page ?? source.page ?? '',
					lang,
				]
					.map((value) => value.replace(/[\t\n]/g, ' '))
					.join('\t'),
			].join('\n'),
		}),
	}).catch(() => null);

	if (!response?.ok) {
		console.error('Contact form: Resend failed', response?.status, await response?.text().catch(() => ''));
		return reply(502, { error: 'send-failed' });
	}
	return reply(200, { ok: true });
};
