import { defineQuery } from 'groq';

// Shared documents (FAQs, plans, testimonials…) are referenced from the base language.
// These helpers swap a reference for its translation in $lang, falling back to the original.
// Metadata entries store their language in `language` (older entries use `_key`).
const localizedField = (field: string) =>
	`coalesce(*[_type == "translation.metadata" && references(^.${field}._ref)][0].translations[coalesce(language, _key) == $lang][0].value->, ${field}->)`;
const localizedItem = `coalesce(*[_type == "translation.metadata" && references(^._ref)][0].translations[coalesce(language, _key) == $lang][0].value->, @->)`;

const LINK = `{
	linkType,
	anchor,
	url,
	openInNewTab,
	"target": ${localizedField('internal')}{_id, _type, "slug": slug.current}
}`;
const BUTTON = `{label, "link": link${LINK}}`;
const RICH_TEXT = `[]{
	...,
	markDefs[]{..., _type == "link" => ${LINK}}
}`;

const SECTIONS = `sections[]{
	...,
	_type == "heroSection" => {"cta": cta${BUTTON}},
	_type == "ctaSection" => {"primaryCta": primaryCta${BUTTON}, "secondaryCta": secondaryCta${BUTTON}},
	_type == "testimonialsSection" => {
		"testimonials": testimonials[]{...${localizedItem}{_id, quote, name, role, rating}}
	},
	_type == "pricingSection" => {
		"plans": plans[]{...${localizedItem}{_id, name, monthlyPrice, monthlyPriceDetails, price, priceDetails, description, features, featured, badge, "cta": cta${BUTTON}}}
	},
	_type == "faqSection" => {
		"faqs": faqs[]{...${localizedItem}{_id, question, topic, "answer": answer${RICH_TEXT}}}
	},
	_type in ["richTextSection", "imageTextSection"] => {"body": body${RICH_TEXT}},
	_type == "postListSection" => {
		// Translated posts keep pointing at the base-language category, so match every version of it
		"categoryIds": coalesce(
			*[_type == "translation.metadata" && references(^.category._ref)][0].translations[].value._ref,
			[category._ref]
		)
	}
}`;

const SEO = `seo{title, description, image, noIndex}`;
const TRANSLATIONS = `"translations": *[_type == "translation.metadata" && references(^._id)][0].translations[].value->{language, _type, "slug": slug.current}`;

// Languages that have general settings, i.e. a website to build
export const LANGUAGES_QUERY = defineQuery(
	`array::unique(*[_type == "settings" && defined(language)].language)`,
);

// Singletons fall back to English until a translation exists
const singleton = (type: string) => `coalesce(*[_id == "${type}-" + $lang][0], *[_id == "${type}-en"][0])`;

export const LAYOUT_QUERY = defineQuery(`{
	"integrations": *[_id == "integrations"][0]{
		googleSiteVerification,
		bingSiteVerification,
		googleTagManagerId,
		"axeptio": axeptio{clientId, cookiesVersions[]{language, version}}
	},
	"settings": ${singleton('settings')}{
		siteName,
		siteDescription,
		email,
		phone,
		address,
		socialLinks,
		strings,
		${SEO},
		"homePageId": ${localizedField('homePage')}._id,
		"blogPageId": ${localizedField('blogPage')}._id
	},
	"header": ${singleton('header')}{
		"navigation": navigation[]{_key, label, "link": link${LINK}},
		"loginButton": loginButton${BUTTON},
		"ctaButton": ctaButton${BUTTON}
	},
	"footer": ${singleton('footer')}{
		ctaHeading,
		ctaText,
		"ctaPrimary": ctaPrimary${BUTTON},
		"ctaSecondary": ctaSecondary${BUTTON},
		tagline,
		"columns": columns[]{_key, title, "links": links[]{_key, label, "link": link${LINK}}},
		copyright
	}
}`);

const PAGE_FIELDS = `_id, _type, _updatedAt, title, "slug": slug.current, language, ${SEO}, ${SECTIONS}, ${TRANSLATIONS}`;

export const PAGE_BY_ID_QUERY = defineQuery(`*[_id == $id][0]{${PAGE_FIELDS}}`);

export const PAGE_BY_SLUG_QUERY = defineQuery(
	`*[_type == "page" && language == $lang && slug.current == $slug][0]{${PAGE_FIELDS}}`,
);

const POST_CARD = `_id, title, "slug": slug.current, excerpt, coverImage, publishedAt,
	"author": ${localizedField('author')}{name, role, image},
	"categories": categories[]{...${localizedItem}{_id, title, "slug": slug.current}},
	"readingTime": round(length(pt::text(body)) / 5 / 200)`;

export const POSTS_QUERY = defineQuery(
	`*[_type == "post" && language == $lang && (!defined($categoryIds) || count(categories[_ref in $categoryIds]) > 0)] | order(publishedAt desc){${POST_CARD}}`,
);

export const POST_QUERY = defineQuery(`*[_type == "post" && language == $lang && slug.current == $slug][0]{
	${POST_CARD},
	_type,
	_updatedAt,
	language,
	"body": body${RICH_TEXT},
	${SEO},
	${TRANSLATIONS},
	"related": *[_type == "post" && language == $lang && slug.current != $slug] | order(publishedAt desc)[0...3]{${POST_CARD}}
}`);

// Everything that belongs in the sitemap, with its translation group to link language versions
export const SITEMAP_QUERY = defineQuery(
	`*[_type in ["page", "post"] && language in $languages && defined(slug.current)]{
		_id, _type, language, "slug": slug.current, _updatedAt, "noIndex": seo.noIndex,
		"group": *[_type == "translation.metadata" && references(^._id)][0]._id
	}`,
);

// Plain-text summary of the site for AI assistants (llms.txt), in the base language
export const LLMS_QUERY = defineQuery(`{
	"pages": *[_type == "page" && language == $lang && defined(slug.current) && seo.noIndex != true]{
		_id, title, "slug": slug.current, "description": seo.description
	},
	"posts": *[_type == "post" && language == $lang && defined(slug.current)] | order(publishedAt desc){
		title, "slug": slug.current, excerpt, publishedAt
	},
	"plans": *[_type == "plan" && language == $lang]{name, monthlyPrice, monthlyPriceDetails, price, priceDetails, description, features, featured} | order(featured desc),
	"faqs": *[_type == "faq" && language == $lang]{question, answer}
}`);
