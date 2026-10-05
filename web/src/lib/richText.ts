import { resolveHref, type LinkContext } from './links';
import type { Link, RichText } from './types';

// Adds an `href` to every link annotation so the renderer doesn't need the site context
export function withResolvedLinks(blocks: RichText | undefined, context: LinkContext): RichText {
	return (blocks ?? []).map((block) =>
		block._type === 'block' && Array.isArray(block.markDefs)
			? {
					...block,
					markDefs: block.markDefs.map((def) =>
						def._type === 'link' ? { ...def, href: resolveHref(def as Link, context) } : def,
					),
				}
			: block,
	);
}

// Rough reading time used on blog cards
export const minutesToRead = (minutes?: number) => Math.max(1, Math.round(minutes ?? 1));
