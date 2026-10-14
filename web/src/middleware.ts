import { defineMiddleware } from 'astro:middleware';
import { PERSPECTIVE_COOKIE, PREVIEW_COOKIE, parsePerspective, previewSecret, previewStorage } from './lib/preview';

// A request is a preview when it carries the secret cookie set by /api/draft-mode/enable
export const onRequest = defineMiddleware(async (context, next) => {
	const isPreview =
		!context.isPrerendered && !!previewSecret && context.cookies.get(PREVIEW_COOKIE)?.value === previewSecret;
	if (!isPreview) return previewStorage.run(null, next);

	const preview = { perspective: parsePerspective(context.cookies.get(PERSPECTIVE_COOKIE)?.value) };
	const response = await previewStorage.run(preview, next);
	// Drafts must never end up in a shared cache
	response.headers.set('Cache-Control', 'private, no-store');
	return response;
});
