import { AsyncLocalStorage } from 'node:async_hooks';
import type { ClientPerspective, QueryParams } from '@sanity/client';
import { sanityClient } from 'sanity:client';

// Preview mode is what the Studio's Presentation tab shows: drafts instead of published content,
// with invisible markers (stega) in the text so clicking it opens the right field in the Studio.
// It is turned on per visitor by /api/draft-mode/enable; everyone else gets the cached public site.

// Shared with Vercel: this cookie, holding this secret, also makes Vercel skip its page cache
export const PREVIEW_COOKIE = '__prerender_bypass';
export const PERSPECTIVE_COOKIE = 'sanity-preview-perspective';
export const previewSecret = import.meta.env.SANITY_PREVIEW_SECRET as string | undefined;
const token = import.meta.env.SANITY_API_READ_TOKEN as string | undefined;

export interface Preview {
	perspective: ClientPerspective;
}

// Set by the middleware for each request, so any code can tell whether it is rendering a preview
export const previewStorage = new AsyncLocalStorage<Preview | null>();
export const getPreview = () => previewStorage.getStore() ?? null;

// The cookie value is either "drafts", "published" or a comma-separated stack of releases
export const parsePerspective = (value: string | undefined): ClientPerspective =>
	!value ? 'drafts' : value.includes(',') ? value.split(',') : (value as ClientPerspective);

// Fields used in code (comparisons, URLs, <head>), not shown as text. Markers would break them.
const NO_STEGA_FIELDS = new Set([
	'language',
	'defaultBilling',
	'imagePosition',
	'illustration',
	'linkType',
	'anchor',
	'url',
	'platform',
	'anchorId',
	'seo',
	'email',
	'phone',
	'siteName',
	'siteDescription',
]);

export function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T> {
	const preview = getPreview();
	if (!preview || !token) return sanityClient.fetch<T>(query, params);
	return sanityClient.fetch<T>(query, params, {
		token,
		perspective: preview.perspective,
		useCdn: false,
		stega: {
			enabled: true,
			studioUrl: import.meta.env.PUBLIC_SANITY_STUDIO_URL ?? 'http://localhost:3333',
			filter: (props) =>
				props.sourceDocument?._type !== 'integrations' &&
				!props.sourcePath.some((segment) => typeof segment === 'string' && NO_STEGA_FIELDS.has(segment)) &&
				props.filterDefault(props),
		},
	});
}
