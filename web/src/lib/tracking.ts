// Conversion tracking for Google Ads / GA4 (through Google Tag Manager) and lead attribution.
//
// Events pushed to the dataLayer (create matching triggers in GTM):
// - `generate_lead`  : the contact / demo form was sent (see Contact.astro)
// - `sign_up_click`  : a click to create an account or start the free trial on app.formwise.fr
// - `login_click`    : a click to log in on app.formwise.fr
//
// GTM only fires Google tags once the visitor accepts cookies (Consent Mode v2, see main.astro);
// the dataLayer itself is just an in-page array, so pushing to it is always fine.

const APP_HOST = 'app.formwise.fr';
const STORAGE_KEY = 'fw_source';
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'] as const;

export type LeadSource = Partial<Record<(typeof PARAMS)[number] | 'referrer' | 'landing_page', string>>;

declare global {
	interface Window {
		dataLayer?: Record<string, unknown>[];
	}
}

export function track(event: string, data: Record<string, unknown> = {}) {
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ event, ...data });
}

// Where this visit came from, kept for the browser tab session only so a contact form sent a few
// pages later is still attributed to the ad or search that brought the visitor
export function leadSource(): LeadSource {
	try {
		return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
	} catch {
		return {};
	}
}

function rememberSource() {
	try {
		if (sessionStorage.getItem(STORAGE_KEY)) return;
		const url = new URL(location.href);
		const source: LeadSource = { landing_page: url.pathname };
		for (const key of PARAMS) {
			const value = url.searchParams.get(key);
			if (value) source[key] = value.slice(0, 200);
		}
		if (document.referrer) {
			const referrer = new URL(document.referrer);
			if (referrer.host !== location.host) source.referrer = referrer.host;
		}
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(source));
	} catch {
		// Storage can be blocked (private mode, strict settings): tracking is best effort
	}
}

export function initTracking() {
	rememberSource();
	document.addEventListener('click', (event) => {
		const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
		if (!link) return;
		let url: URL;
		try {
			url = new URL(link.href);
		} catch {
			return;
		}
		if (url.host !== APP_HOST) return;
		const isLogin = /\/login/.test(url.pathname);
		track(isLogin ? 'login_click' : 'sign_up_click', {
			link_url: url.href,
			link_text: link.textContent?.trim().slice(0, 100),
			page_path: location.pathname,
		});
		// Pass the campaign on to the app so sign-ups can be attributed there too
		if (!isLogin) {
			const source = leadSource();
			for (const key of PARAMS) {
				const value = source[key];
				if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
			}
			link.href = url.href;
		}
	});
}
