// Text reveals for the sections after the hero, as each one scrolls into view:
// - headings (every section <h2>, or anything marked data-reveal="lines") slide up line by line
//   from behind a mask
// - the text next to a heading (eyebrow, intro paragraph), or anything marked data-reveal,
//   fades up just after it
// Applies to new sections automatically. The hero and the word wheel have their own motion;
// anything inside [data-no-reveal] is left alone.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const SCOPE = 'main section:not([data-word-wheel]), footer';
// Starts when the top of the text is 15% above the bottom of the screen
const START = 'top 85%';

export function initReveals() {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const inScope = (el: Element) => el.closest(SCOPE) && !el.closest('[data-no-reveal]');
	const headings = [...document.querySelectorAll<HTMLElement>(`:is(${SCOPE}) :is(h2, [data-reveal="lines"])`)].filter(inScope);
	const companions = new Set<HTMLElement>();

	headings.forEach((heading) => {
		// Re-splits when the font loads or the width changes, so lines always match the layout;
		// the returned animation is carried over to the new lines
		SplitText.create(heading, {
			type: 'lines',
			mask: 'lines',
			autoSplit: true,
			onSplit: (self) =>
				gsap.from(self.lines, {
					yPercent: 110,
					duration: 1.1,
					ease: 'power4.out',
					stagger: 0.09,
					// Hidden right away, not only once the trigger is reached (no flash of the final state)
					immediateRender: true,
					scrollTrigger: { trigger: heading, start: START, once: true },
				}),
		});

		// The paragraphs beside it (eyebrow above, intro text below) follow the heading in
		const beside = [...(heading.parentElement?.children ?? [])].filter(
			(el): el is HTMLElement => el !== heading && el.matches('p, [data-reveal]:not([data-reveal="lines"])'),
		);
		beside.forEach((el) => companions.add(el));
		if (beside.length) fadeUp(beside, heading, 0.25);
	});

	// Anything else marked data-reveal (e.g. an eyebrow that sits apart from its heading)
	const marked = [...document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal="lines"])')].filter(
		(el) => inScope(el) && !companions.has(el),
	);
	marked.forEach((el) => fadeUp([el], el, 0));
}

function fadeUp(targets: HTMLElement[], trigger: HTMLElement, delay: number) {
	gsap.from(targets, {
		y: 24,
		opacity: 0,
		duration: 0.9,
		ease: 'power3.out',
		delay,
		stagger: 0.08,
		immediateRender: true,
		scrollTrigger: { trigger, start: START, once: true },
	});
}
