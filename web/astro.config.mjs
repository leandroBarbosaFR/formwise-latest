// @ts-check

import vercel from '@astrojs/vercel';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

// astro.config.mjs runs before Astro loads env vars, so read them with Vite's loadEnv
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
	process.env.NODE_ENV ?? 'development',
	process.cwd(),
	'',
);

// https://astro.build/config
export default defineConfig({
	// Production domain, used for canonical and hreflang URLs
	site: 'https://formwise.fr',
	// One URL per page (/en/about/), so search engines never see duplicates
	trailingSlash: 'always',
	// Pages are rendered on Vercel when visited and cached (ISR). Whatever is published in Sanity
	// shows up on the site within about a minute, with no rebuild or deploy needed.
	output: 'server',
	adapter: vercel({ isr: { expiration: 60 } }),
	integrations: [
		sanity({
			projectId: PUBLIC_SANITY_PROJECT_ID,
			dataset: PUBLIC_SANITY_DATASET,
			apiVersion: '2026-10-05',
			useCdn: false, // always the latest published content; Vercel's cache keeps pages fast
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
