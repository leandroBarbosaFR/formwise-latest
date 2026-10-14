import { validatePreviewUrl } from '@sanity/preview-url-secret';
import type { APIRoute } from 'astro';
import { sanityClient } from 'sanity:client';
import { PERSPECTIVE_COOKIE, PREVIEW_COOKIE, previewSecret } from '../../../lib/preview';

// Called by the Studio's Presentation tab with a short-lived secret. Once the secret is checked
// with Sanity, the visitor gets the preview cookie and is sent to the page they want to see.
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
	const token = import.meta.env.SANITY_API_READ_TOKEN;
	if (!token || !previewSecret) {
		return new Response('Preview is not configured: set SANITY_API_READ_TOKEN and SANITY_PREVIEW_SECRET', {
			status: 500,
		});
	}

	const client = sanityClient.withConfig({ token, useCdn: false });
	const { isValid, redirectTo = '/', studioPreviewPerspective } = await validatePreviewUrl(client, request.url);
	if (!isValid) return new Response('Invalid secret', { status: 401 });

	// The site is shown inside the Studio (another site), so the cookies must allow that
	const options = { path: '/', httpOnly: true, secure: true, sameSite: 'none', partitioned: true } as const;
	cookies.set(PREVIEW_COOKIE, previewSecret, options);
	cookies.set(PERSPECTIVE_COOKIE, studioPreviewPerspective ?? 'drafts', options);
	return redirect(redirectTo, 307);
};
