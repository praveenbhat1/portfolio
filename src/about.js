import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './utils/motion.js'
gsap.registerPlugin(ScrollTrigger)

export function initAbout() {
  if (prefersReducedMotion()) {
    // Still light up the timeline nodes and show the bio — just without the
    // scrubbed spine, the drift-in cards or the staggered clip reveals.
    document.querySelectorAll('.tl-item').forEach((item) => item.classList.add('is-on'))
    const bio = document.querySelector('.about-bio')
    if (bio) bio.style.opacity = '1'
    const fill = document.querySelector('#tlSpineFill')
    if (fill) fill.style.transform = 'scaleY(1)'
    return
  }

  // ── 1. Heading clip reveal ────────────────────────────
  gsap.from('.about-title .at-line', {
    y: 80, opacity: 0,
    clipPath: 'inset(0 0 100% 0)',
    stagger: 0.14, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-title', start: 'top 80%', once: true }
  })
  gsap.to('.about-bio', {
    opacity: 1, duration: 0.8,
    scrollTrigger: { trigger: '.about-bio', start: 'top 85%', once: true }
  })

  // ── 2. Journey timeline ────────────────────────────────
  const track = document.querySelector('.tl-track')
  if (!track) return

  // Legend chips pop in
  gsap.from('.tl-chip', {
    y: 16, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08,
    scrollTrigger: { trigger: '.tl-legend', start: 'top 88%', once: true }
  })

  // Spine fills with accent as you travel down the timeline
  gsap.to('#tlSpineFill', {
    scaleY: 1, ease: 'none',
    scrollTrigger: {
      trigger: track,
      start: 'top 62%',
      end: 'bottom 68%',
      scrub: 0.6,
    }
  })

  // Cards drift in from their side; years fade; nodes ignite
  gsap.utils.toArray('.tl-item').forEach((item) => {
    const fromLeft = item.dataset.side === 'left'
    const card = item.querySelector('.tl-card')
    const year = item.querySelector('.tl-year')

    gsap.from(card, {
      x: fromLeft ? -48 : 48, opacity: 0,
      duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 84%', once: true }
    })
    gsap.from(year, {
      opacity: 0, y: 14, duration: 0.6, ease: 'power2.out', delay: 0.15,
      scrollTrigger: { trigger: item, start: 'top 84%', once: true }
    })

    // Node lights up when the spine reaches it
    ScrollTrigger.create({
      trigger: item,
      start: 'top 62%',
      onEnter: () => item.classList.add('is-on'),
      onLeaveBack: () => item.classList.remove('is-on'),
    })
  })
}
