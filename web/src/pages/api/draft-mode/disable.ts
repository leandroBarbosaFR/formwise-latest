import type { APIRoute } from 'astro';
import { PERSPECTIVE_COOKIE, PREVIEW_COOKIE } from '../../../lib/preview';

// Back to the public site: /api/draft-mode/disable?redirect=/fr/
export const GET: APIRoute = ({ cookies, redirect, url }) => {
	const options = { path: '/', secure: true, sameSite: 'none', partitioned: true } as const;
	cookies.delete(PREVIEW_COOKIE, options);
	cookies.delete(PERSPECTIVE_COOKIE, options);
	const target = url.searchParams.get('redirect');
	return redirect(target?.startsWith('/') && !target.startsWith('//') ? target : '/', 307);
};
