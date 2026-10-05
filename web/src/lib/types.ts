import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImage } from './sanity';

export interface Link {
	linkType?: 'internal' | 'anchor' | 'external';
	anchor?: string;
	url?: string;
	openInNewTab?: boolean;
	target?: { _id: string; _type: 'page' | 'post'; slug?: string } | null;
}

export interface Button {
	label?: string;
	link?: Link;
}

export interface NavItem extends Button {
	_key: string;
}

export type RichText = PortableTextBlock[];

export interface Seo {
	title?: string;
	description?: string;
	image?: SanityImage;
	noIndex?: boolean;
}

export interface Strings {
	readMore?: string;
	backToBlog?: string;
	publishedOn?: string;
	minutesRead?: string;
	relatedPosts?: string;
	allCategories?: string;
	noPosts?: string;
	language?: string;
	menu?: string;
	close?: string;
	backToTop?: string;
	skipToContent?: string;
	notFoundTitle?: string;
	notFoundText?: string;
	backHome?: string;
	formSuccess?: string;
}

export interface Settings {
	siteName?: string;
	siteDescription?: string;
	email?: string;
	phone?: string;
	address?: string;
	socialLinks?: { _key: string; platform: string; url: string }[];
	strings?: Strings;
	seo?: Seo;
	homePageId?: string;
	blogPageId?: string;
}

export interface Header {
	navigation?: NavItem[];
	loginButton?: Button;
	ctaButton?: Button;
}

export interface Footer {
	ctaHeading?: string;
	ctaText?: string;
	ctaPrimary?: Button;
	ctaSecondary?: Button;
	tagline?: string;
	columns?: { _key: string; title: string; links?: NavItem[] }[];
	copyright?: string;
}

export interface LayoutData {
	settings: Settings | null;
	header: Header | null;
	footer: Footer | null;
}

export interface Translation {
	language: string;
	_type: string;
	slug?: string;
}

// Page builder sections: every section has these plus its own fields
export interface Section {
	_key: string;
	_type: string;
	anchorId?: string;
	[field: string]: any;
}

export interface Page {
	_id: string;
	_type: 'page';
	title: string;
	slug?: string;
	language: string;
	seo?: Seo;
	sections?: Section[];
	translations?: (Translation | null)[];
}

export interface PostCard {
	_id: string;
	title: string;
	slug: string;
	excerpt?: string;
	coverImage?: SanityImage;
	publishedAt: string;
	author?: { name: string; role?: string; image?: SanityImage } | null;
	categories?: { _id: string; title: string; slug?: string }[];
	readingTime?: number;
}

export interface Post extends PostCard {
	_type: 'post';
	language: string;
	body?: RichText;
	seo?: Seo;
	translations?: (Translation | null)[];
	related?: PostCard[];
}
