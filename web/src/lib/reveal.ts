// Headings (every section <h2>, or anything marked data-reveal="lines") slide up line by line
// from behind a mask as each one scrolls into view. Applies to new sections automatically. The
// hero and the word wheel have their own motion; anything inside [data-no-reveal] is left alone.
//
// Body text (paragraphs, eyebrows) used to fade up alongside the heading, but that opacity
// animation could leave text stuck invisible — e.g. scrolling past its trigger faster than the
// animation could finish — so it's gone; that content just renders normally, no reveal.
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
					// Scrolling faster than the 1.1s duration would otherwise leave the lines
					// stranded mid-animation once the trigger is scrolled past; this snaps them
					// straight to the finished (visible) state instead.
					scrollTrigger: { trigger: heading, start: START, once: true, fastScrollEnd: true },
				}),
		});
	});

	// Positioned using the layout at this exact moment, which is before the web fonts have
	// necessarily finished loading; a font swap shifts line wraps and heading heights, so
	// without this, triggers below the shift stay pinned to their stale (pre-swap) position.
	document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
