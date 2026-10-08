# Formwise website

| Folder | What it is |
|---|---|
| `web/` | Astro website. Every page is built from Sanity content. |
| `studio/` | Sanity Studio, where content is edited. |
| `functions/translate/` | Sanity Function that translates published English content into the other 23 EU languages. |

## Running locally

```sh
cd studio && npm run dev      # Studio on http://localhost:3333
cd web && npm run dev         # Website on http://localhost:4321
```

Pages are rendered on Vercel when visited and cached for 60 seconds (ISR). Anything published in Sanity, including translations, appears on the website within about a minute: no rebuild or deploy needed. Code changes still deploy as usual when pushed.

## Content structure

- **General management**: site name, home and blog page, contact details, social links, interface text and default SEO. One document per language.
- **Header / Footer**: navigation, buttons, footer columns. One document per language.
- **Pages**: built from sections (hero, page header, pricing, FAQ, contact form, blog list, rich text…). Sections can be added, removed and reordered on any page.
- **Blog**: posts, categories and authors.
- **Shared content**: FAQs, testimonials and pricing plans, reused across pages.

URLs: `/en/`, `/en/about/`, `/en/blog/`, `/en/blog/<post>/`. A language only appears on the website once its **General management** document exists.

## Translations

Content is written in English. Each language has its own copy of every document.

- **Automatic (recommended):** the `translate` Function translates an English document into all 23 other languages every time it is published. Translations are published straight away; set `PUBLISH_TRANSLATIONS = false` in `functions/translate/index.ts` to review them as drafts first.
- **Manual:** in the Studio, open a document in another language and use **AI Assist → Translate document**, or edit by hand.

Both use Sanity AI (Agent Actions / AI Assist), included in the Growth plan.

Re-publishing an English document re-translates it and **overwrites manual edits in the other languages**.

The Function is deployed to the `production` Stack. After changing the schema or the Function:

```sh
cd studio && npx sanity schema deploy     # Agent Actions read the deployed schema
cd .. && npx sanity blueprints deploy     # redeploys the Function
```

Useful commands: `npx sanity functions logs translate`, and `npm run functions:test -- --document-id <id>` to translate one existing document by hand.

## Starter content

`studio/scripts/seed.ts` created the English content (`npx sanity exec scripts/seed.ts --with-user-token`). It only runs on an empty dataset.
