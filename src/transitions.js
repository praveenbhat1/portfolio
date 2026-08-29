import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll page-transition — inspired by Animmaster/scroll-section-animation.
 * Blocks enter from a slight rotation (un-skewing into place) as they scroll
 * into view, scrubbed to the scroll position. Kept subtle so text stays legible,
 * and scoped to normal-flow blocks so it never touches the pinned Work section.
 */
export function initPageTransitions() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  gsap.utils.toArray('.reveal-rotate').forEach((el) => {
    const side = el.dataset.side === 'right' ? 1 : -1

    gsap.fromTo(
      el,
      {
        rotate: 6 * side,
        y: 60,
        opacity: 0,
        transformOrigin: side === 1 ? 'bottom right' : 'bottom left',
      },
      {
        rotate: 0,
        y: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'top 55%',
          scrub: true,
        },
      }
    )
  })
}
