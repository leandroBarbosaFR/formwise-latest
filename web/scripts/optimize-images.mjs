// Creates lightweight WebP versions of the decorative images in public/figma.
// Run after replacing any of them: node scripts/optimize-images.mjs
import sharp from 'sharp';

const dir = new URL('../public/figma/', import.meta.url).pathname;

// [file, width in px, quality]. Widths cover the largest size each image is displayed at (2× for retina).
// The blurred backgrounds are shown behind a 102px blur, so a small file looks identical.
const images = [
	['hero-bg-1.png', 800, 70],
	['hero-bg-2.png', 1400, 72],
	['dash-bg.png', 1600, 72],
	['feat-blur-1.jpg', 900, 60],
	['feat-blur-2.jpg', 900, 60],
	['feat-blur-3.jpg', 900, 60],
	...['115', '116', '117', '118', '119', '121', '122', '123', '124', '125'].map((n) => [`avatar-${n}.png`, 360, 78]),
];

for (const [file, width, quality] of images) {
	const output = file.replace(/\.(png|jpe?g)$/, '.webp');
	const info = await sharp(dir + file).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(dir + output);
	console.log(`${output}: ${Math.round(info.size / 1024)} KB`);
}
