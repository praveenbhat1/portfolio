import { qsa } from './utils/dom.js'
import { prefersReducedMotion } from './utils/motion.js'

/**
 * Cursor-following radial highlight on card surfaces.
 *
 * One delegated pointermove for the whole page — each card only reads its own
 * rect while the pointer is actually inside it, and the effect is expressed as
 * two CSS custom properties so the paint work stays in the compositor.
 */
const SELECTOR = '.bento-card, .tl-card, .code-float'

export function initSpotlight() {
  if (prefersReducedMotion()) return
  if (window.matchMedia('(pointer: coarse)').matches) return

  const cards = qsa(SELECTOR)
  if (!cards.length) return

  cards.forEach((card) => card.classList.add('has-spotlight'))

  let active = null

  document.addEventListener(
    'pointermove',
    (e) => {
      const card = e.target.closest(SELECTOR)

      if (card !== active) {
        if (active) active.style.setProperty('--spot-opacity', '0')
        active = card
      }
      if (!card) return

      const r = card.getBoundingClientRect()
      card.style.setProperty('--spot-x', `${e.clientX - r.left}px`)
      card.style.setProperty('--spot-y', `${e.clientY - r.top}px`)
      card.style.setProperty('--spot-opacity', '1')
    },
    { passive: true }
  )

  document.addEventListener('pointerleave', () => {
    if (active) active.style.setProperty('--spot-opacity', '0')
    active = null
  })
}
