import type { APIRoute } from 'astro';
import { channelOf } from '../../lib/channel';

// Logs each click on "Essai gratuit" / "Créer un compte" (sent by lib/tracking.ts) as a row of the
// "Clics Essai gratuit" tab of the sign-ups Google Sheet, through its Apps Script web app.
// The same sheet receives the accounts actually created, from app.formwise.fr, with the same
// click_id. Needs these environment variables on Vercel (same values as on the app):
// - SIGNUP_SHEET_WEBHOOK_URL: the Apps Script web app URL (…/exec)
// - SIGNUP_SHEET_SECRET: the shared secret checked by the script
// Nothing personal is logged here: only the page, the button and where the visit came from.

const FIELDS = [
	'click_id',
	'page',
	'button',
	'tier',
	'plan',
	'language',
	'landing_page',
	'referrer',
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_term',
	'utm_content',
	'gclid',
	'gbraid',
	'wbraid',
] as const;

// Same crawlers the contact form ignores: they follow links but are not visitors
const BOT_PATTERN = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

export const POST: APIRoute = async ({ request }) => {
	const webhookUrl = import.meta.env.SIGNUP_SHEET_WEBHOOK_URL;
	const secret = import.meta.env.SIGNUP_SHEET_SECRET;
	if (!webhookUrl || !secret) return new Response(null, { status: 204 });
	if (BOT_PATTERN.test(request.headers.get('user-agent') ?? '')) return new Response(null, { status: 204 });

	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') return new Response(null, { status: 400 });

	const click: Record<string, string> = {};
	for (const field of FIELDS) {
		const value = (body as Record<string, unknown>)[field];
		click[field] = typeof value === 'string' ? value.trim().slice(0, 300) : '';
	}
	if (!click.click_id) return new Response(null, { status: 400 });

	try {
		await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				secret,
				type: 'click',
				date: new Date().toISOString(),
				channel: channelOf(click),
				...click,
			}),
			signal: AbortSignal.timeout(4000),
		});
	} catch (error) {
		console.error('Sign-up click sheet:', error);
	}
	return new Response(null, { status: 204 });
};
