// Figma prototype easings, so on-page motion matches what the designer set in Smart animate.

export interface SpringConfig {
	mass: number;
	stiffness: number;
	damping: number;
}

// Samples a spring going from 0 to 1, from rest, until it settles. Returns its duration and
// evenly spaced progress values, used as keyframes so every browser plays the same curve.
export function spring({ mass, stiffness, damping }: SpringConfig, samples = 90) {
	const dt = 1 / 1000;
	let x = 0;
	let v = 0;
	const curve = [0];
	// Settled once within 0.1% of the target and moving slower than 1% of the distance per second
	while (Math.abs(1 - x) > 0.001 || Math.abs(v) > 0.01) {
		v += ((-stiffness * (x - 1) - damping * v) / mass) * dt;
		x += v * dt;
		curve.push(x);
	}
	curve[curve.length - 1] = 1;
	const duration = (curve.length - 1) * dt * 1000;
	const progress = Array.from({ length: samples + 1 }, (_, i) => curve[Math.round((i / samples) * (curve.length - 1))]);
	return { duration, progress };
}

// One Smart animate step with a spring: `frame` turns progress (0 → 1) into a keyframe
export function springAnimate(el: Element, config: SpringConfig, frame: (p: number) => Keyframe) {
	const { duration, progress } = spring(config);
	return el.animate(progress.map(frame), { duration, easing: 'linear', fill: 'forwards' }).finished;
}

// CSS-style cubic-bezier as a function of time (0 → 1), for motion driven from JS like scrolling
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
	const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
	return (x: number) => {
		// Bisection is plenty precise for a few dozen frames
		let lo = 0;
		let hi = 1;
		for (let i = 0; i < 30; i++) {
			const mid = (lo + hi) / 2;
			if (at(x1, x2, mid) < x) lo = mid;
			else hi = mid;
		}
		return at(y1, y2, (lo + hi) / 2);
	};
}

// Figma's "Ease in and out"
export const easeInOut = cubicBezier(0.42, 0, 0.58, 1);

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
