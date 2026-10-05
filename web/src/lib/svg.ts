// Inlines an SVG from Sanity so CSS can colour it: every fill/stroke colour becomes
// `currentColor`, so the icon takes the text colour of its container.
const cache = new Map<string, Promise<string | null>>();

async function load(url: string): Promise<string | null> {
	const response = await fetch(url).catch(() => null);
	if (!response?.ok) return null;
	const source = await response.text();
	if (!source.includes('<svg')) return null;

	return (
		source
			// Editors upload these files, but never let markup run code on the website
			.replace(/<script[\s\S]*?<\/script>/gi, '')
			.replace(/\son\w+="[^"]*"/gi, '')
			.replace(/<\?xml[^>]*>/i, '')
			// Colours in attributes and in inline styles
			.replace(/\b(fill|stroke)="(?!none|currentColor)[^"]*"/gi, '$1="currentColor"')
			.replace(/\b(fill|stroke)\s*:\s*(?!none|currentColor)[^;"]+/gi, '$1:currentColor')
			// Size is set by the container
			.replace(/<svg\b([^>]*)>/i, (_, attrs: string) => {
				const rest = attrs.replace(/\s(width|height|class)="[^"]*"/gi, '');
				return `<svg${rest} width="100%" height="100%" aria-hidden="true" focusable="false">`;
			})
	);
}

export function inlineSvg(url: string) {
	if (!cache.has(url)) cache.set(url, load(url));
	return cache.get(url)!;
}
