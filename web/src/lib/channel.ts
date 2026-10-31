// Same channels as the "Source" column of the leads sheet
export function channelOf(source: Record<string, string>) {
	const utm = (source.utm_source ?? '').toLowerCase();
	const medium = (source.utm_medium ?? '').toLowerCase();
	const referrer = (source.referrer ?? '').toLowerCase();
	if (source.gclid || source.gbraid || source.wbraid || (utm === 'google' && /cpc|ppc|paid/.test(medium))) return 'Google Ads';
	if (utm.includes('linkedin') || referrer.includes('linkedin')) return 'LinkedIn';
	if (/facebook|instagram|meta/.test(utm + referrer)) return 'Réseaux sociaux';
	if (medium === 'email' || utm.includes('newsletter')) return 'E-mail';
	if (/chatgpt|openai|perplexity|claude|gemini|copilot|mistral/.test(utm + referrer)) return 'IA (ChatGPT, Perplexity…)';
	if (/google|bing|duckduckgo|qwant|ecosia|yahoo/.test(referrer)) return 'Recherche Google (SEO)';
	if (referrer) return 'Site référent';
	return 'Direct';
}
