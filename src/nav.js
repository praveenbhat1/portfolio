import { qs, qsa } from './utils/dom.js'
import { prefersReducedMotion } from './utils/motion.js'

/**
 * Navigation chrome: a reading-progress hairline, a nav bar that condenses into
 * a frosted pill once you leave the hero, active-section marking, and anchor
 * links routed through Lenis (a raw hash jump fights smooth scroll and lands
 * with a visible snap).
 */
export function initNav() {
  const nav = qs('.nav-bar')
  const progress = qs('#scrollProgress')
  const links = qsa('.nav-links a')
  // Pair each link with its section, then sort by document position. The nav
  // lists Work before About, but About sits first in the page — walking the
  // links in nav order marks the wrong section as active.
  const targets = links
    .map((link) => {
      const id = link.getAttribute('href')
      const el = id && id.startsWith('#') ? qs(id) : null
      return el ? { link, el } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.el.offsetTop - b.el.offsetTop)

  // ── Anchor links through Lenis ──────────────────────────────
  qsa('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href')
      if (!id || id === '#') return
      const target = qs(id)
      if (!target) return

      e.preventDefault()
      if (window.lenis) {
        window.lenis.scrollTo(target, { offset: 0, duration: 1.4 })
      } else {
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        })
      }
      history.replaceState(null, '', id)
    })
  })

  // ── Progress + condensed nav + active link ──────────────────
  let ticking = false

  function render() {
    ticking = false
    const scrollY = window.scrollY
    const max = document.documentElement.scrollHeight - window.innerHeight

    if (progress) {
      const pct = max > 0 ? Math.min(1, scrollY / max) : 0
      progress.style.transform = `scaleX(${pct.toFixed(4)})`
    }

    if (nav) nav.classList.toggle('is-condensed', scrollY > 80)

    if (targets.length) {
      const marker = scrollY + window.innerHeight * 0.35
      let active = null
      targets.forEach((t) => {
        if (t.el.offsetTop <= marker) active = t.link
      })
      links.forEach((link) => link.classList.toggle('is-active', link === active))
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(render)
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  render()
}
