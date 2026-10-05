import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { sanityClient } from 'sanity:client';

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
	return builder.image(source).auto('format');
}

// Asset IDs encode the original size: image-<hash>-<width>x<height>-<ext>
export function imageDimensions(image?: { asset?: { _ref?: string } } | null) {
	const match = image?.asset?._ref?.match(/-(\d+)x(\d+)-/);
	return match ? { width: Number(match[1]), height: Number(match[2]) } : undefined;
}

export const hasImage = (image?: { asset?: { _ref?: string } } | null): image is SanityImage =>
	Boolean(image?.asset?._ref);

export interface SanityImage {
	_type?: string;
	asset: { _ref: string };
	alt?: string;
	hotspot?: unknown;
	crop?: unknown;
}
