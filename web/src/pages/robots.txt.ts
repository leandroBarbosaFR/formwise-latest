import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/seo';

// Search engines and AI assistants (which increasingly answer questions by citing websites)
// are all welcome to read the site. Listed explicitly so the intent is clear to each crawler.
const AI_CRAWLERS = [
	'GPTBot',
	'OAI-SearchBot',
	'ChatGPT-User',
	'ClaudeBot',
	'Claude-SearchBot',
	'Claude-User',
	'PerplexityBot',
	'Perplexity-User',
	'Google-Extended',
	'Applebot-Extended',
	'Bingbot',
	'DuckAssistBot',
	'MistralAI-User',
];

export const GET: APIRoute = () => {
	const lines = [
		'User-agent: *',
		'Allow: /',
		'',
		...AI_CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
		`Sitemap: ${absoluteUrl('/sitemap.xml')}`,
		'',
	];
	return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
